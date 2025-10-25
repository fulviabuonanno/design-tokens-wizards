## 🔤 **Typography Tokens Wizard**

<img src="src/assets/typo_wiz.png" alt="Typography Wizard" width="200">

![Typography Wizard](https://img.shields.io/badge/Typography%20Wiz-v1.2.3-red)

Craft a harmonious typographic elixir for your design system with the Typography Tokens Wizard 🧙! This wizard helps you blend font families, sizes, weights, spacing, and heights into a cohesive typography system.

1. **Invoke the Wizard**  
   Cast the typography spell in your terminal:

   ```sh
   npm run typo
   ```

2. **Choose Your Properties**  
   Select which typography properties you wish to configure:

   - Font Families
   - Font Sizes
   - Font Weights
   - Letter Spacing
   - Line Heights

3. **Configure Font Family**

   - Name your property (fontFamily, font-family, fonts, ff, or custom)
   - Define 1–3 font families with fallbacks
   - Choose naming convention:
     - Semantic (primary, secondary, tertiary)
     - Purpose-based (title, body, details)
     - Ordinal (1, 2, 3, 4)
     - Alphabetical (A, B, C, D)

4. **Configure Font Size**

   - Name your property (fontSize, font-size, size, fs, or custom)
   - Select scale type:
     - 4-Point Grid
     - 8-Point Grid
     - Modular Scale
     - Custom Intervals
     - Fibonacci Scale
   - Choose unit (px, rem, em)
   - Define 1–12 sizes with naming convention:
     - T-shirt (xs, sm, md, lg, xl)
     - Incremental (100, 200, 300, 400)
     - Ordinal (1, 2, 3, 4)
     - Alphabetical (A, B, C, D)

5. **Configure Font Weight**

   - Name your property (fontWeight, font-weight, weight, fw, or custom)
   - Select from standard weights (100–900)
   - Choose naming convention:
     - T-shirt (xs to xl)
     - Semantic (thin to bold)
     - Ordinal (1 to 5)
     - Purpose-based (body, heading...)

6. **Configure Letter Spacing**

   - Name your property (letterSpacing, letter-spacing, tracking, ls, or custom)
   - Choose scale type:
     - Predetermined Scale (-1.25 to 6.25)
     - Custom Values
   - Select unit (em, rem, %)
   - Define 1–7 values with naming convention:
     - T-shirt (xs to xl)
     - Incremental (100, 200, 300...)
     - Ordinal (01, 02... or 1, 2...)
     - Alphabetical (a, b, c...)

7. **Configure Line Height**

   - Name your property (lineHeight, line-height, leading, lh, or custom)
   - Choose scale type:
     - Predetermined Scale 1 (1.1, 1.25, 1.5, 1.6, 1.75, 2.0)
     - Predetermined Scale 2 (1.0, 1.2, 1.5, 1.6, 2.0)
     - Custom Values
   - Choose naming convention:
     - T-shirt (xs to xl)
     - Semantic (tight, normal, loose, relaxed, spacious)
     - Ordinal (1 to 5)
     - Purpose-based (body, heading, display, compact, expanded)
     - Incremental (100, 200, 300...)
     - Alphabetical (a, b, c...)

8. **Preview Your Tokens**  
   For each property, you'll see a preview table showing your configured values.

9. **Generate Your Artifacts**  
   Once confirmed, the wizard will:

   - Export your tokens in Tokens Studio JSON format
     Stored in: `output_files/tokens/json/typography/typography_tokens.json`
   - Generate CSS and SCSS files
     - CSS: `output_files/tokens/css/typography/typography_variables.css`
     - SCSS: `output_files/tokens/scss/typography/typography_variables.scss`

10. **Finalize Your Spell**  
    Review the output files and integrate your typography tokens into your system.

---

**Note:**

- Each step includes accessibility guidelines and recommendations.
- The wizard suggests optimal values while allowing customization.
- You can always restart a step to adjust your input.

---
