"""Convert a poster/animation into the WebP files used by Latest Buzz and the hero slider.

Usage:
    python tools/convert_media.py <source file> <OutputName> [--news] [--slider]

    <source file>  PNG/JPG/WebP still, or an animated GIF/WebP
    <OutputName>   file name without extension, e.g. CSAvsBuckinghamASep20
    --news         write public/assets/images/news/<OutputName>.webp   (still, 1024px wide)
    --slider       write public/assets/images/slider/<OutputName>.webp (animated if the source is)

With neither flag, both are written. Needs Pillow: python -m pip install --user pillow
"""
import argparse
import os
import sys

from PIL import Image, ImageSequence

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets", "images")


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
    a = p.parse_args()
    if not (a.news or a.slider):
        a.news = a.slider = True

    src = Image.open(a.source)
    animated = getattr(src, "n_frames", 1) > 1

    if a.news:
        out = os.path.join(ROOT, "news", a.name + ".webp")
        src.seek(0)
        save_still(src, out, max_width=1024, quality=82)
        report(out)
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
