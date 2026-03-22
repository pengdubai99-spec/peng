import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req);
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return NextResponse.json({ trips: [] });
  }

  try {
    const trips = await prisma.trip.findMany({
      where: { passengerId: payload.userId },
      include: {
        driver: { include: { user: { select: { firstName: true, lastName: true } } } },
        vehicle: { select: { brand: true, model: true, plateNumber: true } },
        ratings: { where: { ratedBy: payload.userId } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      trips: trips.map((t: typeof trips[number]) => ({
        id: t.id,
        status: t.status,
        startAddress: t.startAddress,
        endAddress: t.endAddress,
        fare: t.fare ? Number(t.fare) : null,
        startedAt: t.startedAt,
        endedAt: t.endedAt,
        driverName: `${t.driver.user.firstName} ${t.driver.user.lastName}`,
        vehicle: `${t.vehicle.brand} ${t.vehicle.model}`,
        plate: t.vehicle.plateNumber,
        myRating: t.ratings[0]?.score || null,
      })),
    });
  } catch (err) {
    console.error('History error:', err);
    return NextResponse.json({ trips: [] });
  }
}
