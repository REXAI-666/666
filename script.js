const GEMINI_API_KEY = "AIzaSyBHrb3sK3_he7Q37aLD-xrr_whjqjg92WA";

async function generatePrompt() {
  const img = document.getElementById("imageInput").files[0];
  if (!img) return alert("Image upload karo");

  const ratio = document.getElementById("ratio").value;
  const style = document.getElementById("style").value;
  const angle = document.getElementById("angle").value;
  const mj = document.getElementById("mj").checked;
  const nano = document.getElementById("nano").checked;

  document.getElementById("output").value = "⏳ Image ko deeply analyze kiya ja raha hai...";

  const base64 = await toBase64(img);

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
Analyze the uploaded image STRICTLY and return a detailed visual description.
Do NOT be generic.

Describe clearly:
1. Subject gender, age range, facial features, expression
2. Hair style, hair color
3. Clothing (type, color, fit, material)
4. Pose and body language
5. Background environment
6. Lighting condition
7. Mood / vibe

Write as a single rich paragraph suitable for AI image generation.
`
            },
            {
              inlineData: {
                mimeType: img.type,
                data: base64
              }
            }
          ]
        }]
      })
    }
  );

  const data = await response.json();
  let desc = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!desc || desc.length < 80) {
    desc =
      "a clearly visible human subject with defined facial structure, realistic skin texture, expressive eyes, natural hairstyle, detailed clothing, confident pose, and a visually rich environment captured in realistic lighting";
  }

  const cameraMap = {
    eye: "eye-level natural perspective",
    low: "low-angle dramatic perspective",
    high: "high-angle soft perspective",
    three: "three-quarter cinematic angle",
    close: "close-up portrait with shallow depth of field",
    wide: "wide environmental framing showing surroundings"
  };

  const basePrompt = `
Ultra-detailed ${style} image of ${desc},
shot from ${cameraMap[angle]},
cinematic lighting with natural shadows,
photorealistic skin and fabric textures,
professional camera realism, global illumination,
high dynamic range, depth, clarity,
aspect ratio ${ratio},
100% locked face reference, no identity change,
negative prompt: blur, low quality, deformed face, extra fingers
`.trim();

  let finalPrompt = basePrompt;

  if (mj) {
    finalPrompt += `

---
MIDJOURNEY v7:
${basePrompt}
--ar ${ratio} --v 7 --style raw
`;
  }

  if (nano) {
    finalPrompt += `

---
NANO BANANA PRO:
Hyper-realistic smartphone photo,
same face as reference (100% locked),
natural handheld framing, real-world lighting,
DSLR-level detail, ultra HD realism
`;
  }

  document.getElementById("output").value = finalPrompt;
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
