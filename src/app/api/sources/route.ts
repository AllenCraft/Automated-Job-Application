import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { discoverNewJobSources } from '@/lib/services/sourceDiscovery';

export async function GET() {
  try {
    const sources = await prisma.jobSource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sources);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'discover') {
      const newSources = await discoverNewJobSources();
      return NextResponse.json({ message: 'AI discovery complete', count: newSources?.length });
    }

    if (body.action === 'toggle' && body.id) {
      const source = await prisma.jobSource.findUnique({ where: { id: body.id } });
      if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

      const updated = await prisma.jobSource.update({
        where: { id: body.id },
        data: { isActive: !source.isActive },
      });
      return NextResponse.json(updated);
    }

    if (body.action === 'add') {
      const newSource = await prisma.jobSource.create({
        data: {
          name: body.name,
          url: body.url,
          type: body.type || 'RSS',
          isActive: true,
        }
      });
      return NextResponse.json(newSource);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
