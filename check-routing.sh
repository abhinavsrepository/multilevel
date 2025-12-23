#!/bin/bash

echo "🔍 React Router Deployment Diagnostic"
echo "======================================"

# Check if render.yaml exists
if [ -f "render.yaml" ]; then
  echo "✅ Root render.yaml found"
  if grep -q "type: rewrite" render.yaml; then
    echo "✅ SPA rewrite rules present in render.yaml"
    grep -A 2 "type: rewrite" render.yaml | head -3
  else
    echo "❌ No rewrite rules in render.yaml"
  fi
else
  echo "⚠️  Root render.yaml not found"
fi

# Check user panel
echo ""
echo "📱 User Panel Configuration:"
echo "------------------------------------"
if [ -f "react-user-panel/public/_redirects" ]; then
  echo "✅ _redirects file exists:"
  echo "   Content: $(cat react-user-panel/public/_redirects)"
else
  echo "❌ _redirects file missing"
fi

if [ -f "react-user-panel/render.json" ]; then
  echo "✅ render.json exists"
else
  echo "⚠️  render.json not found (OK if using root render.yaml)"
fi

if [ -f "react-user-panel/render.yaml" ]; then
  echo "✅ render.yaml exists"
else
  echo "⚠️  render.yaml not found"
fi

# Check admin panel
echo ""
echo "🔧 Admin Panel Configuration:"
echo "------------------------------------"
if [ -f "react-admin-panel/public/_redirects" ]; then
  echo "✅ _redirects file exists:"
  echo "   Content: $(cat react-admin-panel/public/_redirects)"
else
  echo "❌ _redirects file missing"
fi

if [ -f "react-admin-panel/render.json" ]; then
  echo "✅ render.json exists"
else
  echo "⚠️  render.json not found (OK if using root render.yaml)"
fi

if [ -f "react-admin-panel/render.yaml" ]; then
  echo "✅ render.yaml exists"
else
  echo "⚠️  render.yaml not found"
fi

# Check build output
echo ""
echo "🏗️  Build Configuration:"
echo "------------------------------------"
if [ -d "react-user-panel/dist" ]; then
  echo "✅ User panel dist directory exists"
  if [ -f "react-user-panel/dist/index.html" ]; then
    echo "✅ dist/index.html exists"
  else
    echo "❌ dist/index.html missing - run npm run build"
  fi
else
  echo "⚠️  User panel dist directory not found - run npm run build"
fi

if [ -d "react-admin-panel/dist" ]; then
  echo "✅ Admin panel dist directory exists"
  if [ -f "react-admin-panel/dist/index.html" ]; then
    echo "✅ dist/index.html exists"
  else
    echo "❌ dist/index.html missing - run npm run build"
  fi
else
  echo "⚠️  Admin panel dist directory not found - run npm run build"
fi

# Check package.json scripts
echo ""
echo "📦 Package Scripts:"
echo "------------------------------------"
if grep -q "render-build" react-user-panel/package.json; then
  echo "✅ User panel has render-build script"
else
  echo "⚠️  User panel missing render-build script"
fi

if grep -q "render-build" react-admin-panel/package.json; then
  echo "✅ Admin panel has render-build script"
else
  echo "⚠️  Admin panel missing render-build script"
fi

# Check for service worker
echo ""
echo "⚙️  Service Worker Check:"
echo "------------------------------------"
if grep -q "VitePWA" react-user-panel/vite.config.ts; then
  echo "⚠️  User panel has PWA enabled (may cause caching issues)"
  echo "   Set VITE_ENABLE_PWA=false to disable"
else
  echo "✅ User panel PWA not detected"
fi

# Summary
echo ""
echo "======================================"
echo "📊 Summary:"
echo "======================================"

ISSUES=0

if [ ! -f "render.yaml" ] && [ ! -f "react-user-panel/render.json" ]; then
  echo "❌ No routing configuration found!"
  ISSUES=$((ISSUES + 1))
fi

if [ ! -f "react-user-panel/public/_redirects" ]; then
  echo "❌ User panel _redirects missing"
  ISSUES=$((ISSUES + 1))
fi

if [ ! -f "react-admin-panel/public/_redirects" ]; then
  echo "❌ Admin panel _redirects missing"
  ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
  echo "✅ All routing configurations present"
  echo ""
  echo "💡 If still getting 404 errors:"
  echo "   1. Clear browser cache (Ctrl+Shift+Delete)"
  echo "   2. Unregister service workers (F12 → Application → Service Workers)"
  echo "   3. Hard refresh (Ctrl+Shift+R)"
  echo "   4. Check Render deployment logs"
else
  echo "❌ Found $ISSUES configuration issues"
  echo ""
  echo "🔧 Recommended fixes:"
  echo "   1. Ensure _redirects files exist in public/ directories"
  echo "   2. Create render.json files or use root render.yaml"
  echo "   3. Redeploy after fixing"
fi

echo ""
echo "======================================"
echo "✅ Diagnostic complete"
echo "======================================"
