export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set" });
  }
  try {
    const { messages, max_tokens, system } = req.body;

    const geminiContents = messages.map(m => {
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
    res.json({ content: [{ type: "text", text }] });

  } catch (err) {
    console.error("API route error:", err);
    res.status(500).json({ error: err.message });
  }
}
