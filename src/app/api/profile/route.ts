import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseResume } from '@/lib/services/aiService';

export async function GET() {
  try {
    const profile = await prisma.candidateProfile.findFirst();
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText, ...preferences } = body;

    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: { email: 'user@example.com', name: 'MVP User' },
    });

    let parsedResume = null;
    if (resumeText) {
        parsedResume = await parseResume(resumeText);
    }

    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {
        resumeText,
        parsedResume: parsedResume ? JSON.stringify(parsedResume) : undefined,
        ...preferences,
      },
      create: {
        userId: user.id,
        resumeText,
        parsedResume: parsedResume ? JSON.stringify(parsedResume) : undefined,
        ...preferences,
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
