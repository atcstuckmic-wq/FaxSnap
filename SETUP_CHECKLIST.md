# 🚀 FaxSnap Go-Live Checklist

## Phase 1: Accounts Setup (30 mins)

### □ 1. Supabase Setup
- [ ] Click "Supabase" button in Bolt settings
- [ ] Connect your Supabase project
- [ ] Run the database migration (already created)
- [ ] Copy URL and anon key to `.env`

### □ 2. Stripe Setup  
- [ ] Create account at [stripe.com](https://stripe.com)
- [ ] Get publishable and secret keys
- [ ] Add keys to `.env`
- [ ] Set up webhook endpoint (see Phase 2)

### □ 3. Telnyx Setup
- [ ] Create account at [telnyx.com](https://telnyx.com) 
- [ ] Purchase a fax-enabled phone number
- [ ] Get API key from dashboard
- [ ] Add to `.env`

## Phase 2: Deploy Backend (15 mins)

### □ 4. Deploy Supabase Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set environment variables
supabase secrets set STRIPE_SECRET_KEY="sk_..."
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy telnyx-webhook
```

### □ 5. Configure Webhooks
- [ ] Stripe webhook: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
  - Events: `checkout.session.completed`, `payment_intent.payment_failed`
- [ ] Telnyx webhook: `https://YOUR_PROJECT.supabase.co/functions/v1/telnyx-webhook` 
  - Events: `fax.delivered`, `fax.failed`, `fax.sending`

## Phase 3: Test Everything (20 mins)

### □ 6. Test User Flow
- [ ] Register new account
- [ ] Purchase tokens (use Stripe test cards)
- [ ] Send test fax
- [ ] Check status updates
- [ ] Verify token deduction

### □ 7. Test Payment Flow
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Verify webhook received
- [ ] Check tokens added to account
- [ ] Test failed payment: `4000 0000 0000 0002`

### □ 8. Test Fax Flow  
- [ ] Upload test document
- [ ] Send to your own fax number
- [ ] Check Telnyx logs
- [ ] Verify status updates in app

## Phase 4: Go Live (10 mins)

### □ 9. Switch to Production Keys
- [ ] Replace Stripe test keys with live keys
- [ ] Update webhook endpoints to live
- [ ] Test with small purchase first

### □ 10. Monitor Everything
- [ ] Supabase dashboard for database
- [ ] Stripe dashboard for payments  
- [ ] Telnyx portal for fax logs
- [ ] Browser dev tools for errors

## 🎯 Success Metrics

After setup, you should see:
- ✅ Users can register and login
- ✅ Token purchases complete successfully
- ✅ Faxes send and show status updates
- ✅ Webhooks appear in logs
- ✅ Token balances update correctly

## 🆘 Quick Troubleshooting

### Payments Not Working?
```bash
# Check webhook delivery in Stripe dashboard
# Verify environment variables are set
supabase secrets list
```

### Faxes Not Sending?
```bash  
# Check Telnyx API key format
# Verify phone number format (+1234567890)
# Check function logs
supabase functions logs telnyx-webhook --tail
```

### Database Issues?
```bash
# Check if migration ran
# Verify RLS policies in Supabase dashboard
# Test queries in SQL editor
```

## 🚀 You're Live!

Once all checkboxes are complete, your FaxSnap app is **fully operational** with:
- Real user accounts
- Real payments  
- Real fax sending
- Real-time tracking
- Complete audit trail

**Total setup time: ~75 minutes** ⚡