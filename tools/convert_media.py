"""Convert a poster/animation into the WebP files used by Latest Buzz and the hero slider.

Usage:
    python tools/convert_media.py <source file> <OutputName> [--news] [--slider] [--video]

    <source file>  PNG/JPG/WebP still, or an animated GIF/WebP (--news/--slider),
                   or an MP4/MOV clip (--video)
    <OutputName>   file name without extension, e.g. CSAvsBuckinghamASep20
    --news         write public/assets/images/news/<OutputName>.webp   (still, 1024px wide)
                   plus <OutputName>.jpg, which is what Instagram is given (it rejects WebP)
    --slider       write public/assets/images/slider/<OutputName>.webp (animated if the source is)
    --video        write public/assets/videos/<OutputName>.mp4 for the social Worker to post
                   to Facebook and Instagram Reels

With no flag, --news and --slider are written (--video is never implied: it takes a
different source file). Needs Pillow: python -m pip install --user pillow
"""
import argparse
import glob
import os
import re
import shutil
import subprocess
import sys

from PIL import Image, ImageSequence

PUBLIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
ROOT = os.path.join(PUBLIC, "assets", "images")
VIDEO_ROOT = os.path.join(PUBLIC, "assets", "videos")


def save_still(im, path, max_width, quality):
    im = im.convert("RGB")
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=quality, method=6)


def save_animated(src, path):
    # Keep every other frame with the same total duration: ~70% smaller, still readable.
    frames, durations = [], []
    for i, frame in enumerate(ImageSequence.Iterator(src)):
        d = frame.info.get("duration", 70)
        if i % 2 == 0:
            frames.append(frame.convert("RGBA"))
            durations.append(d)
        else:
            durations[-1] += d
    frames[0].save(path, "WEBP", save_all=True, append_images=frames[1:], duration=durations,
                   loop=0, quality=65, method=6, minimize_size=True)
    return sum(durations)


def save_social_jpeg(im, path, max_width, quality):
    # Instagram's Content Publishing API takes JPEG only, so the news still gets
    # a .jpg twin that the social Worker hands to Instagram.
    im = im.convert("RGB")
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=False)


def find_ffmpeg():
    """ffmpeg isn't on PATH on the maintainer's machine, but CapCut ships one."""
    found = os.environ.get("FFMPEG") or shutil.which("ffmpeg")
    if found:
        return found
    pattern = os.path.join(
        os.environ.get("LOCALAPPDATA", ""), "CapCut", "Apps", "*", "ffmpeg.exe"
    )
    candidates = sorted(glob.glob(pattern))
    if candidates:
        return candidates[-1]
    sys.exit(
        "No ffmpeg found. Install one and put it on PATH, or point the FFMPEG "
        "environment variable at a binary."
    )


def probe(ffmpeg, src):
    """Pull codec, fps, duration and audio presence out of `ffmpeg -i` output."""
    out = subprocess.run(
        [ffmpeg, "-hide_banner", "-i", src], capture_output=True, text=True
    ).stderr
    video = re.search(r"Stream #\d+:\d+.*: Video: (\w+).*?, (\w+).*?, (\d+)x(\d+)", out)
    fps = re.search(r"(\d+(?:\.\d+)?) fps", out)
    duration = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", out)
    seconds = None
    if duration:
        h, m, s = duration.groups()
        seconds = int(h) * 3600 + int(m) * 60 + float(s)
    return {
        "codec": video.group(1) if video else None,
        "pix_fmt": video.group(2) if video else None,
        "size": (int(video.group(3)), int(video.group(4))) if video else None,
        "fps": float(fps.group(1)) if fps else None,
        "duration": seconds,
        "has_audio": bool(re.search(r"Stream #\d+:\d+.*: Audio:", out)),
    }


def save_video(src, path):
    """Write an MP4 that satisfies Meta's Reel spec.

    Meta needs H.264 yuv420p, 23-60 fps, at least 3s, an AAC audio track and the
    moov atom at the front. Posters are usually already compliant H.264, so the
    video stream is copied rather than re-encoded; CapCut's ffmpeg has no
    libx264, so a non-compliant source falls back to a hardware encoder.
    """
    ffmpeg = find_ffmpeg()
    info = probe(ffmpeg, src)

    if info["duration"] is not None and info["duration"] < 3:
        sys.exit(f"Clip is {info['duration']:.1f}s; Meta rejects anything under 3s.")
    if info["fps"] is not None and not 23 <= info["fps"] <= 60:
        sys.exit(f"Clip is {info['fps']} fps; Meta needs 23-60.")

    compliant = info["codec"] == "h264" and info["pix_fmt"].startswith("yuv420p")
    video_args = ["-c:v", "copy"] if compliant else ["-c:v", "h264_mf", "-pix_fmt", "yuv420p"]

    cmd = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", src]
    if not info["has_audio"]:
        # Silent video is a common Reels rejection, so give it a silent track.
        cmd += ["-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000", "-shortest"]
    cmd += video_args + ["-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", path]

    subprocess.run(cmd, check=True)
    return info


def report(path, extra=""):
    im = Image.open(path)
    print(f"{os.path.relpath(path)}  {im.width}x{im.height}  {getattr(im, 'n_frames', 1)} frame(s)  "
          f"{os.path.getsize(path) // 1024} KB {extra}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("source")
    p.add_argument("name")
    p.add_argument("--news", action="store_true")
    p.add_argument("--slider", action="store_true")
    p.add_argument("--video", action="store_true")
    a = p.parse_args()
    if not (a.news or a.slider or a.video):
        a.news = a.slider = True

    if a.video:
        os.makedirs(VIDEO_ROOT, exist_ok=True)
        out = os.path.join(VIDEO_ROOT, a.name + ".mp4")
        info = save_video(a.source, out)
        w, h = info["size"] or (0, 0)
        print(f"{os.path.relpath(out)}  {w}x{h}  {info['fps']:g} fps  "
              f"{info['duration']:.1f}s  {os.path.getsize(out) // 1024} KB")
        if not (a.news or a.slider):
            return

    src = Image.open(a.source)
    animated = getattr(src, "n_frames", 1) > 1

    if a.news:
        out = os.path.join(ROOT, "news", a.name + ".webp")
        src.seek(0)
        save_still(src, out, max_width=1024, quality=82)
        report(out)
        jpeg = os.path.join(ROOT, "news", a.name + ".jpg")
        src.seek(0)
        save_social_jpeg(src, jpeg, max_width=1024, quality=85)
        print(f"{os.path.relpath(jpeg)}  {os.path.getsize(jpeg) // 1024} KB (Instagram)")
    if a.slider:
        out = os.path.join(ROOT, "slider", a.name + ".webp")
        if animated:
            total = save_animated(src, out)
            report(out, f"(animation {total / 1000:.1f}s: use \"duration\": {max(8000, round(total, -3))})")
        else:
            save_still(src, out, max_width=1536, quality=82)
            report(out)


if __name__ == "__main__":
    sys.exit(main())
