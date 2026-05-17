import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// For MVP, trigger the worker here if we are in a dev/demo environment
// In production, this would be a separate process.
if (process.env.START_WORKER === 'true') {
  import('./worker').then(({ startContinuousDiscovery }) => {
    startContinuousDiscovery(parseInt(process.env.WORKER_INTERVAL || '3600000'));
  });
}
