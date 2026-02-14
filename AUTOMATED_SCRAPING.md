# Automated Scraping Setup Guide

This guide explains how to set up automated deal scraping using GitHub Actions (free).

## Overview

The GitHub Actions workflow will automatically scrape deals every 6 hours by calling your scraping API endpoint. The workflow runs on GitHub's servers and requires no additional infrastructure costs.

## Schedule

- **Frequency:** Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **Manual trigger:** Available via GitHub UI (Actions tab)
- **Cost:** Free (GitHub Actions free tier includes 2,000 minutes/month)

## Setup Instructions

### 1. Generate a CRON_SECRET Token

Generate a secure random token for authentication:

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use an online generator:
# https://www.random.org/strings/
```

**Example output:** `kJ8x2nP9mQ4rT6vY3wZ7aB5cD1eF0gH8iL4jM2nO6pR9s`

### 2. Add Environment Variables

#### A. Add to Local Environment (.env.local)

Add the CRON_SECRET to your local `.env.local` file:

```env
CRON_SECRET=your-generated-token-here
```

This allows local testing of the authenticated endpoint.

#### B. Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** (paste your generated token)
   - **Environments:** Check Production, Preview, and Development
4. Click **Save**
5. Redeploy your application for changes to take effect

### 3. Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

   **Secret 1:**
   - **Name:** `CRON_SECRET`
   - **Value:** (paste the same token from step 1)

   **Secret 2:**
   - **Name:** `SCRAPE_ENDPOINT_URL`
   - **Value:** `https://your-app.vercel.app/api/admin/scraper/run`
     - Replace `your-app.vercel.app` with your actual Vercel deployment URL

5. Click **Add secret** for each

### 4. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. If prompted, enable workflows
4. You should see the "Scrape Deals" workflow listed

### 5. Test the Workflow

#### Manual Test (Recommended First):

1. Go to **Actions** tab in GitHub
2. Click **Scrape Deals** workflow
3. Click **Run workflow** dropdown
4. Click the green **Run workflow** button
5. Wait for the job to complete (~30-60 seconds)
6. Click on the job to view logs and verify success

#### Check Results:

After running the workflow, check your application:
- Visit your app's deals page
- Check the admin panel for scraper logs
- Verify new deals were added/updated

## How It Works

1. **GitHub Actions triggers** the workflow on schedule (every 6 hours)
2. **Workflow makes HTTP request** to your API endpoint:
   ```
   POST https://your-app.vercel.app/api/admin/scraper/run
   Authorization: Bearer YOUR_CRON_SECRET
   ```
3. **API validates** the CRON_SECRET token
4. **Scraper coordinator runs** all active scrapers (Walmart, Newegg)
5. **Results are saved** to your database
6. **Workflow logs** show success/failure status

## Customizing the Schedule

Edit [.github/workflows/scrape-deals.yml](.github/workflows/scrape-deals.yml) to change the schedule:

```yaml
on:
  schedule:
    # Every 6 hours (current)
    - cron: '0 */6 * * *'

    # Every 12 hours (00:00, 12:00 UTC)
    # - cron: '0 */12 * * *'

    # Every 3 hours
    # - cron: '0 */3 * * *'

    # Daily at 8am UTC
    # - cron: '0 8 * * *'

    # Twice daily (8am, 8pm UTC)
    # - cron: '0 8,20 * * *'
```

**Cron syntax:** `minute hour day month weekday`
- `0 */6 * * *` = "At minute 0 past every 6th hour"
- Use [crontab.guru](https://crontab.guru/) to generate custom schedules

## Monitoring

### View Workflow Runs:

1. Go to **Actions** tab in GitHub
2. Click **Scrape Deals** workflow
3. View history of all runs (success/failure status)
4. Click any run to see detailed logs

### View Scraper Logs in App:

1. Log in to your admin panel
2. Navigate to **Admin** → **Scraper Logs**
3. View detailed results of each scraping run

### Email Notifications:

GitHub will email you if a workflow fails. Configure notifications:
1. GitHub **Settings** (your profile)
2. **Notifications** → **Actions**
3. Choose notification preferences

## Troubleshooting

### Workflow Fails with 401 Unauthorized:

- Check that `CRON_SECRET` matches in GitHub Secrets and Vercel Environment Variables
- Verify the secret was added correctly (no extra spaces)
- Redeploy your Vercel app after adding environment variables

### Workflow Fails with 404 Not Found:

- Verify `SCRAPE_ENDPOINT_URL` in GitHub Secrets is correct
- Check your Vercel deployment URL (should end with `/api/admin/scraper/run`)
- Ensure your app is deployed and accessible

### Workflow Runs but No New Deals:

- Check scraper logs in admin panel for error details
- Verify scrapers are working (test manually via admin panel)
- Check if retailers' website structures have changed

### Workflow Doesn't Run on Schedule:

- GitHub Actions can have slight delays (±15 minutes)
- Check Actions tab for any disabled workflows
- Verify the workflow file is in `.github/workflows/` directory

## Security Notes

- ✅ **CRON_SECRET is required:** Endpoint won't accept requests without valid token
- ✅ **Token is secret:** Never commit `.env.local` to git
- ✅ **HTTPS only:** All requests use encrypted connections
- ⚠️ **Rotate token periodically:** Generate new token every 3-6 months for security

## Cost Summary

- **GitHub Actions:** Free (2,000 minutes/month included)
- **Vercel Hosting:** Free tier sufficient for automated scraping
- **Database (Neon):** Free tier sufficient for deal storage
- **Total:** $0/month for automated scraping ✅

## Alternative Schedules

Adjust based on your needs:

- **Deal sites update frequently:** Every 3-6 hours
- **Deal sites update daily:** Once per day (8am UTC)
- **Testing phase:** Every hour (then reduce after testing)
- **Low traffic:** Every 12-24 hours

The current 6-hour schedule is a good balance between freshness and not overloading the scrapers.

## Next Steps

After setup:
1. Monitor first few runs to ensure success
2. Check deal quality and freshness
3. Adjust schedule if needed
4. Consider adding email notifications for featured deals
5. Add more scrapers (Amazon, Target, etc.)

---

**Last Updated:** 2026-02-13
**Status:** Ready for production use
