import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prepareApplicationReview, submitApplication } from '@/lib/services/applyService';

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(applications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { jobId, applicationId, action } = await req.json();

    if (action === 'approve') {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'approved' }
      });
      const result = await submitApplication(applicationId);
      return NextResponse.json(result);
    }

    if (action === 'reject') {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'rejected' }
      });
      return NextResponse.json({ success: true, message: 'Application rejected' });
    }

    // Default: prepare for review
    const application = await prepareApplicationReview(jobId);
    return NextResponse.json({ success: true, message: 'Prepared for review', application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
