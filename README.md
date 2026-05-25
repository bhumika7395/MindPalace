# MindPalace — AI Brainstorming Canvas

AI-powered brainstorming on a spatial canvas. Grounded in cognitive science.

## Deploy to Vercel

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push this folder to the repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/mindpalace.git
   git push -u origin main
   ```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite — keep the defaults
5. Before deploying, add your environment variable:
   - Click "Environment Variables"
   - Add `ANTHROPIC_API_KEY` with your API key from [console.anthropic.com](https://console.anthropic.com/)
6. Click "Deploy"

### Step 3: Done!
Your MindPalace instance will be live at `your-project.vercel.app`

## Local Development

```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

Note: The AI chat requires the Vercel serverless function (`/api/chat.js`) to proxy requests to the Anthropic API. For local development, you'll need to run `vercel dev` instead of `npm run dev` to have the serverless function available.

## Features
- Spatial canvas with drag-and-drop cards
- AI-powered brainstorming via Smart Cursor (right-click) and Chat Panel
- Functional toolbar: Select, Card, Text, Draw, Pan, Link
- Thinking frameworks: Priority Matrix, User Journey, Problem Tree, SCAMPER, Six Thinking Hats, 5 Whys
- Auto-generated project context
- Project save/load with localStorage
- Onboarding walkthrough

## Tech Stack
- React 18 + Vite
- Anthropic Claude API (via Vercel serverless proxy)
- localStorage for project persistence
