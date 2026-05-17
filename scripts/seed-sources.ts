import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const initialSources = [
    { name: 'RemoteOK', url: 'https://remoteok.com/api', type: 'API' },
    { name: 'WWR', url: 'https://weworkremotely.com/remote-jobs.rss', type: 'RSS' },
    { name: 'Remotive', url: 'https://remotive.com/api/remote-jobs', type: 'API' },
    { name: 'Jobspresso', url: 'https://jobspresso.co/feed/', type: 'RSS' },
  ];

  for (const source of initialSources) {
    await prisma.jobSource.upsert({
      where: { url: source.url },
      update: {},
      create: source,
    });
  }
  console.log('Initial job sources seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
