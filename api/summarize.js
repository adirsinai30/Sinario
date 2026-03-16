export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { ticker, companyName, articles } = req.body;
  if (!articles?.length) return res.json({ summary: null });

  const apiKey = process.env.GEMINI_API_KEY;

  const titlesText = articles
    .map((a, i) => `${i + 1}. ${a.title} (${a.source || ""}, ${a.pubDate ? new Date(a.pubDate).toLocaleDateString("he-IL") : ""})`)
    .join("\n");

  const prompt = `אתה אנליסט פיננסי. סכם את החדשות הבאות על ${companyName} (${ticker}) בעברית.

כתוב 2-3 משפטים בלבד — תמציתי, ממוקד, מקצועי.
ציין אם המגמה חיובית, שלילית או ניטרלית.
אל תכתוב כותרת — רק את הסיכום ישירות.

כתבות:
${titlesText}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.3 }
        })
      }
    );
    const data = await r.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    console.log("Gemini response:", JSON.stringify(data).slice(0, 500));
    console.log("Summary:", summary);
    res.json({ summary, debug: data });
  } catch (err) {
    res.json({ summary: null });
  }
}
