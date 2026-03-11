// ─── api/anthropic.js ─────────────────────────────────────────────────────────
// מקום הקובץ: /api/anthropic.js בתיקיית הroot של הפרויקט
//
// Vercel מזהה אוטומטית כל קובץ בתיקיית /api/ כ-serverless function.
// הקוד הזה רץ על השרת — לא בדפדפן — אז אין בעיית CORS ואין חשיפת API key.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // רק POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in Vercel environment variables" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key":         apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // העבר את status code המקורי
    res.status(response.status).json(data);

  } catch (err) {
    console.error("Anthropic proxy error:", err);
    res.status(500).json({ error: err.message });
  }
}
