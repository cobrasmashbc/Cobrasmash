const SITE_ORIGIN = "https://cobrasmash.org.uk";
const NEWS_JSON_URL = `${SITE_ORIGIN}/data/news.json`;
const GRAPH_API_VERSION = "v21.0";

// Legacy key: ids recorded here were posted to both platforms, before the
// per-platform keys below existed. Still honoured so no KV migration is needed.
const POSTED_IDS_KEY = "posted-ids";
const POSTED_KEYS = { facebook: "posted-fb", instagram: "posted-ig" };

// An Instagram video container is built asynchronously, so it has to be polled
// until it reports FINISHED before it can be published.
const IG_POLL_ATTEMPTS = 20;
const IG_POLL_INTERVAL_MS = 3000;

// Pinned card from CONTENT.md that's edited in place every week (same id,
// new date/description). Never eligible for posting, regardless of KV state.
const EXCLUDED_IDS = new Set(["news-next-session"]);

// The JSON holds HTML, so "&" is written "&amp;" ("Mark &amp; Alex"). Decode the
// entities after the tags are gone, or the caption posts with them still in it.
const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
};

function decodeEntities(text) {
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m]);
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?[^>]+(>|$)/g, "")
  )
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function absoluteUrl(path) {
  return path ? `${SITE_ORIGIN}/${path.replace(/^\/+/, "")}` : null;
}

// Facebook takes the WebP happily; Instagram's Content Publishing API accepts
// JPEG only, so it gets the .jpg that convert_media.py writes alongside it.
function resolveMedia(article) {
  const imagePath = article.detailImage || article.image;
  return {
    videoUrl: absoluteUrl(article.video),
    imageUrl: absoluteUrl(imagePath),
    jpegUrl: absoluteUrl(imagePath && imagePath.replace(/\.webp$/i, ".jpg")),
  };
}

function buildCaption(article) {
  const body = stripHtml(article.description || "");
  return `${article.title}\n\n${body}\n\n${SITE_ORIGIN}/#latest-buzz`;
}

async function fetchArticles() {
  const res = await fetch(NEWS_JSON_URL, { cf: { cacheTtl: 0 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch news.json: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data.articles) ? data.articles : [];
}

async function getIds(kv, key) {
  const raw = await kv.get(key);
  return new Set(raw ? JSON.parse(raw) : []);
}

async function markPosted(kv, platform, id) {
  const key = POSTED_KEYS[platform];
  const posted = await getIds(kv, key);
  posted.add(id);
  await kv.put(key, JSON.stringify([...posted]));
}

async function graphPost(url, params, what) {
  const res = await fetch(url, { method: "POST", body: new URLSearchParams(params) });
  if (!res.ok) {
    throw new Error(`${what} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function postToFacebook(env, media, caption) {
  const base = `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.FB_PAGE_ID}`;

  if (media.videoUrl) {
    // The /videos edge names the caption field "description".
    await graphPost(
      `${base}/videos`,
      { file_url: media.videoUrl, description: caption, access_token: env.FB_PAGE_ACCESS_TOKEN },
      "Facebook video post"
    );
    return;
  }

  await graphPost(
    `${base}/photos`,
    { url: media.imageUrl, caption, access_token: env.FB_PAGE_ACCESS_TOKEN },
    "Facebook photo post"
  );
}

async function waitForContainer(env, creationId) {
  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${creationId}` +
    `?fields=status_code,status&access_token=${env.FB_PAGE_ACCESS_TOKEN}`;

  for (let attempt = 0; attempt < IG_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, IG_POLL_INTERVAL_MS));

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Instagram status check failed: ${res.status} ${await res.text()}`);
    }
    const { status_code: statusCode, status } = await res.json();

    if (statusCode === "FINISHED") return;
    if (statusCode === "ERROR" || statusCode === "EXPIRED") {
      throw new Error(`Instagram container ${statusCode}: ${status || "no detail"}`);
    }
  }

  throw new Error(
    `Instagram container not ready after ${IG_POLL_ATTEMPTS} polls — not publishing`
  );
}

async function postToInstagram(env, media, caption) {
  const base = `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.IG_USER_ID}`;

  const params = media.videoUrl
    ? { media_type: "REELS", video_url: media.videoUrl, caption }
    : { image_url: media.jpegUrl, caption };

  const { id: creationId } = await graphPost(
    `${base}/media`,
    { ...params, access_token: env.FB_PAGE_ACCESS_TOKEN },
    "Instagram media create"
  );

  // Images are ready immediately; video containers are not.
  if (media.videoUrl) {
    await waitForContainer(env, creationId);
  }

  await graphPost(
    `${base}/media_publish`,
    { creation_id: creationId, access_token: env.FB_PAGE_ACCESS_TOKEN },
    "Instagram publish"
  );
}

const PLATFORMS = [
  { name: "facebook", label: "Facebook", post: postToFacebook },
  { name: "instagram", label: "Instagram", post: postToInstagram },
];

async function run(env) {
  const kv = env.SOCIAL_PUBLISH_KV;
  const [articles, legacyIds, postedFb, postedIg] = await Promise.all([
    fetchArticles(),
    getIds(kv, POSTED_IDS_KEY),
    getIds(kv, POSTED_KEYS.facebook),
    getIds(kv, POSTED_KEYS.instagram),
  ]);
  const posted = { facebook: postedFb, instagram: postedIg };

  for (const article of articles) {
    if (EXCLUDED_IDS.has(article.id)) continue;

    const pending = PLATFORMS.filter(
      ({ name }) => !legacyIds.has(article.id) && !posted[name].has(article.id)
    );
    if (pending.length === 0) continue;

    const media = resolveMedia(article);
    if (!media.videoUrl && !media.imageUrl) {
      console.warn(`Skipping ${article.id}: no media to post`);
      continue;
    }
    const caption = buildCaption(article);

    // Each platform is recorded on its own, so one failing never re-posts the
    // other on the next scheduled run.
    for (const { name, label, post } of pending) {
      try {
        await post(env, media, caption);
        await markPosted(kv, name, article.id);
        console.log(`Posted ${article.id} to ${label}`);
      } catch (err) {
        console.error(`Failed to post ${article.id} to ${label}: ${err.message}`);
      }
    }
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  },
};
