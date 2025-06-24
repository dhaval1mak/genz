# RSS System Deployment Summary

## Overview

This document summarizes the automated deployment system for the GenZ/Alpha AI News Aggregator RSS processing system.

## Components

The deployment system consists of the following components:

1. **Git-based Deployment Scripts**:
   - `deploy_git_rss.sh` (Linux/Mac)
   - `Deploy-GitRSS.ps1` (Windows)

2. **RSS System Deployment**:
   - `deploy_rss_system.sh` - Installs and configures the RSS processor

3. **Article Stats Deployment**:
   - `deploy_article_stats.sh` - Deploys the article counter and statistics feature

4. **NPM Scripts**:
   - `deploy-git` - Linux/Mac Git-based deployment
   - `deploy-win` - Windows Git-based deployment
   - `deploy-rss` - Direct RSS system deployment
   - `deploy-stats` - Direct article stats deployment

## Deployment Process

The automated deployment process:

1. **Version Control Integration**:
   - Pulls the latest code from your Git repository
   - Checks out the specified branch (defaults to `main`)
   - Preserves any local changes via Git stash

2. **RSS System Setup**:
   - Installs all dependencies
   - Creates a cron job for periodic RSS updates
   - Configures PM2 for continuous operation (optional)

3. **Article Stats Deployment**:
   - Applies database migrations for the stats table
   - Deploys the Edge Function for serving live article counts
   - Updates the initial article count

4. **Verification**:
   - Tests the RSS processor
   - Verifies the article counter is working

## Usage

### Standard Deployment

For most users, the simplest approach is:

#### On Linux/Mac:
```bash
npm run deploy-git
```

#### On Windows:
```bash
npm run deploy-win
```

### Advanced Options

For specific deployment needs:

```bash
# Deploy a specific branch
./deploy_git_rss.sh develop

# Only deploy RSS system
npm run deploy-rss

# Only deploy article counter
npm run deploy-stats

# Check RSS system status
./deploy_rss_system.sh status

# Start RSS scheduler manually
./deploy_rss_system.sh start
```

## Configuration

The deployment system is configured through environment variables and package.json scripts. 
No additional configuration is typically needed for standard deployments.

## Maintenance

Regular maintenance:

1. **Updates**:
   ```bash
   ./deploy_rss_system.sh update
   ```

2. **Monitoring**:
   ```bash
   ./deploy_rss_system.sh status
   ```

3. **Logs**:
   - RSS processing logs: `rss_log.txt`
   - PM2 logs (if using PM2): `pm2 logs rss-processor`

## Troubleshooting

Common issues:

1. **Missing Dependencies**: Ensure Node.js, npm, and git are installed
2. **Permission Issues**: Make sure scripts are executable (`chmod +x *.sh`)
3. **Database Errors**: Check Supabase connection settings
4. **Scheduling Issues**: Verify cron is working or PM2 is running
