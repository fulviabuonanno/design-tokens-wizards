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

const askForInput = async () => {

  console.log("\n=======================================");
  console.log("⭐️ STEP 1: ENTER HEX VALUE");
  console.log("=======================================\n");

  let hex = await askQuestion("🎨 Let's start by entering a HEX value (e.g., #FABADA): \n>\x1b[34m#\x1b[0m");
  if (!tinycolor(hex).isValid()) {
    console.log(`❌ Oops! HEX color "${hex}" seems invalid. Please provide a valid HEX color.`);
    rl.close();
    return;
  }

  console.log("\n=======================================");
  console.log("🤔 STEP 2: NAMING YOUR COLOR");
  console.log("=======================================\n");

  console.log("\n✨ Now, let's give this color token a meaningful and structured name!\n");
  let concept = await askQuestion("📝 What concept is this color for? \n(e.g., brand, background) or press Enter to skip: \n>");
  concept = concept.trim() || "color"; 

  if (concept && !/^[a-zA-Z0-9.-]+$/.test(concept)) {
    console.log("❌ Concept name should only contain letters, numbers, hyphens (-), and dots (.)");
    rl.close();
    return;
  }

 console.log("\n\n🎨 How would you like to name this color?");
 const namingChoice = await askQuestion("\tA. Variant naming (e.g., primary, secondary, tertiary)\n\tB. Ordered list naming (e.g., 01, 02, 03 or 1, 2, 3...)\n\nPlease choose the criteria A, or B: \n>");

 let variant = null;
 let isValidNaming = false;

 while (!isValidNaming) {
   switch (namingChoice.trim()) {
     case "A":
       variant = await askQuestion("🎨 Would you like to define a variant name \n(e.g., primary, secondary, tertiary)? Press Enter to skip: \n>");
       variant = variant.trim() || null;
       if (variant && !/^[a-zA-Z0-9.-]+$/.test(variant)) {
         console.log("❌ Variant name should only contain letters, numbers, hyphens (-), and dots (.)");
       } else {
         isValidNaming = true;
       }
       break;
     case "B":
       variant = await askQuestion("🎨 Would you like to use ordered list name \n(e.g., 01, 02, 03 or 1, 2, 3)? Press Enter to skip: \n>");
       variant = variant.trim() || null;
       if (variant && !/^[0-9]+$/.test(variant) && !/^[0-9]{2}$/.test(variant)) {
         console.log("❌ Ordered criteria name should only contain numbers (e.g., 01, 02 or 1, 2).");
       } else {
         isValidNaming = true;
       }
       break;
     default:
      console.log("=======================================\n");
       console.log("❌ Please choose a valid option (A or B).");
       return;
   }
 }

  console.log("\n=======================================");
  console.log("🔄 STEP 3: SELECTING FORMATS");
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
  console.log("📝 STEP 4: GENERATING COLOR STOPS");
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
  console.log("🚀 STARTING THE PROCESS");
  console.log("=======================================");

  console.log("\n❤️ Welcome to \x1b[1m\x1b[34mColor Tokens Crafter\x1b[0m script! \nFollow the steps below to generate your color(s) \nand make them ready for importing or syncing \nin \x1b[4mTokens Studio\x1b[0m format.");

  const input = await askForInput();
  if (!input) return;

  const { hex, concept, variant, generateRGB, generateRGBA, generateHSL, stops } = input;
  const color = tinycolor(hex);
  const rgb = color.toRgbString();
  const rgba = color.toRgb();
  const hsl = color.toHslString();

  console.log("\n=======================================");
  console.log("📂 STEP 5: GENERATING OUTPUT FILES" );
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

fs.writeFileSync(`${tokensFolder}/tokens.json`, JSON.stringify(tokensData, null, 2));
console.log("✅ Saved: outputs/tokens/tokens.json");


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
  console.log("✅💪 STEP 6: PROCESS COMPLETED SUCCESSFULLY!");
  console.log("=======================================\n");

  console.log("✅ All files have been generated inside 'outputs/tokens/' folder.");
  console.log("📁 You can now use them as needed.\n");

  console.log("Thank you for using the Color Tokens Crafter! ❤️🚀🎨\n");
  console.log("=======================================\n");

  rl.close();
};

main();
