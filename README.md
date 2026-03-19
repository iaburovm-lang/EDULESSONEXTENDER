# EduPlan — Setup Guide

## What you get
- `/` — Teacher login page (enter access code)
- `/app` — The Lesson Extender tool (protected)
- `/admin` — Your admin panel (add/disable users)

API key is hidden on the server. Teachers never see it.

---

## Step 1 — Create a Supabase project

1. Go to https://supabase.com and sign up (free)
2. Click **New Project**, give it a name (e.g. "eduplan")
3. Go to **Database → SQL Editor → New Query**
4. Paste the contents of `supabase_schema.sql` and click **Run**
5. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** key (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Deploy to Vercel

1. Go to https://vercel.com and sign up (free)
2. Click **Add New → Project**
3. Upload this folder (drag & drop or connect GitHub)
4. Before clicking Deploy, go to **Environment Variables** and add:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic key (sk-ant-...) |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Settings → API |
| `ADMIN_PASSWORD` | A password only you know |

5. Click **Deploy** — done!

---

## Step 3 — Add your first users

1. Go to `https://your-site.vercel.app/admin`
2. Enter your `ADMIN_PASSWORD`
3. Type a login code (e.g. `anna2024`) and click **Add user**
4. Send that code to the teacher
5. They go to your site, enter the code, and they're in

---

## Managing access

| Action | What to do |
|--------|-----------|
| Give access | Add user in /admin, send them the code |
| Disable someone | Click **Disable** next to their name |
| Re-enable | Click **Enable** |
| Delete permanently | Click ✕ |

Changes take effect immediately — no redeploy needed.

---

## Your URLs
- Teacher login: `https://your-site.vercel.app/`
- App: `https://your-site.vercel.app/app`
- Admin panel: `https://your-site.vercel.app/admin`
