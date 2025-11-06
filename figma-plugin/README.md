# 🎨 Design Tokens Wizard - Figma Plugin

A powerful Figma plugin that brings the magic of the Design Tokens Wizard CLI directly into your Figma workspace. Generate beautiful, consistent color scales and sync them as Figma color styles instantly!

## ✨ Features

- **🎯 Multiple Scale Types**
  - Incremental (100, 200, 300...)
  - Ordinal (1, 2, 3... or 01, 02, 03...)
  - Alphabetical (A, B, C... or a, b, c...)
  - Semantic (light, base, dark, lighter, darker...)

- **🚀 Batch Mode**
  - Add multiple colors at once
  - All colors share the same scale configuration
  - Perfect for creating complete color systems quickly

- **🎭 Smart Naming**
  - Optional category (primitives, foundation, core...)
  - Optional naming level (color, palette, scheme...)
  - Hierarchical organization for design systems

- **💎 Figma Integration**
  - Creates/updates Figma color styles automatically
  - Follows Figma's naming conventions with "/" separators
  - Exports Design Tokens (JSON) format
  - Compatible with Tokens Studio for Figma

## 🚀 Installation

### ⚠️ IMPORTANT: Build Required

**If you cloned this repository, you MUST build the plugin first!**

The compiled files (`dist/`) are not included in the repository. Run this before loading the plugin:

```bash
cd design-tokens-wizards/figma-plugin
npm install
npm run build
```

Or use the quick build script:
```bash
cd design-tokens-wizards/figma-plugin
./build.sh
```

**Common Error:**
```
Error: ENOENT: no such file or directory, lstat '.../figma-plugin/dist/code.js'
```
**Solution:** You forgot to run `npm run build`. The dist/ folder needs to be generated locally.

---

### Option 1: Install from Figma Community (Coming Soon)

Search for "Design Tokens Wizard" in Figma's Community plugins.

### Option 2: Install Locally for Development

1. **Clone the repository:**
   ```bash
   cd design-tokens-wizards/figma-plugin
   ```

2. **Install dependencies & Build:**
   ```bash
   npm install
   npm run build
   ```

   This will create the `dist/` folder with:
   - `dist/code.js` (compiled plugin code)
   - `dist/ui.html` (plugin interface)

3. **Load in Figma:**
   - Open Figma Desktop (NOT web version)
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file in the `figma-plugin` directory
   - The plugin will now appear in your plugins list

## 📖 How to Use

### 1. Launch the Plugin

- In Figma, go to `Plugins` → `Design Tokens Wizard`
- The plugin interface will open

### 2. Configure Your Color

**Color Setup:**
- **Color Name**: Enter a name for your color (e.g., "blue", "primary", "brand")
- **Base Color**: Choose your base color using the color picker or enter a HEX value
- **Batch Mode**: Check this to add multiple colors with the same scale settings

**Scale Configuration:**
- **Scale Type**: Choose from Incremental, Ordinal, Alphabetical, or Semantic
- **Number of Stops**: How many color variations to generate (1-20)
- **Additional Options**: Depending on the scale type:
  - Incremental: Step size (100, 50, 25, 10) and start value
  - Ordinal: Padded numbers (01, 02) or unpadded (1, 2)
  - Alphabetical: Uppercase or lowercase letters

**Naming Structure:**
- **Category** (optional): Organize colors into groups (e.g., "primitives", "foundation")
- **Naming Level** (optional): Add context (e.g., "color", "palette", "scheme")

### 3. Generate Preview

Click **"Generate Preview"** to see your color scale before creating styles.

### 4. Create Figma Styles

Click **"Create Figma Styles"** to automatically create color styles in Figma.

**Style Naming Example:**
```
primitives/color/blue/base
primitives/color/blue/100
primitives/color/blue/200
primitives/color/blue/300
...
```

### 5. Export Tokens (Optional)

Click **"Export JSON"** to download a Design Tokens JSON file compatible with:
- Tokens Studio for Figma
- Style Dictionary
- Other design token tools

## 🎯 Example Workflows

### Example 1: Simple Color Scale

1. Color Name: `blue`
2. Base Color: `#3B82F6`
3. Scale Type: `Incremental`
4. Step Size: `100`
5. Number of Stops: `10`
6. Start Value: `100`

**Result:** Creates styles named:
- `blue/base`
- `blue/100`, `blue/200`, `blue/300`, ... `blue/1000`

### Example 2: Design System with Hierarchy

1. Color Name: `primary`
2. Base Color: `#6366F1`
3. Scale Type: `Semantic`
4. Number of Stops: `10`
5. Category: `primitives`
6. Naming Level: `color`

**Result:** Creates styles named:
- `primitives/color/primary/ultra-dark`
- `primitives/color/primary/darkest`
- `primitives/color/primary/darker`
- `primitives/color/primary/dark`
- `primitives/color/primary/semi-dark`
- `primitives/color/primary/base`
- `primitives/color/primary/semi-light`
- `primitives/color/primary/light`
- `primitives/color/primary/lighter`
- `primitives/color/primary/lightest`
- `primitives/color/primary/ultra-light`

### Example 3: Batch Mode - Multiple Colors

1. Enable Batch Mode checkbox
2. Add colors:
   - Blue: `#3B82F6`, name: `blue`
   - Green: `#10B981`, name: `green`
   - Red: `#EF4444`, name: `red`
3. Scale Type: `Incremental`
4. Category: `foundation`
5. Naming Level: `palette`

**Result:** Creates styles for all three colors with the same scale:
- `foundation/palette/blue/100`, `foundation/palette/blue/200`, ...
- `foundation/palette/green/100`, `foundation/palette/green/200`, ...
- `foundation/palette/red/100`, `foundation/palette/red/200`, ...

## 🔧 Development

### Build for Development

```bash
npm run build
```

### Watch Mode (Auto-rebuild on changes)

```bash
npm run watch
```

### Project Structure

```
figma-plugin/
├── manifest.json          # Plugin configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── src/
│   ├── code.ts          # Plugin code (Figma API)
│   └── ui.html          # Plugin UI
└── dist/                # Compiled output
    ├── code.js
    └── ui.html
```

## 🤝 Integration with CLI Wizard

This plugin shares the same color generation logic as the CLI `color_wiz.js`, ensuring consistency across your workflow:

- **CLI**: Generate tokens in your project locally, commit to version control
- **Plugin**: Quickly test and apply color scales directly in Figma designs

### Shared Core Module

The color generation logic is extracted into `src/core/colorGenerator.js` which can be used by:
- The CLI wizard (`color_wiz.js`)
- The Figma plugin
- Any other tools in your pipeline

## 📝 Design Tokens JSON Format

The exported JSON follows the Design Tokens Community Group specification:

```json
{
  "primitives": {
    "color": {
      "blue": {
        "base": {
          "$value": "#3B82F6",
          "$type": "color"
        },
        "100": {
          "$value": "#DBEAFE",
          "$type": "color"
        }
      }
    }
  }
}
```

## 🐛 Troubleshooting

**Plugin doesn't appear in Figma:**
- Make sure you've run `npm run build` first
- Check that you're using Figma Desktop (not browser version)
- Verify the manifest.json path is correct

**Colors look different than expected:**
- The plugin uses the same mixing algorithm as the CLI
- Default mix range is 10%-90% to avoid pure white/black
- You can adjust this in the code if needed

**Styles not creating:**
- Check that you've clicked "Generate Preview" first
- Verify your color names don't have invalid characters
- Make sure you have permission to create styles in the file

## 📚 Resources

- [Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [Tokens Studio for Figma](https://tokens.studio/)

## 🎉 Credits

Created by **Fulvia Buonanno** as part of the Design Tokens Wizards project.

## 📄 License

MIT License - Feel free to use and modify!

---

**Happy designing! 🎨✨**
