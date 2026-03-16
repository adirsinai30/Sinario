export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { groups } = req.body;
  if (!groups?.length) return res.json({ summaries: {} });

  const apiKey = process.env.GEMINI_KEY_NEWS;

  // בנה prompt אחד עם כל הניירות
  const sections = groups.map(g => {
    const titles = g.articles
      .slice(0, 5)
      .map((a, i) => `  ${i+1}. ${a.title}`)
      .join("\n");
    return `### ${g.label} (${g.ticker})\n${titles}`;
  }).join("\n\n");

  const prompt = `אתה אנליסט פיננסי. סכם את החדשות הבאות בעברית — לכל נייר ערך 2-3 משפטים תמציתיים.
ציין אם המגמה חיובית, שלילית או ניטרלית.
החזר JSON בלבד בפורמט: {"TICKER": "סיכום...", ...}

${sections}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.3 }
        })
      }
    );

    const data = await r.json();
    
    if (data.error) {
      console.error("Gemini error:", data.error.message);
      return res.json({ summaries: {} });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    const summaries = match ? JSON.parse(match[0]) : {};

    res.json({ summaries });
  } catch (err) {
    console.error("Summarize error:", err);
    res.json({ summaries: {} });
  }
}
