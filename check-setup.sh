#!/bin/bash

echo "🔍 FaxSnap Setup Checker"
echo "========================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file missing"
    echo "   Run: cp .env.example .env"
    echo ""
else
    echo "✅ .env file exists"
fi

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not installed"
    echo "   Install from: https://nodejs.org"
fi

# Check npm
NPM_VERSION=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ npm: v$NPM_VERSION"
else
    echo "❌ npm not installed"
fi

echo ""
echo "📋 Environment Variables:"
echo "------------------------"

if [ -f ".env" ]; then
    # Check Supabase URL
    SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d '=' -f2)
    if [ -z "$SUPABASE_URL" ]; then
        echo "❌ VITE_SUPABASE_URL: Not set"
    elif [[ "$SUPABASE_URL" == *"your-project"* ]] || [[ "$SUPABASE_URL" == *"xxxxx"* ]]; then
        echo "❌ VITE_SUPABASE_URL: Contains placeholder"
    elif [[ "$SUPABASE_URL" == *"supabase.co"* ]]; then
        echo "✅ VITE_SUPABASE_URL: Configured"
    else
        echo "⚠️  VITE_SUPABASE_URL: Invalid format"
    fi

    # Check Supabase Key
    SUPABASE_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d '=' -f2)
    if [ -z "$SUPABASE_KEY" ]; then
        echo "❌ VITE_SUPABASE_ANON_KEY: Not set"
    elif [[ "$SUPABASE_KEY" == *"your_anon_key"* ]]; then
        echo "❌ VITE_SUPABASE_ANON_KEY: Contains placeholder"
    elif [[ "$SUPABASE_KEY" == eyJ* ]] && [ ${#SUPABASE_KEY} -gt 100 ]; then
        echo "✅ VITE_SUPABASE_ANON_KEY: Configured"
    else
        echo "⚠️  VITE_SUPABASE_ANON_KEY: Invalid format"
    fi

    # Check optional services
    STRIPE_KEY=$(grep "VITE_STRIPE_PUBLISHABLE_KEY" .env | cut -d '=' -f2)
    if [ -z "$STRIPE_KEY" ]; then
        echo "⚪ VITE_STRIPE_PUBLISHABLE_KEY: Not set (optional)"
    else
        echo "✅ VITE_STRIPE_PUBLISHABLE_KEY: Set"
    fi

    TELNYX_KEY=$(grep "VITE_TELNYX_API_KEY" .env | cut -d '=' -f2)
    if [ -z "$TELNYX_KEY" ]; then
        echo "⚪ VITE_TELNYX_API_KEY: Not set (optional)"
    else
        echo "✅ VITE_TELNYX_API_KEY: Set"
    fi
fi

echo ""
echo "📦 Dependencies:"
echo "---------------"

if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules missing"
    echo "   Run: npm install"
fi

if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"
else
    echo "⚠️  package-lock.json missing"
fi

echo ""
echo "🎯 Next Steps:"
echo "-------------"

# Check if everything is configured
if [ -f ".env" ]; then
    SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d '=' -f2)
    SUPABASE_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d '=' -f2)
    
    if [[ "$SUPABASE_URL" == *"supabase.co"* ]] && [[ "$SUPABASE_KEY" == eyJ* ]]; then
        echo "🎉 Your setup looks good!"
        echo "   1. Run: npm run dev"
        echo "   2. Open browser console (F12)"
        echo "   3. Look for: ✅ Supabase: Configured"
        echo "   4. Try creating an account!"
    else
        echo "🔧 Setup needed:"
        echo "   1. Follow QUICKSTART.md"
        echo "   2. Set up Supabase credentials"
        echo "   3. Run this checker again"
    fi
else
    echo "🔧 Setup needed:"
    echo "   1. Copy .env.example to .env"
    echo "   2. Follow QUICKSTART.md"
    echo "   3. Run this checker again"
fi