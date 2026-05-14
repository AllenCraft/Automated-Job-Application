import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { applyToGreenhouse } from '@/lib/services/applyService';

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const profile = await prisma.candidateProfile.findFirst();

    if (!job || !profile) {
      return NextResponse.json({ error: 'Job or profile not found' }, { status: 404 });
    }

    const parsedResume = profile.parsedResume ? JSON.parse(profile.parsedResume) : {};
    const user = await prisma.user.findUnique({ where: { id: profile.userId } });

    const appProfile = {
        firstName: parsedResume.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'John',
        lastName: parsedResume.name?.split(' ').slice(1).join(' ') || user?.name?.split(' ').slice(1).join(' ') || 'Doe',
        email: user?.email || 'user@example.com',
        phone: profile.timezone || '0000000000', // Timezone was used as a placeholder in UI, better to add phone field
    };

    const result = await applyToGreenhouse(job.applyUrl, appProfile, true);

    await prisma.application.create({
      data: {
        userId: profile.userId,
        jobId: job.id,
        status: result.success ? 'APPLIED' : 'FAILED',
        logs: result.message,
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
