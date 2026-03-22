import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token ? verifyToken(token) : null;

  try {
    const { driverId, startAddress, endAddress, fare } = await req.json();

    // Demo mod: gerçek kullanıcı yoksa mock trip döndür
    if (!payload || driverId.startsWith('demo-')) {
      return NextResponse.json({
        trip: {
          id: `demo-trip-${Date.now()}`,
          status: 'REQUESTED',
          driverId,
          startAddress,
          endAddress,
          fare,
          demo: true,
        },
      });
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { vehicle: true },
    });

    if (!driver || !driver.vehicleId) {
      return NextResponse.json({ message: 'Sürücü bulunamadı.' }, { status: 404 });
    }

    const trip = await prisma.trip.create({
      data: {
        passengerId: payload.userId,
        driverId: driver.id,
        vehicleId: driver.vehicleId,
        startAddress,
        endAddress,
        fare,
        status: 'REQUESTED',
      },
    });

    // Sürücüyü ON_TRIP yap
    await prisma.driver.update({ where: { id: driverId }, data: { status: 'ON_TRIP' } });

    return NextResponse.json({ trip });
  } catch (err) {
    console.error('Create trip error:', err);
    return NextResponse.json({ message: 'Yolculuk oluşturulamadı.' }, { status: 500 });
  }
}
