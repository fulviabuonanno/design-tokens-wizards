## 📏 **Size Tokens Wizard**

<img src="src/assets/size_wiz.png" alt="Size Wizard" width="200">

Version 1.7.2

Conjure the perfect sizing system for your design with the Size Tokens Wizard 🧙! This wizard helps you create a harmonious set of size tokens that will bring consistency and precision to your layouts.

1. **Invoke the Wizard**  
   Cast the size spell in your terminal:

   ```sh
   npm run size
   ```

2. **Define Base Unit**  
   The default base unit for size tokens is pixels (px).

3. **Name Your Size Tokens**  
   Provide a name for your size tokens (e.g., size, sz).

4. **Select Scale Type**  
   Choose a predefined scale for your tokens:

   - 4-Point Grid System
   - 8-Point Grid System
   - Modular Scale (multiplier based)
   - Custom Intervals
   - Fibonacci Scale

5. **Set Number of Values**  
   Specify how many size values you want to generate (e.g., 6 values for a small-to-large scale).

6. **Choose Naming Convention**  
   Select a naming pattern for your size tokens:

   - T-shirt Sizes (xs, sm, md, lg, xl)
   - Incremental (100, 200, 300, 400)
   - Ordinal (1, 2, 3, 4)
   - Alphabetical (A, B, C, D)

7. **Preview Your Tokens**  
   The wizard will show your size tokens preview:

   ```
   Name: Size
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
     Stored in: `output_files/tokens/size/size_tokens_{unit}.json`
   - Create CSS and SCSS files with your tokens as variables
     Stored in `output_files/tokens/css/size/size_variables_{unit}.css` and `output_files/tokens/scss/size/size_variables_{unit}.scss`

9. **Finalize Your Spell**  
   Review the output files and integrate your size tokens into your system.

---