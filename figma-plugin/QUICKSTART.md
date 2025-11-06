# ⚡ Quick Start Guide

## 🔥 Fix the Error: "ENOENT: no such file or directory"

You're seeing this error because the `dist/` folder is not included in the Git repository. You need to build it locally!

## 🛠️ Step 1: Build the Plugin (Required!)

Open your terminal and run:

```bash
cd /Users/fbuonanno/Documents/GitHub/design-tokens-wizards/figma-plugin
npm install
npm run build
```

Or use the quick script:

```bash
cd /Users/fbuonanno/Documents/GitHub/design-tokens-wizards/figma-plugin
./build.sh
```

You should see:
```
✓ npm install - dependencies installed
✓ tsc - TypeScript compiled
✓ cp src/ui.html dist/ui.html - UI copied
✓ dist/code.js created
✓ dist/ui.html created
```

## 📂 Verify the Build

Check that these files exist:

```bash
ls -l dist/
```

You should see:
```
dist/code.js
dist/ui.html
```

## 🎨 Step 2: Load in Figma

Now you can load the plugin:

1. **Open Figma Desktop** (not web version!)

2. **Go to:** `Plugins` → `Development` → `Import plugin from manifest...`

3. **Select:** `/Users/fbuonanno/Documents/GitHub/design-tokens-wizards/figma-plugin/manifest.json`

4. **Run:** `Plugins` → `Development` → `Design Tokens Wizard`

## ✅ That's It!

The plugin should now open without errors.

## 🎯 Quick Test

Once the plugin opens:

1. **Color Name:** `blue`
2. **Base Color:** `#3B82F6`
3. **Scale Type:** `Incremental`
4. Click **"Generate Preview"**
5. Click **"Create Figma Styles"**

Check your Local Styles panel - you should see:
- `blue/base`
- `blue/100`, `blue/200`, etc.

---

## 🐛 Still Having Issues?

### Error: "npm: command not found"
You need to install Node.js:
- Download: https://nodejs.org/
- Install it, then try again

### Error: "Permission denied"
Make the build script executable:
```bash
chmod +x build.sh
./build.sh
```

### Error: "Plugin still doesn't load"
1. Make sure `dist/code.js` and `dist/ui.html` exist
2. Restart Figma Desktop completely
3. Try importing the plugin again

### Error: "Cannot find module"
Delete and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Need More Help?

- Full guide: `README.md`
- Testing guide: `TESTING_GUIDE.md`
- Architecture: `ARCHITECTURE.md`

## 💡 Pro Tip: Watch Mode

For continuous development:

```bash
npm run watch
```

This will auto-rebuild when you edit `src/code.ts`. Just reload the plugin in Figma after changes!
