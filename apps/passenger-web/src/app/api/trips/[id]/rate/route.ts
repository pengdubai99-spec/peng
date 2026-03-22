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
    const { score, comment } = await req.json();
    const trip = await prisma.trip.findUnique({ where: { id: id }, include: { driver: true } });
    if (!trip) return NextResponse.json({ message: 'Yolculuk bulunamadı.' }, { status: 404 });

    await prisma.rating.create({
      data: {
        tripId: id,
        ratedBy: payload.userId,
        ratedUser: trip.driver.userId,
        score,
        comment,
      },
    });

    // Sürücü ortalama puanını güncelle
    const avgResult = await prisma.rating.aggregate({
      where: { ratedUser: trip.driver.userId },
      _avg: { score: true },
    });
    if (avgResult._avg.score) {
      await prisma.driver.update({
        where: { id: trip.driverId },
        data: { rating: avgResult._avg.score },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Rate error:', err);
    return NextResponse.json({ message: 'Hata.' }, { status: 500 });
  }
}
