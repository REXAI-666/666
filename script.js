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

  const base64 = await toBase64(img);

  const analysis = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Describe this image in high visual detail for AI image generation." },
            { inlineData: { mimeType: img.type, data: base64 } }
          ]
        }]
      })
    }
  ).then(r => r.json());

  const desc = analysis.candidates?.[0]?.content?.parts?.[0]?.text || "detailed subject";

  const cameraMap = {
    eye: "eye-level natural perspective",
    low: "low-angle dramatic perspective",
    high: "high-angle soft perspective",
    three: "three-quarter cinematic angle",
    close: "close-up shot with shallow depth of field",
    wide: "wide environmental framing"
  };

  let finalPrompt = `
Ultra-detailed ${style} scene of ${desc},
shot from ${cameraMap[angle]},
cinematic lighting, realistic textures,
professional camera look, high dynamic range,
aspect ratio ${ratio},
100% locked face reference, no identity change,
negative prompt: blur, low quality, deformed face, extra fingers
`;

  if (mj) {
    finalPrompt += `
---
MIDJOURNEY v7:
${finalPrompt}
--ar ${ratio} --v 7 --style raw
`;
  }

  if (nano) {
    finalPrompt += `
---
NANO BANANA PRO:
Hyper-realistic mobile camera style,
same face as reference (100% locked),
natural handheld realism, ultra HD
`;
  }

  document.getElementById("output").value = finalPrompt.trim();
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
