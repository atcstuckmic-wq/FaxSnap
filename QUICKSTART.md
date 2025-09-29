# ⚡ FaxSnap Quick Start (5 minutes)

## Getting "failed to fetch" error? Start here! 👇

### 1️⃣ Create a Supabase Account (2 min)

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with GitHub or email

### 2️⃣ Create a New Project (2 min)

1. Click **"New Project"**
2. Fill in:
   - **Name**: `FaxSnap`
   - **Database Password**: Make one up (save it!)
   - **Region**: Pick one close to you
3. Click **"Create new project"**
4. ☕ Wait ~2 minutes while it sets up

### 3️⃣ Get Your Credentials (30 sec)

1. Click **"Project Settings"** (gear icon) → **"API"**
2. Copy these two values:

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGci...
   ```

### 4️⃣ Set Up Your App (1 min)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env and paste your credentials:
# Open .env in your editor and replace:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5️⃣ Set Up the Database (1 min)

1. In Supabase dashboard: Click **"SQL Editor"** → **"New Query"**
2. Open `supabase/migrations/20250928223951_noisy_field.sql` from your project
3. Copy ALL the SQL code
4. Paste into Supabase SQL editor
5. Click **"Run"**
6. Should see: "Success. No rows returned"

### 6️⃣ Start the App (30 sec)

```bash
npm run dev
```

### 7️⃣ Test It! (30 sec)

1. Open browser to **http://localhost:5173**
2. Press **F12** → **Console** tab
3. Look for:
   ```
   ✅ Supabase: Configured
   ```
4. Try **creating an account**!

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] `.env` file exists with REAL credentials
- [ ] SQL migration ran successfully  
- [ ] Dev server shows "✅ Supabase: Configured" in console
- [ ] Can create an account without errors

---

## ❌ Still Having Issues?

1. **Did you restart the dev server after editing .env?**
   - Stop with Ctrl+C
   - Run `npm run dev` again

2. **Run the setup checker:**
   ```bash
   chmod +x check-setup.sh
   ./check-setup.sh
   ```

3. **Check the detailed guide:**
   - See `TROUBLESHOOTING.md` for step-by-step help

4. **Verify your .env has NO placeholders:**
   ```bash
   cat .env
   # Should show REAL values, not "your-project-id"
   ```

---

## 🎉 What's Next?

Once you can create an account:

### For Testing (Optional):
- **Stripe**: Get test keys from [stripe.com](https://stripe.com) to test payments
- **Telnyx**: Get API key from [telnyx.com](https://telnyx.com) to actually send faxes

### For Production:
- See `DEPLOYMENT_GUIDE.md` for deploying to Vercel/Netlify
- Run `./deploy.sh` for one-click deployment

---

## 🆘 Emergency Help

**App won't start?**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Supabase credentials wrong?**
1. Double-check you copied the FULL keys (they're very long)
2. Make sure you're using `anon` key, not `service_role`
3. Try creating a new Supabase project

**Still stuck?**
- Make sure `.env` is in the ROOT of your project (same folder as `package.json`)
- Check you have Node.js 18+ installed: `node --version`
- Ensure no typos in variable names (they're case-sensitive!)

**The nuclear option:**
```bash
# Start completely fresh
rm -rf node_modules package-lock.json .env
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```