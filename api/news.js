export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  try {
    const encoded = encodeURIComponent(q);
    
    // נסה כמה endpoints שונים
    const urls = [
      `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`,
      `https://news.google.com/rss/search?q=${encoded}+stock&hl=en-US&gl=US&ceid=US:en`,
      `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encoded}&region=US&lang=en-US`,
    ];

    let items = [];

    for (const url of urls) {
      try {
        const r = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          }
        });

        if (!r.ok && r.status !== 304) continue;
        
        const xml = await r.text();
        if (!xml || xml.length < 100) continue;

        const parsed = parseXML(xml);
        if (parsed.length > 0) {
          items = parsed;
          break;
        }
      } catch {}
    }

    res.setHeader("Cache-Control", "no-store");
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function parseXML(xml) {
  const items = [];
  const patterns = [
    /<item>([\s\S]*?)<\/item>/g,
    /<entry>([\s\S]*?)<\/entry>/g,
  ];

  for (const pattern of patterns) {
    const matches = [...xml.matchAll(pattern)];
    if (!matches.length) continue;

    for (const match of matches) {
      const block = match[1];

      const title =
        block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
        block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";

      const link =
        block.match(/<link>(https?:\/\/[^\s<]+)<\/link>/)?.[1] ||
        block.match(/<link[^>]+href="([^"]+)"/)?.[1] || "";

      const pubDate =
        block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ||
        block.match(/<published>([\s\S]*?)<\/published>/)?.[1] || "";

      const source =
        block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ||
        block.match(/<author>([\s\S]*?)<\/author>/)?.[1] || "";

      const cleanTitle = title
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">").replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'").trim();

      if (cleanTitle.length > 5) {
        items.push({ title: cleanTitle, link, pubDate, source });
      }
      if (items.length >= 5) break;
    }
    if (items.length) break;
  }
  return items;
}
