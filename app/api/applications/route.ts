import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applicationSchema } from '@/lib/validators';
import { auth } from '@/app/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const items = await prisma.application.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { appliedAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const parsed = applicationSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const created = await prisma.application.create({
    data: { ...parsed.data, userId: Number(session.user.id) },
  });
  return NextResponse.json(created, { status: 201 });
}