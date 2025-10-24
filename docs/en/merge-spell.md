### 🔄 **Merge Tokens Spell**

<img src="src/assets/merge_spell.png" alt="Merge Spell" width="200">

Version 1.3.3

Conjure a unified design system by merging your token files with the Merge Tokens Spell 🧙! This spell combines multiple token files into a single, cohesive design system file, ensuring consistent naming conventions across your tokens.

1. **Invoke the Spell**  
   Cast the merge spell in your terminal:

   ```sh
   npm run merge
   ```

2. **Select Token Files**  
   Choose the token files you want to merge:

   - Color tokens
   - Typography tokens
   - Space tokens
   - Size tokens
   - Border radius tokens

3. **Configure Token Formats**  
   The spell will automatically review which files are available in your `output/tokens` folder. For each token type found, select your preferred format:

   - Colors: Choose between HEX, RGB, RGBA, HSL or OKLCH
   - Typography: Select units (px, rem, em)
   - Space: Choose units (px, rem, em)
   - Size: Select units (px, rem, em)
   - Border Radius: Choose units (px, rem, em)

4. **Choose Naming Convention**  
    Select how you want your tokens to be named in the merged file:

   - camelCase (e.g., primaryColor, fontSize)
   - kebab-case (e.g., primary-color, font-size)
   - snake_case (e.g., primary_color, font_size)
   - PascalCase (e.g., PrimaryColor, FontSize)

5. **Generate Your Artifacts**  
   Once confirmed, the spell will:

   - Create a merged tokens file in Tokens Studio JSON format
     Stored in: `output_files/final/tokens.json`
   - Create CSS and SCSS files with all your tokens as variables
     Stored in `output_files/final/tokens.css` and `output_files/final/tokens.scss`

6. **Finalize Your Spell**  
   Review the merged files and integrate them into your design system.

---

**Note:**

- The spell ensures all your tokens are properly combined.
- You can always restart a step to adjust your selection.
- The merged files are ready to use in your development workflow.
- All token names will be transformed to match your chosen naming convention.
- All values will be converted to your selected formats.

---