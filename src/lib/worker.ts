import { discoverAndSaveJobs } from './services/jobDiscovery';

/**
 * A simple worker function to perform continuous job discovery.
 * In a real-world scenario, this would be a separate process or a cron job.
 */
export async function startContinuousDiscovery(intervalMs: number = 3600000) { // Default 1 hour
  console.log(`Starting continuous job discovery every ${intervalMs}ms...`);

  const run = async () => {
    try {
      console.log(`[Worker ${new Date().toISOString()}] Starting discovery cycle...`);
      await discoverAndSaveJobs();
      console.log(`[Worker ${new Date().toISOString()}] Discovery cycle completed.`);
    } catch (error) {
      console.error(`[Worker ${new Date().toISOString()}] Discovery cycle failed:`, error);
    }
  };

  // Run immediately on start
  run();

  // Schedule subsequent runs
  setInterval(run, intervalMs);
}
