export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  try {
    const encoded = encodeURIComponent(q);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "Cache-Control": "no-cache",
      }
    });

    if (!r.ok) return res.status(500).json({ error: `HTTP ${r.status}` });

    const xml = await r.text();

    // debug — שלח גם את תחילת ה-XML
    console.log("XML preview:", xml.slice(0, 500));

    const items = [];

    // נסה כמה פטרנים שונים
    const patterns = [
      /<item>([\s\S]*?)<\/item>/g,
      /<entry>([\s\S]*?)<\/entry>/g,
    ];

    for (const pattern of patterns) {
      const matches = [...xml.matchAll(pattern)];
      if (!matches.length) continue;

      for (const match of matches) {
        const block = match[1];

        // title — נסה כמה פורמטים
        const title =
          block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
          block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ||
          "";

        // link
        const link =
          block.match(/<link>(https?:\/\/[^\s<]+)<\/link>/)?.[1] ||
          block.match(/<link[^>]+href="([^"]+)"/)?.[1] ||
          block.match(/<feedburner:origLink>([\s\S]*?)<\/feedburner:origLink>/)?.[1] ||
          "";

        // pubDate
        const pubDate =
          block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ||
          block.match(/<published>([\s\S]*?)<\/published>/)?.[1] ||
          "";

        // source
        const source =
          block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ||
          block.match(/<author>([\s\S]*?)<\/author>/)?.[1] ||
          "";

        const cleanTitle = title
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        if (cleanTitle && cleanTitle.length > 5) {
          items.push({ title: cleanTitle, link, pubDate, source });
        }

        if (items.length >= 5) break;
      }
      if (items.length) break;
    }

    // אם עדיין ריק — החזר את ה-XML לדיבוג
    if (!items.length) {
      return res.json({
        items: [],
        debug: xml.slice(0, 1000)
      });
    }

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
