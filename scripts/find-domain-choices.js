const fs = require("fs");

const apiKey = "tly-a7R4dHrA43st7qIaLwytmJ5luxdl7FjM";
const formId = "44peaX";

async function main() {
  try {
    const res = await fetch(`https://api.tally.so/forms/${formId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    
    if (res.ok) {
      const json = await res.json();
      console.log("\n--- DOMAIN QUESTION BLOCKS (15-20) ---");
      for (let i = 15; i <= 20; i++) {
        const block = json.blocks[i];
        if (block) {
          console.log(`[${i}] TYPE: ${block.type} | TEXT: "${block.payload?.text || block.payload?.title || ""}" | UUID: ${block.uuid}`);
          console.log("PAYLOAD JSON:", JSON.stringify(block.payload, null, 2));
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main();
