export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, mimeType } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing" });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: "Image data missing" });
    }

    const geminiRes = await fetch(
      ""https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Describe the image in extreme visual detail for AI image generation."
                },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const rawText = await geminiRes.text();

    // Gemini error handling
    if (!geminiRes.ok) {
      return res.status(500).json({
        error: "Gemini API error",
        details: rawText
      });
    }

    const data = JSON.parse(rawText);

    const description =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!description) {
      return res.status(500).json({
        error: "No description returned by Gemini",
        raw: data
      });
    }

    return res.status(200).json({ description });

  } catch (err) {
    return res.status(500).json({
      error: "Server crash",
      details: err.message
    });
  }
}
