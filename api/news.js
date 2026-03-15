export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  try {
    const encoded = encodeURIComponent(q);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
    
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    if (!r.ok) return res.status(500).json({ error: "Failed to fetch news" });
    
    const xml = await r.text();
    
    // פרסור XML פשוט ללא ספריות
    const items = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    for (const match of itemMatches) {
      const item = match[1];
      const title   = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
                   || item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link    = item.match(/<link>(.*?)<\/link>/)?.[1]
                   || item.match(/<link\/>(.*?)<\/link>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const source  = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || "";

      if (title) items.push({ title, link, pubDate, source });
      if (items.length >= 5) break;
    }

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
