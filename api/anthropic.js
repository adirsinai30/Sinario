async function fetchRSSHeadlines(tickers) {
  const headlines = [];
  const sources = [
    { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ&region=US&lang=en-US", label: "שוק כללי" },
    ...tickers.slice(0, 6).map(t => ({
      url: `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${t}&region=US&lang=en-US`,
      label: t
    }))
  ];

  await Promise.all(sources.map(async ({ url, label }) => {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(4000)
      });
      if (!r.ok) return;
      const xml = await r.text();
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
      items.slice(0, 3).forEach(item => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
          || item.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
        const date = pubDate ? new Date(pubDate).toLocaleDateString("he-IL") : "";
        if (title) headlines.push({ ticker: label, title: title.trim(), date });
      });
    } catch {}
  }));

  return headlines;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
const apiKey = process.env.GEMINI_KEY_AGENT;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_KEY_AGENT not set" });
  }
  try {
    const { messages, max_tokens, system, useSearch, useNews, newsTickers } = req.body;

    let rssContext = "";
    if (useNews && newsTickers?.length) {
      const headlines = await fetchRSSHeadlines(newsTickers);
      if (headlines.length > 0) {
        rssContext = "\n\n=== כותרות עדכניות משוק (RSS) ===\n" +
          headlines.map(h => `[${h.ticker}] ${h.date}: ${h.title}`).join("\n") +
          "\n=== סוף כותרות RSS ===\n";
      }
    }

    const geminiContents = messages.map((m, index) => {
      // inject RSS into last user message
      if (rssContext && index === messages.length - 1 && m.role === "user") {
        const content = typeof m.content === "string" ? m.content : m.content.map(c => c.text || "").join("");
        return { role: "user", parts: [{ text: content + rssContext }] };
      }
      // תוכן טקסט פשוט
      if (typeof m.content === "string") {
        return { role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] };
      }
      // תוכן מורכב (טקסט + תמונה/PDF)
      const parts = m.content.map(c => {
        if (c.type === "text") {
          return { text: c.text };
        }
        if (c.type === "image") {
          return { inline_data: { mime_type: c.source.media_type, data: c.source.data } };
        }
        if (c.type === "document") {
          return { inline_data: { mime_type: c.source.media_type, data: c.source.data } };
        }
        return { text: "" };
      }).filter(p => p.text !== "" || p.inline_data);

      return { role: m.role === "assistant" ? "model" : "user", parts };
    });

    // system prompt → הוסף כהודעה ראשונה מה-user אם קיים
    if (system) {
      geminiContents.unshift({
        role: "user",
        parts: [{ text: `הוראות מערכת: ${system}` }]
      });
      geminiContents.splice(1, 0, {
        role: "model",
        parts: [{ text: "הבנתי, אפעל לפי ההוראות." }]
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: max_tokens || 1000,
            temperature: 0.7,
          },
          ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}),
        }),
      }
    );

    const geminiData = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", geminiData);
      return res.status(response.status).json({ error: geminiData.error?.message || "Gemini error" });
    }

    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Status:", response.status);
    console.log("Text length:", text.length);
    console.log("Text preview:", text.slice(0, 200));
    console.log("Full response keys:", Object.keys(geminiData));
    if(geminiData.candidates?.[0]) console.log("Finish reason:", geminiData.candidates[0].finishReason);
    res.json({ content: [{ type: "text", text }] });

  } catch (err) {
    console.error("API route error:", err);
    res.status(500).json({ error: err.message });
  }
}
