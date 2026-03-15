export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { texts } = req.body;
  if (!texts?.length) return res.json({ translations: [] });

  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const prompt = `תרגם את הכותרות הבאות לעברית. החזר מערך JSON בלבד של מחרוזות, ללא טקסט נוסף:
${JSON.stringify(texts)}`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.1 }
        })
      }
    );

    const data = await r.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\[[\s\S]*\]/);
    const translations = match ? JSON.parse(match[0]) : texts;

    res.json({ translations });
  } catch {
    res.json({ translations: texts }); // fallback — הצג מקור
  }
}
