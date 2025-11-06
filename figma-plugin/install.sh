#!/bin/bash

echo "🎨 Installing Design Tokens Wizard Figma Plugin..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "🔨 Building plugin..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build plugin"
    exit 1
fi

echo ""
echo "✅ Plugin built successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Open Figma Desktop"
echo "  2. Go to Plugins → Development → Import plugin from manifest..."
echo "  3. Select the manifest.json file in this directory"
echo "  4. Start using the plugin!"
echo ""
echo "For development with auto-reload:"
echo "  npm run watch"
echo ""
echo "Happy designing! 🎨✨"
