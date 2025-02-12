const tinycolor = require("tinycolor2");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};


//Step 1: Naming the color
const askForInput = async () => {
  console.log("\n=======================================");
  console.log(" 🔵 STEP 1: NAMING YOUR COLOR");
  console.log("=======================================\n");

  let hex = await askQuestion("🎨 Please enter a HEX color (e.g., #FABADA): ");
  if (!tinycolor(hex).isValid()) {
    console.log(`❌ Oops! The HEX color "${hex}" seems invalid. Please provide a valid HEX color.`);
    rl.close();
    return;
  }

  console.log("\n✨ Now, let's give this color a meaningful name!");

  let concept = await askQuestion("📝 What concept is this color for? (e.g., brand, ui, background) or press Enter to skip: ");
  concept = concept.trim() || "color"; 

  if (concept && !/^[a-zA-Z0-9.-]+$/.test(concept)) {
    console.log("❌ The concept name should only contain letters, numbers, hyphens (-), and dots (.)");
    rl.close();
    return;
  }

  
  let variant = await askQuestion("🎨 Would you like to define a variant name? (e.g., primary, secondary) or press Enter to skip: ");
  variant = variant.trim() || null; 

  if (variant && !/^[a-zA-Z0-9.-]+$/.test(variant)) {
    console.log("❌ The variant name should only contain letters, numbers, hyphens (-), and dots (.)");
    rl.close();
    return;
  }

  console.log("\n=======================================");
  console.log(" 🔄 STEP 2: SELECTING FORMATS");
  console.log("=======================================\n");

  const askYesNo = async (question) => {
    let answer;
    do {
      answer = (await askQuestion(question)).trim().toLowerCase();
      if (answer !== "yes" && answer !== "no" && answer !== "y" && answer !== "n") {
        console.log("❌ Please enter 'yes', 'y', 'no', or 'n'.");
      }
    } while (answer !== "yes" && answer !== "no" && answer !== "y" && answer !== "n");
  
    
    return answer === "yes" || answer === "y";
  };
  
  
  let generateRGB = await askYesNo("📌 Include color tokens in RGB format? (yes/no or y/n): ");
  let generateRGBA = await askYesNo("📌 Include color tokens RGBA format? (yes/no or y/n): ");
  let generateHSL = await askYesNo("📌 Include color tokens HSL format? (yes/no or y/n): ");
    
  console.log("\n=======================================");
  console.log(" 🔄 STEP 3: GENERATING COLOR STOPS");
  console.log("=======================================\n");

  
  const stops = generateStops(hex);

  return { hex: hex.trim(), concept, variant, generateRGB, generateRGBA, generateHSL, stops };
};


const generateStops = (color) => {
  return {
    base: tinycolor(color).toHexString(),
    lightest: tinycolor(color).lighten(40).toHexString(),
    lighter: tinycolor(color).lighten(30).toHexString(),
    light: tinycolor(color).lighten(20).toHexString(),
    dark: tinycolor(color).darken(20).toHexString(),
    darker: tinycolor(color).darken(30).toHexString(),
    darkest: tinycolor(color).darken(40).toHexString()
  };
};


const main = async () => {
  console.log("\n=======================================");
  console.log(" 🚀 STARTING THE PROCESS");
  console.log("=======================================\n");

  const input = await askForInput();
  if (!input) return;

  const { hex, concept, variant, generateRGB, generateRGBA, generateHSL, stops } = input;
  const color = tinycolor(hex);
  const rgb = color.toRgbString();
  const rgba = color.toRgb();
  const hsl = color.toHslString();

  console.log("\n=======================================");
  console.log(" 📂 STEP 4: GENERATING OUTPUT FILES");
  console.log("=======================================\n");

 
const tokensFolder = 'outputs/tokens';
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");
if (!fs.existsSync("outputs/tokens")) fs.mkdirSync("outputs/tokens");


const finalConcept = concept || "color";


const tokensData = {};


if (concept) {
  if (variant) {
    
    tokensData[finalConcept] = {
      [variant]: { base: { value: hex, type: "color" }, ...Object.fromEntries(Object.entries(stops).map(([k, v]) => [k, { value: tinycolor(v).toHexString(), type: "color" }])) }
    };
  } else {
    
    tokensData[finalConcept] = {
      base: { value: hex, type: "color" },
      ...Object.fromEntries(Object.entries(stops).map(([k, v]) => [k, { value: tinycolor(v).toHexString(), type: "color" }]))
    };
  }
} else {
  
  tokensData.color = {};
}

fs.writeFileSync(`${tokensFolder}/tokens_hex.json`, JSON.stringify(tokensData, null, 2));
console.log("✅ Saved: outputs/tokens/tokens_hex.json");


if (generateRGB) {
  const tokensRGBData = JSON.parse(JSON.stringify(tokensData));
  if (variant) {
    tokensRGBData[finalConcept] = {
      [variant]: { base: { value: rgb, type: "color" }, ...Object.fromEntries(Object.entries(stops).map(([k, v]) => [k, { value: tinycolor(v).toRgbString(), type: "color" }])) }
    };
  } else {
    tokensRGBData[finalConcept] = {
      base: { value: rgb, type: "color" },
      ...Object.fromEntries(Object.entries(stops).map(([k, v]) => [k, { value: tinycolor(v).toRgbString(), type: "color" }]))
    };
  }
  fs.writeFileSync(`${tokensFolder}/tokens_rgb.json`, JSON.stringify(tokensRGBData, null, 2));
  console.log("✅ Saved: outputs/tokens/tokens_rgb.json");
}


if (generateRGBA) {
  const tokensRGBAData = JSON.parse(JSON.stringify(tokensData));
  if (variant) {
    tokensRGBAData[finalConcept] = {
      [variant]: { base: { value: rgba, type: "color" }, ...Object.fromEntries(Object.entries(stops).map(([k, v]) => {
        const rgbaValue = tinycolor(v).toRgb(); 
        const rgbaString = `rgba(${rgbaValue.r},${rgbaValue.g},${rgbaValue.b},${rgbaValue.a})`;
        return [k, { value: rgbaString, type: "color" }];
      }))}
    };
  } else {
    tokensRGBAData[finalConcept] = {
      base: { value: rgba, type: "color" },
      ...Object.fromEntries(Object.entries(stops).map(([k, v]) => {
        const rgbaValue = tinycolor(v).toRgb(); 
        const rgbaString = `rgba(${rgbaValue.r},${rgbaValue.g},${rgbaValue.b},${rgbaValue.a})`;
        return [k, { value: rgbaString, type: "color" }];
      }))
    };
  }
  fs.writeFileSync(`${tokensFolder}/tokens_rgba.json`, JSON.stringify(tokensRGBAData, null, 2));
  console.log("✅ Saved: outputs/tokens/tokens_rgba.json");
}


if (generateHSL) {
  const tokensHSLData = JSON.parse(JSON.stringify(tokensData));
  if (variant) {
    tokensHSLData[finalConcept] = {
      [variant]: { base: { value: hsl, type: "color" }, ...Object.fromEntries(Object.entries(stops).map(([k, v]) => [k, { value: tinycolor(v).toHslString(), type: "color" }])) }
    };
  } else {
    tokensHSLData[finalConcept] = {
      base: { value: hsl, type: "color" },
      ...Object.fromEntries(Object.entries(stops).map(([k, v]) => [k, { value: tinycolor(v).toHslString(), type: "color" }]))
    };
  }
  fs.writeFileSync(`${tokensFolder}/tokens_hsl.json`, JSON.stringify(tokensHSLData, null, 2));
  console.log("✅ Saved: outputs/tokens/tokens_hsl.json");
}

  console.log("\n=======================================");
  console.log(" 🎨 STEP 5: PROCESS COMPLETED SUCCESSFULLY!");
  console.log("=======================================\n");

  console.log("✅ All files have been generated inside the 'outputs/formats/' and 'outputs/tokens/' folders.");
  console.log("📁 You can now use them as needed.\n");

  console.log("Thank you for using the color converter! 🚀🎨\n");
  console.log("=======================================\n");

  rl.close();
};

main();
