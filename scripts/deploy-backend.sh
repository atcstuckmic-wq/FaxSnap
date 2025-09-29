#!/bin/bash

# FaxSnap Backend Deployment Script
# Run this after setting up your Supabase secrets

echo "🚀 Deploying FaxSnap Backend..."
echo "==============================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "   Install with: npm install -g supabase"
    exit 1
fi

# Check if we're linked to a project
if [ ! -f ./.supabase/config.toml ]; then
    echo "❌ Not linked to a Supabase project"
    echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "🔍 Checking Supabase secrets..."

# Check if required secrets are set
SECRETS=$(supabase secrets list --format json 2>/dev/null || echo "[]")

if ! echo "$SECRETS" | grep -q "STRIPE_SECRET_KEY"; then
    echo "❌ STRIPE_SECRET_KEY not set"
    echo "   Run: supabase secrets set STRIPE_SECRET_KEY=\"sk_test_...\""
    echo "   Get key from: https://dashboard.stripe.com/test/apikeys"
    exit 1
fi

if ! echo "$SECRETS" | grep -q "STRIPE_WEBHOOK_SECRET"; then
    echo "❌ STRIPE_WEBHOOK_SECRET not set"
    echo "   Run: supabase secrets set STRIPE_WEBHOOK_SECRET=\"whsec_...\""
    echo "   Get secret after creating webhook endpoint in Stripe"
    exit 1
fi

echo "✅ Required secrets are configured"

echo ""
echo "📦 Deploying Edge Functions..."

# Deploy create-checkout-session function
echo "   Deploying create-checkout-session..."
if supabase functions deploy create-checkout-session; then
    echo "   ✅ create-checkout-session deployed"
else
    echo "   ❌ Failed to deploy create-checkout-session"
    exit 1
fi

# Deploy stripe-webhook function
echo "   Deploying stripe-webhook..."
if supabase functions deploy stripe-webhook; then
    echo "   ✅ stripe-webhook deployed"
else
    echo "   ❌ Failed to deploy stripe-webhook"
    exit 1
fi

# Deploy telnyx-webhook function
echo "   Deploying telnyx-webhook..."
if supabase functions deploy telnyx-webhook; then
    echo "   ✅ telnyx-webhook deployed"
else
    echo "   ❌ Failed to deploy telnyx-webhook"
    exit 1
fi

echo ""
echo "🎉 Backend deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Configure Stripe webhook endpoint:"
echo "   URL: https://$(supabase status | grep 'API URL' | awk '{print $3}' | sed 's|https://||')/functions/v1/stripe-webhook"
echo "   Events: checkout.session.completed, payment_intent.payment_failed"
echo ""
echo "2. Configure Telnyx webhook URL:"
echo "   URL: https://$(supabase status | grep 'API URL' | awk '{print $3}' | sed 's|https://||')/functions/v1/telnyx-webhook"
echo ""
echo "3. Test your deployment:"
echo "   - Make a test purchase with Stripe test card: 4242 4242 4242 4242"
echo "   - Send a test fax to verify Telnyx integration"
echo ""
echo "📖 View function logs with:"
echo "   supabase functions logs stripe-webhook --tail"
echo "   supabase functions logs telnyx-webhook --tail"