# ⚡ Light Bill Tracker — Deployment Guide

## What You're Deploying
A React PWA (Progressive Web App) that:
- Signs in with your personal Google account (zanteriawells@gmail.com)
- Reads your Gmail for Mississippi Power bill emails
- Tracks due dates, amounts, payment history
- Installs on your phone like a real app

---

## STEP 1 — Google Cloud Console Setup

### A. Create a Project
1. Go to https://console.cloud.google.com
2. Click the project dropdown at the top → **New Project**
3. Name it: `light-bill-tracker` → **Create**

### B. Enable Gmail API
1. Go to **APIs & Services → Library**
2. Search for **Gmail API** → Click it → **Enable**

### C. Configure OAuth Consent Screen
1. Go to **APIs & Services → OAuth Consent Screen**
2. Choose **External** → **Create**
3. Fill in:
   - App name: `Light Bill Tracker`
   - User support email: `zanteriawells@gmail.com`
   - Developer email: `zanteriawells@gmail.com`
4. Click **Save and Continue** through all steps
5. On the **Test Users** step → Add `zanteriawells@gmail.com`
6. **Save and Continue**

### D. Create OAuth Client ID
1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth Client ID**
3. Application type: **Web application**
4. Name: `Light Bill Tracker`
5. Under **Authorized JavaScript Origins** — leave blank for now (add after Vercel deploy)
6. Click **Create**
7. **Copy your Client ID** — you'll need it in Step 3

---

## STEP 2 — GitHub Setup

1. Go to https://github.com → **New Repository**
2. Name it: `light-bill-tracker`
3. Make it **Private** (your bills are personal!)
4. **Do NOT** initialize with README
5. Click **Create Repository**

Upload all the files from this project to the repo (drag and drop in GitHub UI, or use GitHub Desktop).

---

## STEP 3 — Vercel Deployment

1. Go to https://vercel.com → **Add New Project**
2. Import your `light-bill-tracker` GitHub repo
3. Framework: **Vite** (auto-detected)
4. Under **Environment Variables**, add:
   ```
   VITE_GOOGLE_CLIENT_ID = [paste your Client ID from Step 1D]
   ```
5. Click **Deploy**
6. **Copy your Vercel URL** (e.g., `https://light-bill-tracker.vercel.app`)

---

## STEP 4 — Finish Google Cloud Setup

Now that you have your Vercel URL:

1. Go back to **Google Cloud → APIs & Services → Credentials**
2. Click on your OAuth Client ID to edit it
3. Under **Authorized JavaScript Origins**, add:
   - `https://your-app.vercel.app` (your real Vercel URL)
   - `http://localhost:5173` (for local dev)
4. Click **Save**

---

## STEP 5 — Install as PWA on Your Phone

### iPhone:
1. Open your Vercel URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Scroll down → **Add to Home Screen**
4. Name it `Light Bill` → **Add**

### Android:
1. Open your Vercel URL in **Chrome**
2. Tap the 3-dot menu → **Add to Home Screen**
3. Tap **Add**

You now have a real app icon on your phone! 📱

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Then edit .env and add your VITE_GOOGLE_CLIENT_ID

# Run locally
npm run dev
```

---

## Troubleshooting

**"Sign in failed"** → Double-check your Client ID in .env / Vercel env vars

**"Access blocked"** → Go to Google Cloud OAuth Consent Screen → add your Gmail as a test user

**Empty results after sync** → Check Gmail spam folder for Mississippi Power emails. Try adding `no-reply@mississippipower.com` to contacts.

**Redirect URI mismatch** → Make sure your Vercel URL is added to Authorized JavaScript Origins in Google Cloud

---

## File Structure

```
light-bill-tracker/
├── src/
│   ├── components/
│   │   ├── LoginScreen.jsx     ← Google sign-in page
│   │   ├── Dashboard.jsx       ← Stats + chart
│   │   ├── BillCard.jsx        ← Individual bill display
│   │   ├── ReminderModal.jsx   ← Set reminder bottom sheet
│   │   └── AddManual.jsx       ← Manual bill entry
│   ├── hooks/
│   │   ├── useGoogleAuth.js    ← Google OAuth logic
│   │   └── useBills.js         ← Bill state + localStorage
│   ├── services/
│   │   └── gmail.js            ← Gmail API calls
│   ├── App.jsx                 ← Main app shell + navigation
│   ├── main.jsx                ← React entry point
│   ├── index.css               ← Global styles
│   └── utils.js                ← Date/currency helpers
├── index.html
├── vite.config.js              ← Vite + PWA config
├── package.json
├── .env.example                ← Copy to .env and fill in
└── .gitignore
```
