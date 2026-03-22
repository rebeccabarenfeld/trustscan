# TrustScan — Security Compliance Gap Analyzer

Scan any Trust Center URL against CAIQ, SOC 2, ISO 27001 and get your compliance gap analysis powered by Claude AI.

## Deploy on Vercel in 5 minutes

### Step 1 — Upload to GitHub
1. Go to github.com → New repository → "trustscan"
2. Upload this entire folder
3. Done ✅

### Step 2 — Deploy on Vercel
1. Go to vercel.com → Add New Project
2. Import your GitHub repo "trustscan"
3. Framework: Vite (auto-detected)
4. Click Deploy → Wait 2 minutes
5. You get a URL: trustscan.vercel.app ✅

### Step 3 — Add your Claude API key
In Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add: VITE_ANTHROPIC_API_KEY = your_key_here
3. Get your key at: console.anthropic.com
4. Redeploy → Done ✅

### Step 4 — Custom domain (optional)
1. Buy trustscan.io on Namecheap (~$10/year)
2. In Vercel: Settings → Domains → Add domain
3. Follow DNS instructions
4. Done ✅

## Local development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Tech stack
- React + Vite
- Claude API (Anthropic)
- CSS (no framework — pure CSS variables)
- Vercel for hosting

## Features
- Scan any Trust Center URL
- Support for CAIQ, SIG-Lite, VSA, ISO 27001, SOC 2
- AI-powered gap analysis
- Coverage score by domain
- Generate missing compliance documents with AI
- Mobile responsive
