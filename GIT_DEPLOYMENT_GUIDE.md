# Git-Based RSS System Deployment

This document explains how to deploy the RSS system using Git for version control and automated deployment.

## Overview

The git-based deployment process:

1. Pulls the latest code from your Git repository
2. Installs/updates the RSS processor
3. Deploys the article counter and statistics
4. Sets up automatic scheduling

## Prerequisites

- Git installed on the server
- Node.js and npm installed
- Supabase CLI (for article stats feature)
- A Git repository with your project code

## Deployment Instructions

### Automated Deployment

#### On Linux/Mac:

```bash
# Deploy using the default branch (main)
npm run deploy-git

# Or specify a different branch
./deploy_git_rss.sh develop
```

#### On Windows:

```powershell
# Deploy using the default branch (main)
npm run deploy-win

# Or specify a different branch
.\Deploy-GitRSS.ps1 develop
```

### What This Does

The deployment script will:

1. Fetch the latest changes from your remote repository
2. Switch to the specified branch (defaults to `main`)
3. Run the RSS system installation script
4. Deploy the article stats feature
5. Set up automatic scheduling

### Manual Deployment Steps

If you prefer to deploy manually:

1. Clone or pull your repository:
   ```bash
   git clone <repository-url>
   # or if already cloned
   git pull origin main
   ```

2. Install the RSS system:
   ```bash
   npm run deploy-rss
   # or directly
   ./deploy_rss_system.sh install
   ```

3. Deploy the article stats:
   ```bash
   npm run deploy-stats
   # or directly
   ./deploy_article_stats.sh
   ```

## Monitoring and Management

After deployment, you can:

- Verify your deployment:
  ```bash
  # On Linux/Mac
  npm run verify
  
  # On Windows
  npm run verify-win
  ```

- Check RSS system status:
  ```bash
  ./deploy_rss_system.sh status
  ```

- Start the RSS scheduler manually:
  ```bash
  ./deploy_rss_system.sh start
  ```

- Stop the RSS scheduler:
  ```bash
  ./deploy_rss_system.sh stop
  ```

- Update the system:
  ```bash
  ./deploy_rss_system.sh update
  ```

## Continuous Integration

For a CI/CD pipeline, configure your CI system to run:

```bash
npm run deploy-git
```

This will ensure your RSS system is always up-to-date with your codebase.

## Pushing Code to Git

After making changes to your codebase, follow these steps to push your code to Git:

### On Linux/Mac:

```bash
# Add all changes to staging
git add .

# Commit your changes with a descriptive message
git commit -m "Update RSS system with article counter feature"

# Push to your repository (replace 'main' with your branch if different)
git push origin main
```

### On Windows:

```powershell
# Add all changes to staging
git add .

# Commit your changes with a descriptive message
git commit -m "Update RSS system with article counter feature"

# Push to your repository (replace 'main' with your branch if different)
git push origin main
```

If this is your first time pushing to the repository, you may need to configure Git:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Troubleshooting

If you encounter issues during deployment:

1. Check the logs in `rss_log.txt`
2. Verify your Git repository configuration
3. Ensure all environment variables are properly set
4. Check that Supabase CLI is correctly installed (for article stats)

## Further Configuration

You can customize the deployment by editing:

- `deploy_git_rss.sh` - Git-based deployment configuration
- `deploy_rss_system.sh` - RSS processor deployment
- `deploy_article_stats.sh` - Article stats deployment
