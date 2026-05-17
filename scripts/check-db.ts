import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    select: {
      title: true,
      score: true,
      category: true,
    },
    take: 10,
  });

  console.log('Sample Jobs in DB:');
  console.table(jobs);

  const counts = await prisma.job.groupBy({
    by: ['category'],
    _count: {
      id: true,
    },
  });

  console.log('Job counts by category:');
  console.table(counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
