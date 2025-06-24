import { scheduleJob } from 'node-schedule';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🕒 Starting RSS feed scheduler...');

// Function to run the RSS feed processor
function runRSSProcessor() {
  console.log(`\n📅 [${new Date().toLocaleString()}] Running scheduled RSS feed update...`);
  
  const rssProcess = spawn('node', [path.join(__dirname, 'processRSSFeeds.mjs')], {
    stdio: 'inherit'
  });
  
  rssProcess.on('close', (code) => {
    console.log(`\n✅ RSS feed process completed with code ${code} at ${new Date().toLocaleString()}`);
  });
  
  rssProcess.on('error', (err) => {
    console.error('❌ Error running RSS feed process:', err);
  });
}

// Schedule options
const scheduleOptions = {
  everyHour: '0 * * * *',            // At the start of every hour
  everyFourHours: '0 */4 * * *',     // Every 4 hours
  twiceDaily: '0 */12 * * *',        // Every 12 hours
  daily: '0 0 * * *',                // Once a day at midnight
  custom: '0 */6 * * *'              // Every 6 hours (default)
};

// Set your preferred schedule here
const selectedSchedule = scheduleOptions.everyFourHours;

// Schedule the job
const job = scheduleJob(selectedSchedule, runRSSProcessor);

console.log(`🔄 RSS feeds will update on schedule: ${selectedSchedule}`);
console.log('📊 Next 3 scheduled runs:');

// Show the next 3 scheduled run times
const now = new Date();
for (let i = 1; i <= 3; i++) {
  const nextRun = job.nextInvocation();
  console.log(`   ${i}. ${nextRun.toLocaleString()}`);
  // Temporarily advance time to get next schedule
  now.setHours(now.getHours() + 4);
  job.pendingInvocations();
}

// Run immediately on startup
console.log('🚀 Running initial RSS feed update...');
runRSSProcessor();

// Keep the scheduler running
console.log('\n⏳ Scheduler is running in the background. Press Ctrl+C to stop.');
