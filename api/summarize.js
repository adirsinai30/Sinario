export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { groups } = req.body;
  if (!groups?.length) return res.json({ summaries: {} });

  const apiKey = process.env.GEMINI_KEY_NEWS;

  // בנה prompt אחד עם כל הניירות
  const sections = groups.map(g => {
    const titles = g.articles
      .slice(0, 4)
      .map((a, i) => `${i+1}. ${a.title}`)
      .join("\n");
    return `${g.ticker} (${g.label}):\n${titles}`;
  }).join("\n\n");

  const prompt = `אתה אנליסט פיננסי. סכם בעברית — 3 משפטים לכל נייר ערך. ציין מגמה. JSON בלבד ללא טקסט נוסף:
{"TICKER":"סיכום..."}

${sections}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 3000, temperature: 0.3 }
        })
      }
    );

    const data = await r.json();
    
    if (data.error) {
      console.error("Gemini error:", data.error.message);
      return res.json({ summaries: {} });
    }

const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    console.log("RAW TEXT:", text);
let summaries = {};
    try {
      // הסר כל סוגי backticks ורווחים
      let clean = text;
      clean = clean.replace(/^```[\w]*\s*/m, "");
      clean = clean.replace(/\s*```\s*$/m, "");
      clean = clean.trim();
      console.log("CLEAN:", clean.slice(0, 200));
      summaries = JSON.parse(clean);
    } catch(parseErr) {
      console.error("Parse failed:", parseErr.message);
      // נסה regex כ-fallback
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { summaries = JSON.parse(match[0]); } catch {}
      }
    }
    res.json({ summaries });
  } catch (err) {
    console.error("Summarize error:", err);
    res.json({ summaries: {} });
  }
}
