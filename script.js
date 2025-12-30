async function generatePrompt() {
  try {
    const imgInput = document.getElementById("imageInput");
    const img = imgInput.files[0];

    if (!img) {
      alert("Image upload karo");
      return;
    }

    const ratio = document.getElementById("ratio").value;
    const style = document.getElementById("style").value;
    const angle = document.getElementById("angle").value;
    const mj = document.getElementById("mj").checked;
    const nano = document.getElementById("nano").checked;

    const outputBox = document.getElementById("output");
    outputBox.value = "⏳ Image ko deeply analyze kiya ja raha hai...";

    // Convert image to base64
    const base64 = await toBase64(img);

    // Call Vercel serverless API
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageBase64: base64,
        mimeType: img.type
      })
    });

    // Handle server errors
    if (!res.ok) {
      const errText = await res.text();
      outputBox.value =
        "❌ Server error:\n" + errText;
      return;
    }

    const data = await res.json();

    if (!data.description) {
      outputBox.value =
        "❌ Gemini ne description return nahi ki.";
      return;
    }

    const desc = data.description;

    const cameraMap = {
      eye: "eye-level natural perspective",
      low: "low-angle dramatic view",
      high: "high-angle soft perspective",
      three: "three-quarter cinematic angle",
      close: "close-up portrait with shallow depth of field",
      wide: "wide environmental framing"
    };

    const basePrompt = `
Ultra-detailed ${style} image of ${desc},
shot from ${cameraMap[angle]},
cinematic lighting, realistic skin and fabric textures,
professional camera realism, global illumination,
HDR, sharp focus, depth and clarity,
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

    outputBox.value = finalPrompt;

  } catch (err) {
  document.getElementById("output").value =
    "❌ Unexpected error:\n" + err.message;
  }
}

// Helper: file → base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
