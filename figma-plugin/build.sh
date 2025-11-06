#!/bin/bash

echo "🔧 Quick Fix: Compiling Figma Plugin"
echo "======================================"
echo ""

# Navigate to plugin directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
    echo ""
fi

# Build the plugin
echo "🔨 Building plugin..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Plugin built successfully!"
echo ""
echo "📁 Generated files:"
ls -lh dist/
echo ""
echo "🎯 Now you can load the plugin in Figma:"
echo "   1. Open Figma Desktop"
echo "   2. Plugins → Development → Import plugin from manifest..."
echo "   3. Select: $(pwd)/manifest.json"
echo ""
