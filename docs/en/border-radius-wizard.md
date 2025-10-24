## 🔲 **Border Radius Tokens Wizard**

<img src="src/assets/radii_wiz.png" alt="Border Radius Wizard" width="200">

Version 1.7.2

Conjure the perfect border radius system for your design with the Border Radius Tokens Wizard 🧙! This wizard helps you create a harmonious set of border radius tokens that will bring elegance and consistency to your UI elements.

1. **Invoke the Wizard**  
   Cast the border radius spell in your terminal:

   ```sh
   npm run radius
   ```

2. **Define Base Unit**  
   The default base unit for border radius tokens is pixels (px).

3. **Name Your Border Radius Tokens**  
   Provide a name for your border radius tokens (e.g., radius, rad).

4. **Select Scale Type**  
   Choose a predefined scale for your tokens:

   - 4-Point Grid System
   - 8-Point Grid System
   - Modular Scale (multiplier based)
   - Custom Intervals
   - Fibonacci Scale

5. **Set Number of Values**  
   Specify how many border radius values you want to generate (e.g., 6 values for a small-to-large scale).

6. **Choose Naming Convention**  
   Select a naming pattern for your border radius tokens:

   - T-shirt Sizes (xs, sm, md, lg, xl)
   - Incremental (100, 200, 300, 400)
   - Ordinal (1, 2, 3, 4)
   - Alphabetical (A, B, C, D)

7. **Preview Your Tokens**  
   The wizard will show your border radius tokens preview:

   ```
   Name: Radius
   ┌─────────┬─────────┐
   │ Scale   │ Value   │
   ├─────────┼─────────┤
   │ 01      │ 4px     │
   │ 02      │ 8px     │
   │ 03      │ 12px    │
   │ 04      │ 16px    │
   └─────────┴─────────┘
   ```

8. **Generate Your Artifacts**  
   Once confirmed, the wizard will:

   - Export your tokens in Tokens Studio JSON format
     Stored in: `output_files/tokens/radius/radius_tokens_{unit}.json`
   - Create CSS and SCSS files with your tokens as variables
     Stored in `output_files/tokens/css/radius/radius_variables_{unit}.css` and `output_files/tokens/scss/radius/radius_variables_{unit}.scss`

9. **Finalize Your Spell**  
   Review the output files and integrate your border radius tokens into your system.

---