import { NextResponse } from 'next/server';
import { discoverAndSaveJobs } from '@/lib/services/jobDiscovery';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await discoverAndSaveJobs();
    return NextResponse.json({ message: 'Jobs refreshed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
