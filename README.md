# Kennedy King College Cyber Career Stations

Interactive cybersecurity workshop for 11th grade students exploring careers in cybersecurity.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free - sign up at [vercel.com](https://vercel.com))
- Anthropic API key (for AI evaluation)

### Step 1: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. **Save it somewhere safe** - you'll need it in Step 3

### Step 2: Push to GitHub

```bash
# Clone or download this repository
cd kkc-cyber-lab

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - KKC Cyber Lab"

# Create a new repository on GitHub (github.com/new)
# Then link it:
git remote add origin https://github.com/YOUR-USERNAME/kkc-cyber-lab.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Select your `kkc-cyber-lab` repository
4. Click **Deploy** (leave all settings default)
5. Wait for deployment to complete

### Step 4: Add Environment Variable

**CRITICAL:** Add your Anthropic API key to Vercel:

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your API key from Step 1)
   - **Environments:** Production, Preview, Development (select all)
4. Click **Save**
5. Go to **Deployments** tab → Click the three dots on latest deployment → **Redeploy**

### Step 5: Configure Supabase

Your Supabase database is already configured! The credentials are in the code:
- URL: `https://lkltiaxdodtaaxndocum.supabase.co`
- Key: Already embedded

Just make sure the database tables exist (they should from earlier setup).

## 📱 Using the App

Once deployed, you'll get a URL like: `https://kkc-cyber-lab.vercel.app`

### Workshop Setup

**Station Computers (5 total):**
- Navigate to: `https://your-app.vercel.app`
- Students select their team name
- Complete stations

**Leaderboard Display (projector/6th screen):**
- Navigate to: `https://your-app.vercel.app#leaderboard`
- Shows live rankings
- Auto-refreshes every 5 seconds

**Admin Panel (facilitator):**
- Navigate to: `https://your-app.vercel.app#admin`
- Set number of teams (1-10)
- Reset all scores between sessions

## 🔧 Features

- **5 Interactive Stations:**
  - 🛡️ Security Analyst
  - 🧨 Penetration Tester
  - 🕵️ Digital Forensics
  - 📢 Security Awareness (AI-powered)
  - 🖥️ SOC Analyst

- **Scoring System:**
  - Base points per station (max 1,800)
  - +100 bonus for winning each station
  - Real-time leaderboard updates

- **Database:**
  - Supabase backend
  - Cross-device synchronization
  - Persistent scores

## 🛠️ Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Run locally
vercel dev

# Create .env.local file with:
ANTHROPIC_API_KEY=sk-ant-...

# Open http://localhost:3000
```

## 📊 Database Schema

Tables in Supabase:
- `team_scores` - Team performance data
- `station_leaders` - High scores per station
- `settings` - Configuration (number of teams)

## 🔐 Security Notes

- ✅ Anthropic API key stored securely in Vercel environment variables
- ✅ Supabase anon key is safe for client-side use (Row Level Security enabled)
- ✅ No sensitive data exposed in frontend code

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Check Supabase dashboard for database issues

## 📄 License

Created for Kennedy King College educational use.
