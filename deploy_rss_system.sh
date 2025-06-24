#!/bin/bash

# Production deployment script for RSS feed processing system
# Usage: ./deploy_rss_system.sh [install|update|start|stop|status]

# Configuration
APP_DIR="$PWD"
PM2_NAME="rss-processor"
CRON_SCRIPT="$APP_DIR/cron_rss.sh"

# Check for PM2
check_pm2() {
  if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing..."
    npm install -g pm2
  fi
}

# Create cron script
create_cron_script() {
  echo "Creating cron script at $CRON_SCRIPT"
  cat > "$CRON_SCRIPT" << EOF
#!/bin/bash
cd "$APP_DIR" && node processRSSFeeds.mjs >> "$APP_DIR/rss_log.txt" 2>&1
EOF
  chmod +x "$CRON_SCRIPT"
}

# Install the RSS processor
install() {
  check_pm2
  
  echo "Installing dependencies..."
  npm install
  
  echo "Creating cron script..."
  create_cron_script
  
  echo "Setting up cron job for RSS feed processing..."
  (crontab -l 2>/dev/null || echo "") | grep -v "$CRON_SCRIPT" | { cat; echo "0 */4 * * * $CRON_SCRIPT"; } | crontab -
  
  echo "Installation complete. RSS processor will run every 4 hours."
  echo "You can also use PM2 for continuous scheduler with: ./deploy_rss_system.sh start"
}

# Update the RSS processor
update() {
  echo "Updating RSS processor..."
  
  # Pull latest changes if in a git repo
  if [ -d .git ]; then
    git pull
  fi
  
  # Update dependencies
  npm install
  
  # Restart if running with PM2
  if pm2 list | grep -q "$PM2_NAME"; then
    pm2 restart "$PM2_NAME"
    echo "PM2 service restarted"
  fi
  
  echo "Update complete"
}

# Start the RSS scheduler with PM2
start() {
  check_pm2
  
  if pm2 list | grep -q "$PM2_NAME"; then
    echo "RSS scheduler is already running"
    pm2 info "$PM2_NAME"
  else
    echo "Starting RSS scheduler with PM2..."
    pm2 start rssScheduler.mjs --name "$PM2_NAME"
    pm2 save
    
    # Setup PM2 to start on boot
    echo "Setting up PM2 to start on system boot..."
    pm2 startup
    
    echo "RSS scheduler started"
  fi
}

# Stop the RSS scheduler
stop() {
  if pm2 list | grep -q "$PM2_NAME"; then
    echo "Stopping RSS scheduler..."
    pm2 stop "$PM2_NAME"
    echo "RSS scheduler stopped"
  else
    echo "RSS scheduler is not running"
  fi
}

# Check status of the RSS scheduler
status() {
  if pm2 list | grep -q "$PM2_NAME"; then
    echo "RSS scheduler status:"
    pm2 info "$PM2_NAME"
  else
    echo "RSS scheduler is not running"
  fi
  
  echo -e "\nCron job status:"
  if crontab -l 2>/dev/null | grep -q "$CRON_SCRIPT"; then
    echo "Cron job is installed and will run RSS processor every 4 hours"
    crontab -l | grep "$CRON_SCRIPT"
  else
    echo "Cron job is not installed"
  fi
}

# Main execution
case "$1" in
  install)
    install
    ;;
  update)
    update
    ;;
  start)
    start
    ;;
  stop)
    stop
    ;;
  status)
    status
    ;;
  *)
    echo "Usage: $0 [install|update|start|stop|status]"
    exit 1
    ;;
esac

exit 0
