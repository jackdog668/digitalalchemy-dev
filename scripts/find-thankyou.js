const fs = require("fs");

const apiKey = "tly-a7R4dHrA43st7qIaLwytmJ5luxdl7FjM";
const formId = "44peaX";

async function main() {
  try {
    console.log(`Fetching Tally form: ${formId}...`);
    const res = await fetch(`https://api.tally.so/forms/${formId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    
    if (res.ok) {
      const json = await res.json();
      console.log("Total blocks:", json.blocks?.length);
      const last15 = json.blocks.slice(-15);
      console.log("\n--- LAST 15 BLOCKS ---");
      last15.forEach((block, idx) => {
        const absIdx = json.blocks.length - 15 + idx;
        console.log(`[${absIdx}] TYPE: ${block.type} | TEXT: "${block.payload?.title || block.payload?.text || block.payload?.name || ""}" | UUID: ${block.uuid}`);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

main();
