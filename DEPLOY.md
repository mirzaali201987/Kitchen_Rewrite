# Deployment Walkthrough

Follow this exactly once before the hackathon so the steps are muscle memory. It takes about 15 minutes the first time and 3 minutes every time after.

## Prerequisites check

Before you start, make sure you have:

- [ ] A GitHub account. Sign up at github.com if you don't.
- [ ] Git installed on your machine. Run `git --version` in terminal. If it errors, install from git-scm.com.
- [ ] Node.js 18 or higher. Run `node --version`. If it errors or shows 16.x, install the LTS from nodejs.org.
- [ ] An Anthropic API key. Get one at console.anthropic.com. Add a small amount of credit ($5 is plenty for the hackathon).
- [ ] A Vercel account. Sign up at vercel.com using "Continue with GitHub" so they are already linked.

If any of these are missing, fix them now, not on hackathon day.

## Part 1: Test the project locally

Open a terminal in the unzipped `recipe-adapter` folder.

```bash
npm install
```

Wait for it to finish. Should take 30 to 60 seconds.

```bash
cp .env.example .env.local
```

Open `.env.local` in any text editor. Paste your Anthropic API key after the `=` sign. Save and close.

```bash
npm run dev
```

You should see:
```
✓ Ready in 1.5s
- Local: http://localhost:3000
```

Open `http://localhost:3000` in your browser. You should see the Recipe Adapter page with the sample chocolate chip cookie recipe already filled in.

**Test it right now.** Click "Vegan" and "Nut-free" in the constraint chips, then click "Adapt recipe". Wait about 5 seconds. You should see:
- A warnings box (because nut-free is an allergy constraint)
- The adapted recipe with plant-based substitutions
- A "What changed and why" section with swap IDs like `sub-001`, `sub-011`

If that works, you are ready to deploy. If not, see the Troubleshooting section at the bottom.

Stop the dev server with `Ctrl+C`.

## Part 2: Push to GitHub

### 2a. Create a new repository

1. Go to github.com, click the "+" in the top right, select "New repository".
2. Name it `recipe-adapter` (or whatever you want).
3. Leave it **Public** (Vercel's free tier works best with public repos).
4. **Do NOT** check "Add a README", "Add .gitignore", or "Choose a license". The project already has its own files, adding them here causes a merge conflict on your first push.
5. Click "Create repository".

You will see a page with a URL like `https://github.com/yourusername/recipe-adapter.git`. Keep this tab open.

### 2b. Push the project

In your terminal, still in the `recipe-adapter` folder:

```bash
git init
git add .
git commit -m "Initial commit: recipe adapter scaffold"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/recipe-adapter.git
git push -u origin main
```

Replace `YOURUSERNAME` with your actual GitHub username.

If this is your first push from this machine, GitHub will ask you to authenticate. The easiest way: install GitHub CLI (`gh`) and run `gh auth login`, or use a Personal Access Token as your password (Settings > Developer settings > Personal access tokens on GitHub).

Refresh the GitHub page. You should see all the files (app, lib, data, etc.). If yes, move on.

## Part 3: Deploy to Vercel

### 3a. Import the project

1. Go to vercel.com/new.
2. If this is your first time, Vercel will ask to install its GitHub app. Grant access, either to all repos or just this one.
3. Find `recipe-adapter` in the list and click "Import".
4. You will land on a "Configure Project" page. Most settings are auto-detected for Next.js, leave them alone.

### 3b. Set the environment variable (THIS IS WHERE TEAMS FAIL)

On the same Configure Project page, expand the "Environment Variables" section. Add:

- **Name:** `ANTHROPIC_API_KEY`
- **Value:** your actual API key (same one from `.env.local`)

Check that it applies to Production, Preview, AND Development (all three should be selected by default, confirm).

Click "Deploy".

### 3c. Wait and verify

The build takes about 1 to 2 minutes. When it finishes, Vercel shows a confetti animation and a preview of your site. Click "Continue to Dashboard" or the preview URL.

Your production URL will look like `https://recipe-adapter-abc123.vercel.app`.

**Open it in a new tab and test the same thing you tested locally** (click constraint chips, click Adapt). If you get an answer, you are deployed. If you get an error, see Troubleshooting.

## Part 4: Rehearse the update cycle

This is the part teams never practice and then panic about during the hackathon. Do it once now.

Make a trivial change, like editing the page title in `app/page.tsx`:

```tsx
<h1 style={{ fontSize: 32, margin: 0, letterSpacing: "-0.02em" }}>
  Recipe Adapter v2
</h1>
```

Save. Then:

```bash
git add .
git commit -m "Update title"
git push
```

Within 30 seconds, Vercel auto-detects the push and redeploys. Refresh your production URL. You should see "Recipe Adapter v2".

This is your iteration loop during the hackathon: edit, commit, push, Vercel redeploys automatically. You never need to touch the Vercel dashboard again after the initial setup.

## Troubleshooting

### Local dev server won't start

- Check Node version: `node --version`. Must be 18 or higher.
- Delete `node_modules` and run `npm install` again.

### "Select at least one dietary constraint" no matter what I click

- Open browser DevTools (F12), check the Network tab, click a constraint chip, click Adapt. Look for a request to `/api/adapt`. Check the "Payload" tab for what was sent.

### Local works, production doesn't

This is almost always the env var. In Vercel:
1. Go to your project > Settings > Environment Variables.
2. Confirm `ANTHROPIC_API_KEY` exists and has a value.
3. Confirm it is enabled for "Production".
4. Go to Deployments tab, click the latest deployment, click "..." menu, select "Redeploy". This is required after changing env vars.

### "Model did not return valid JSON"

This happens occasionally with any LLM. Click Adapt again. If it persists more than 3 times in a row, the system prompt may need tightening. Check the Vercel logs for the raw model output:
1. Vercel dashboard > your project > Logs tab.
2. Look for the `json_parse_failed` event and see what the model actually returned.

### Build fails on Vercel with a TypeScript error

- Run `npx tsc --noEmit` locally. If it passes, the build on Vercel should also pass.
- If it fails locally, fix the error, commit, push.

### The API is very slow (10+ seconds per request)

- Normal first call after a deployment is slow (cold start). Subsequent calls should be 3 to 5 seconds.
- If consistently slow, your recipe may be too long. The system prompt is tuned for recipes under 2000 characters.

## What to submit if Vercel deployment breaks on hackathon day

Back up plan, in order of preference:

1. **Local demo via screen share.** Run `npm run dev`, show it working on your laptop. Record a 60-second screen recording as backup.
2. **GitHub link + README.** If the grader can clone it and run it themselves, that is still a submission.
3. **Annotated screenshots.** If literally nothing runs, take screenshots of the working state and submit those with the repo link. Weak, but not zero.

Never submit nothing. A broken deployment with a working local demo is graded much higher than no submission.
