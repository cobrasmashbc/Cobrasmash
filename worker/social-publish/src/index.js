const SITE_ORIGIN = "https://cobrasmash.org.uk";
const NEWS_JSON_URL = `${SITE_ORIGIN}/data/news.json`;
const GRAPH_API_VERSION = "v21.0";
const POSTED_IDS_KEY = "posted-ids";

// Pinned card from CONTENT.md that's edited in place every week (same id,
// new date/description). Never eligible for posting, regardless of KV state.
const EXCLUDED_IDS = new Set(["news-next-session"]);

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function resolveImageUrl(article) {
  const path = article.detailImage || article.image;
  if (!path) return null;
  return `${SITE_ORIGIN}/${path.replace(/^\/+/, "")}`;
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

async function getPostedIds(kv) {
  const raw = await kv.get(POSTED_IDS_KEY);
  return new Set(raw ? JSON.parse(raw) : []);
}

async function markPosted(kv, id) {
  const posted = await getPostedIds(kv);
  posted.add(id);
  await kv.put(POSTED_IDS_KEY, JSON.stringify([...posted]));
}

async function postToFacebook(env, imageUrl, caption) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.FB_PAGE_ID}/photos`;
  const body = new URLSearchParams({
    url: imageUrl,
    caption,
    access_token: env.FB_PAGE_ACCESS_TOKEN,
  });
  const res = await fetch(url, { method: "POST", body });
  if (!res.ok) {
    throw new Error(`Facebook post failed: ${res.status} ${await res.text()}`);
  }
}

async function postToInstagram(env, imageUrl, caption) {
  const base = `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.IG_USER_ID}`;

  const createRes = await fetch(`${base}/media`, {
    method: "POST",
    body: new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: env.FB_PAGE_ACCESS_TOKEN,
    }),
  });
  if (!createRes.ok) {
    throw new Error(
      `Instagram media create failed: ${createRes.status} ${await createRes.text()}`
    );
  }
  const { id: creationId } = await createRes.json();

  const publishRes = await fetch(`${base}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({
      creation_id: creationId,
      access_token: env.FB_PAGE_ACCESS_TOKEN,
    }),
  });
  if (!publishRes.ok) {
    throw new Error(
      `Instagram publish failed: ${publishRes.status} ${await publishRes.text()}`
    );
  }
}

async function run(env) {
  const [articles, postedIds] = await Promise.all([
    fetchArticles(),
    getPostedIds(env.SOCIAL_PUBLISH_KV),
  ]);

  const toPost = articles.filter(
    (article) => !EXCLUDED_IDS.has(article.id) && !postedIds.has(article.id)
  );

  for (const article of toPost) {
    const imageUrl = resolveImageUrl(article);
    if (!imageUrl) {
      console.warn(`Skipping ${article.id}: no image to post`);
      continue;
    }
    const caption = buildCaption(article);

    try {
      await postToFacebook(env, imageUrl, caption);
      await postToInstagram(env, imageUrl, caption);
      await markPosted(env.SOCIAL_PUBLISH_KV, article.id);
      console.log(`Posted ${article.id} to Facebook and Instagram`);
    } catch (err) {
      // Not marked posted, so the next scheduled run retries it.
      console.error(`Failed to post ${article.id}: ${err.message}`);
    }
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  },
};
