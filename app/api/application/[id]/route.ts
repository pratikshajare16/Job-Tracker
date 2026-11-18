import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { applicationUpdateSchema } from '@/lib/validators';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const { id } = await params;
  const parsed = applicationUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  // where includes userId: you can only change your OWN records
  const result = await prisma.application.updateMany({
    where: { id: Number(id), userId: Number(session.user.id) },
    data: parsed.data,
  });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const { id } = await params;
  const result = await prisma.application.deleteMany({
    where: { id: Number(id), userId: Number(session.user.id) },
  });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}