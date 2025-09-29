# FaxSnap Project Structure

## Backend (Supabase)

### Database Tables
- `profiles` - User accounts & token balance
- `user_tokens` - Individual tokens with expiration  
- `token_purchases` - Purchase history
- `token_transactions` - Audit trail
- `faxes` - Sent fax records
- `fax_webhooks` - Telnyx webhook logs

### Edge Functions
1. **create-checkout-session** - POST endpoint
   - Creates Stripe checkout
   - Called by: Frontend (StripeService)
   
2. **stripe-webhook** - POST endpoint  
   - Processes payment completions
   - Called by: Stripe

3. **telnyx-webhook** - POST endpoint
   - Updates fax status
   - Called by: Telnyx

### Database Functions
- `get_active_token_count()` - Count unexpired tokens
- `use_tokens()` - Mark tokens as used  
- `add_tokens_after_purchase()` - Create tokens after payment
- `cleanup_expired_tokens()` - Remove expired tokens

## Frontend (React)

### Service Layer (src/services/)
- `stripe.ts` - Stripe integration
- `telnyx.ts` - Telnyx API calls
- `fileUpload.ts` - File handling

### Component Organization
```
components/
├── Auth/              # Authentication
├── Fax/               # Core fax functionality  
├── FileUpload/        # Document upload
├── Layout/            # Navigation
├── TokenPurchase/     # Token buying
└── UI/                # Reusable components
```

### State Management
- AuthContext - User session & profile
- React Hook Form - Form validation
- Supabase Realtime - Live updates

## API Integration Points

### Frontend → Backend
1. Supabase Client (config/supabase.ts)
   - Auth operations
   - Database queries
   - Edge Function calls

2. Stripe (services/stripe.ts)
   - Checkout creation
   - Payment verification

3. Telnyx (services/telnyx.ts)
   - Fax transmission
   - Status checks

### Backend → External  
1. Stripe API
   - Payment processing
   - Webhook events

2. Telnyx API
   - Fax delivery
   - Status webhooks

## Architecture Overview

```
┌─────────────────────────────────────┐
│   FRONTEND (React + Vite)           │
│   - UI Components                   │
│   - State Management                │
│   - Service Layer                   │
└────────────┬────────────────────────┘
             │
             ↓ Supabase Client
┌─────────────────────────────────────┐
│   BACKEND (Supabase)                │
│   - Database (PostgreSQL)           │
│   - Edge Functions (Deno)           │
│   - Row Level Security              │
└────────────┬────────────────────────┘
             │
             ↓ API Calls
┌─────────────────────────────────────┐
│   EXTERNAL SERVICES                 │
│   - Stripe (payments)               │
│   - Telnyx (fax delivery)           │
└─────────────────────────────────────┘
```

## Data Flow Examples

### 1. Authentication Flow
```
Frontend (AuthForm.tsx)
    ↓ uses
supabase.auth.signUp()
    ↓ creates user in
Supabase Auth
    ↓ triggers
handle_new_user() function
    ↓ creates
profiles table entry
```

### 2. Token Purchase Flow
```
Frontend (TokenPackages.tsx)
    ↓ calls
StripeService.createCheckoutSession()
    ↓ invokes
create-checkout-session Edge Function
    ↓ creates
Stripe Checkout Session
    ↓ user completes payment
Stripe
    ↓ sends webhook to
stripe-webhook Edge Function
    ↓ creates tokens in
user_tokens table
    ↓ syncs count to
profiles.tokens
```

### 3. Fax Sending Flow
```
Frontend (SendFaxForm.tsx)
    ↓ uploads file
FileUploadService
    ↓ sends fax via
telnyxService.sendFax()
    ↓ calls
Telnyx API
    ↓ status updates via webhook
telnyx-webhook Edge Function
    ↓ updates
faxes table
    ↓ triggers
sync_profile_token_count()
```