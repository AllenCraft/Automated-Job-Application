import { discoverAndSaveJobs } from '../lib/services/jobDiscovery';
import prisma from '../lib/prisma';

async function main() {
  console.log('Starting job discovery test...');
  const jobs = await discoverAndSaveJobs();

  console.log(`Discovery complete. Sample jobs:`);
  jobs.slice(0, 5).forEach(job => {
    console.log(`- ${job.title} at ${job.company} (${job.source})`);
  });

  const count = await prisma.job.count();
  console.log(`Total jobs in database: ${count}`);

  if (count > 0) {
    console.log('Discovery test passed!');
  } else {
    console.error('No jobs found/saved.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
