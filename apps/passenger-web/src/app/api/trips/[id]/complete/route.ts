import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getTokenFromHeader(req);
  const payload = token ? verifyToken(token) : null;

  if (id.startsWith('demo-')) {
    return NextResponse.json({ success: true });
  }

  if (!payload) {
    return NextResponse.json({ message: 'Yetkisiz.' }, { status: 401 });
  }

  try {
    const trip = await prisma.trip.update({
      where: { id, passengerId: payload.userId },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });

    // Sürücüyü tekrar ONLINE yap
    await prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'ONLINE', totalTrips: { increment: 1 } } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Complete trip error:', err);
    return NextResponse.json({ message: 'Hata.' }, { status: 500 });
  }
}
