// 🔑 PASTE YOUR GEMINI API KEY HERE
const GEMINI_API_KEY = "AIzaSyBHrb3sK3_he7Q37aLD-xrr_whjqjg92WA";

async function generatePrompt() {
  const img = document.getElementById("imageInput").files[0];
  if (!img) return alert("Image upload karo");

  const ratio = document.getElementById("ratio").value;
  const style = document.getElementById("style").value;
  const angle = document.getElementById("angle").value;
  const mj = document.getElementById("mj").checked;
  const nano = document.getElementById("nano").checked;

  document.getElementById("output").value = "⏳ Image analyze ho rahi hai...";

  const base64 = await toBase64(img);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text:
`Analyze this image deeply and describe:
- subject appearance
- clothing
- pose
- environment
- lighting
- mood
Use rich cinematic language for AI image generation.`
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
  let desc =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!desc || desc.length < 40) {
    desc = "a highly detailed human subject with clear facial features, expressive pose, realistic clothing, natural skin texture, and a visually rich environment";
  }

  const cameraMap = {
    eye: "eye-level natural perspective",
    low: "low-angle dramatic perspective",
    high: "high-angle soft perspective",
    three: "three-quarter cinematic angle",
    close: "close-up shot with shallow depth of field",
    wide: "wide environmental framing"
  };

  let basePrompt = `
Ultra-detailed ${style} scene featuring ${desc},
shot from ${cameraMap[angle]},
cinematic lighting, ultra-realistic textures,
professional camera look, global illumination,
HDR, sharp focus, depth and realism,
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
Hyper-realistic smartphone camera photo,
same face as reference (100% locked),
natural handheld framing, real-world lighting,
DSLR-level clarity, ultra HD realism
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
