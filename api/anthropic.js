// ─── api/anthropic.js ─────────────────────────────────────────────────────────
// מיקום: /api/anthropic.js (בתיקיית root של הפרויקט, ליד package.json)
// עובד עם Gemini Flash — חינמי לתמיד, ללא כרטיס אשראי
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set in Vercel environment variables" });
  }

  try {
    const { messages, max_tokens } = req.body;

    // המרת פורמט Anthropic → פורמט Gemini
    const geminiContents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof m.content === "string" ? m.content : m.content.map(c => c.text || "").join("") }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: max_tokens || 1000,
            temperature: 0.7,
          },
        }),
      }
    );

    const geminiData = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", geminiData);
      return res.status(response.status).json({ error: geminiData.error?.message || "Gemini error" });
    }

    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // החזרה בפורמט Anthropic — הקוד ב-React לא צריך שינוי
    res.json({
      content: [{ type: "text", text }]
    });

  } catch (err) {
    console.error("API route error:", err);
    res.status(500).json({ error: err.message });
  }
}
