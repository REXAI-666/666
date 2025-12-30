export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image missing" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `
Analyze the image deeply and describe it for AI image generation.
Be extremely specific and visual.

Mention subject, face, clothes, pose, background, lighting and mood.
Write one rich cinematic paragraph.
`
              },
              {
                inlineData: {
                  mimeType,
                  data: imageBase64
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    const description =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "a detailed human subject";

    res.status(200).json({ description });

  } catch (err) {
    res.status(500).json({ error: "Gemini analysis failed" });
  }
}
