## 🔳 **Space Tokens Wizard**

<img src="src/assets/space_wiz.png" alt="Space Wizard" width="200">

![Space Wizard](https://img.shields.io/badge/Space%20Wiz-v1.7.2-blueviolet)

Conjure the perfect spacing system for your design with the Space Tokens Wizard 🧙! This wizard helps you create a harmonious set of spacing tokens that will bring balance and rhythm to your layouts.

1. **Invoke the Wizard**  
   Cast the space spell in your terminal:

   ```sh
   npm run space
   ```

2. **Define Base Unit**  
   The default base unit for space tokens is pixels (px).

3. **Name Your Space Tokens**  
   Provide a name for your space tokens (e.g., space, spc).

4. **Select Scale Type**  
   Choose a predefined scale for your tokens:

   - 4-Point Grid System
   - 8-Point Grid System
   - Modular Scale (multiplier based)
   - Custom Intervals
   - Fibonacci Scale

5. **Set Number of Values**  
   Specify how many space values you want to generate (e.g., 6 values for a small-to-large scale).

6. **Choose Naming Convention**  
   Select a naming pattern for your space tokens:

   - T-shirt Sizes (xs, sm, md, lg, xl)
   - Incremental (100, 200, 300, 400)
   - Ordinal (1, 2, 3, 4)
   - Alphabetical (A, B, C, D)

7. **Preview Your Tokens**  
   The wizard will show your space tokens preview:

   ```
   Name: Space
   ┌─────────┬─────────┐
   │ Scale   │ Value   │
   ├─────────┼─────────┤
   │ 01      │ 16px    │
   │ 02      │ 24px    │
   │ 03      │ 32px    │
   │ 04      │ 40px    │
   └─────────┴─────────┘
   ```

8. **Generate Your Artifacts**  
   Once confirmed, the wizard will:

   - Export your tokens in Tokens Studio JSON format
     Stored in: `output_files/tokens/space/space_tokens_{unit}.json`
   - Create CSS and SCSS files with your tokens as variables
     Stored in `output_files/tokens/css/space/space_variables_{unit}.css` and `output_files/tokens/scss/space/space_variables_{unit}.scss`

9. **Finalize Your Spell**  
   Review the output files and integrate your space tokens into your system.

---
