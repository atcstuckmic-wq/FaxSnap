# FaxSnap API Documentation

## Edge Functions

### POST /functions/v1/create-checkout-session

Creates a Stripe checkout session for token purchase.

**Request:**
```json
{
  "packageId": "popular",
  "tokens": 20,
  "amount": 1000,
  "userId": "uuid"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_..."
}
```

**Errors:**
- `400` - Missing required parameters
- `500` - Failed to create checkout session

### POST /functions/v1/stripe-webhook

Handles Stripe webhook events (internal use only).

**Headers:**
- `Stripe-Signature` - Required for webhook verification

**Events Handled:**
- `checkout.session.completed` - Payment successful
- `payment_intent.payment_failed` - Payment failed

**Response:**
- `200` - OK
- `400` - Invalid signature or payload

### POST /functions/v1/telnyx-webhook

Handles Telnyx webhook events (internal use only).

**Events Handled:**
- `fax.delivered` - Fax successfully delivered
- `fax.failed` - Fax delivery failed
- `fax.sending` - Fax is being sent

**Response:**
- `200` - OK
- `400` - Invalid payload

## Database Schema

### Tables

#### profiles
User accounts and token balances.

```sql
profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  tokens integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

#### user_tokens
Individual tokens with expiration tracking.

```sql
user_tokens (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  purchase_id uuid REFERENCES token_purchases(id),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
)
```

#### faxes
Fax transmission records.

```sql
faxes (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  recipient_number text NOT NULL,
  document_url text NOT NULL,
  cover_message text,
  telnyx_fax_id text,
  status text CHECK (status IN ('pending', 'sending', 'delivered', 'failed')),
  tokens_used integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

## Frontend Services

### StripeService

```typescript
class StripeService {
  static isConfigured(): boolean
  static createCheckoutSession(packageData: TokenPackage, userId: string): Promise<void>
  static handleCheckoutSuccess(sessionId: string): Promise<any>
}
```

### TelnyxService

```typescript
class TelnyxService {
  sendFax(data: TelnyxFaxRequest): Promise<TelnyxFaxResponse>
  getFaxStatus(faxId: string): Promise<any>
}
```

### FileUploadService

```typescript
class FileUploadService {
  static uploadFile(file: File): Promise<string>
  static uploadToCloudStorage(file: File): Promise<string>
}
```

## Environment Variables

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_TELNYX_API_KEY=KEY...
VITE_TELNYX_FROM_NUMBER=+1234567890
```

### Backend (Supabase Secrets)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (auto-provided)
```

## Error Handling

### Common Error Responses

**Authentication Required (401):**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**Insufficient Tokens (400):**
```json
{
  "error": "Insufficient tokens",
  "code": "INSUFFICIENT_TOKENS",
  "tokensRequired": 1,
  "tokensAvailable": 0
}
```

**Service Not Configured (400):**
```json
{
  "error": "Service not configured",
  "code": "SERVICE_NOT_CONFIGURED",
  "service": "stripe"
}
```