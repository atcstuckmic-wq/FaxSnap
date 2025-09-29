# 🛠️ FaxSnap Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. "Failed to fetch" Error on Registration

**Symptoms:**
- Error when trying to create account
- Console shows: `Failed to fetch` at Supabase auth

**Root Cause:** Supabase not configured or misconfigured

**Solution:**
1. **Check console for connection test results:**
   ```
   Press F12 → Console tab
   Look for: ✅ Supabase: Configured
   ```

2. **If you see ❌ or ⚪, fix your Supabase setup:**
   ```bash
   # Run our checker script
   chmod +x check-setup.sh
   ./check-setup.sh
   ```

3. **Most common fixes:**
   - `.env` file doesn't exist → `cp .env.example .env`
   - Using placeholder values → Replace with REAL Supabase credentials
   - Forgot to restart dev server → `Ctrl+C`, then `npm run dev`

### 2. Environment Variables Not Working

**Symptoms:**
- Setup checker shows "Not set" or "Contains placeholder"
- App behaves like Supabase isn't configured

**Solution:**
1. **Verify .env file location:**
   ```bash
   # Should be in project root (same folder as package.json)
   ls -la .env
   ```

2. **Check .env content:**
   ```bash
   cat .env
   # Should show REAL values, not placeholders
   ```

3. **Common mistakes:**
   - File named `.env.txt` instead of `.env`
   - Extra spaces around `=` sign
   - Missing quotes around values with special characters
   - Wrong variable names (they're case-sensitive!)

4. **Fix format:**
   ```bash
   # Correct format:
   VITE_SUPABASE_URL=https://abcdef.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   
   # Wrong formats:
   VITE_SUPABASE_URL = https://abcdef.supabase.co  # Extra spaces
   VITE_SUPABASE_URL="https://abcdef.supabase.co"  # Quotes (usually not needed)
   ```

### 3. Supabase Credentials Invalid

**Symptoms:**
- Setup checker shows "Invalid format"
- Still getting fetch errors with credentials set

**Solution:**
1. **Double-check URL format:**
   ```
   ✅ Correct: https://abcdefgh.supabase.co
   ❌ Wrong:   https://abcdefgh.supabase.io
   ❌ Wrong:   abcdefgh.supabase.co (missing https://)
   ```

2. **Double-check anon key:**
   ```
   ✅ Should start with: eyJ
   ✅ Should be very long (200+ characters)
   ❌ Don't use the service_role key (starts with different pattern)
   ```

3. **Get fresh credentials:**
   - Go to Supabase dashboard
   - Project Settings → API
   - Copy "Project URL" and "anon public" key
   - Make sure you're copying the FULL key!

### 4. Database Migration Issues

**Symptoms:**
- Can create account but app doesn't work properly
- Missing database tables

**Solution:**
1. **Run the migration:**
   - Supabase dashboard → SQL Editor → New Query
   - Copy content from `supabase/migrations/20250928223951_noisy_field.sql`
   - Paste and run
   - Should see "Success. No rows returned"

2. **Verify tables were created:**
   - Table Editor → Should see: `profiles`, `faxes`, `token_purchases`, `fax_webhooks`

### 5. App Won't Start

**Symptoms:**
- `npm run dev` fails
- Port already in use
- Module not found errors

**Solutions:**

**Port conflict:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Node.js version:**
```bash
# Check version (needs 18+)
node --version

# If too old, update from nodejs.org
```

### 6. Console Warnings/Errors

**Common console messages and what they mean:**

```bash
⚠️ Supabase not configured. Using mock client.
→ Fix: Follow QUICKSTART.md to set up Supabase

❌ VITE_SUPABASE_URL: Invalid format  
→ Fix: Should be https://project-id.supabase.co

✅ Supabase: Configured
→ Great! Everything should work

🚨 CRITICAL: Supabase must be configured for the app to work!
→ Fix: Set up your Supabase project and credentials
```

### 7. Still Not Working?

**Nuclear option (start fresh):**
```bash
# 1. Clean everything
rm -rf node_modules package-lock.json .env dist

# 2. Reinstall
npm install

# 3. Create fresh .env
cp .env.example .env

# 4. Edit .env with your REAL credentials
# (Use text editor to add your Supabase URL and key)

# 5. Start dev server
npm run dev

# 6. Run checker
chmod +x check-setup.sh
./check-setup.sh
```

**Check system requirements:**
```bash
# Node.js 18+
node --version

# npm 8+  
npm --version

# Git (for some dependencies)
git --version
```

---

## 🔧 Debugging Tools

### Console Connection Test
Every time you start the app, check the browser console for:
```
🔍 Connection Test Results:
✅ Supabase: Properly configured
⚪ Stripe: Not configured (optional for testing)  
⚪ Telnyx: Not configured (optional for testing)
```

### Setup Checker Script
```bash
chmod +x check-setup.sh
./check-setup.sh
```

### Manual Environment Check
```bash
# Check if .env exists and has content
cat .env

# Check if variables are loaded in browser
# F12 → Console → Type:
import.meta.env.VITE_SUPABASE_URL
```

---

## 📞 Getting Help

If you're still stuck after trying these solutions:

1. **Run the setup checker and share the output**
2. **Share your console output** (F12 → Console)
3. **Confirm you followed QUICKSTART.md step-by-step**

Most issues are simple configuration problems that take 2-3 minutes to fix once you know what to look for! 🎯