# Article Statistics Setup Guide

This guide explains how to set up the article statistics functionality, which shows the live count of articles on your site.

## The Issue

If you're seeing this error:

```
Error fetching site stats: relation "public.site_stats" does not exist
```

It means the `site_stats` table has not been created in your Supabase database.

## Option 1: Using Supabase CLI (Recommended)

### For Linux/Mac:

1. Make sure Supabase CLI is installed:
   ```bash
   npm install -g supabase
   ```

2. Set the database URL:
   ```bash
   export SUPABASE_DB_URL="your-database-url"
   ```

3. Run the deployment script:
   ```bash
   npm run deploy-stats
   ```

### For Windows:

1. Make sure Supabase CLI is installed:
   ```powershell
   npm install -g supabase
   ```

2. Set the database URL:
   ```powershell
   $env:SUPABASE_DB_URL = "your-database-url"
   ```

3. Run the Windows deployment script:
   ```powershell
   npm run deploy-stats-win
   ```

## Option 2: Using Supabase SQL Editor

1. Log in to your [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of the `site_stats_setup.sql` file in this project
5. Run the SQL in the editor

## Option 3: Try Direct Table Creation

We've included a script that attempts to create the table directly:

```bash
npm run create-stats-table
```

This requires appropriate permissions and may not work with all Supabase configurations.

## Verifying the Setup

After setting up, you can test if the article counter is working:

```bash
npm run test-counter
```

## Updating the Stats

To refresh the article count:

```bash
npm run update-stats
```

## Debugging

If you're still having issues:

1. Check if the table exists:
   ```
   npm run verify-stats
   ```

2. Verify your Supabase connection settings in your `.env` file
   
3. Check for any permission issues in the Supabase dashboard

4. Try running the SQL manually in the SQL Editor
