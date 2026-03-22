import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      where: { status: 'ONLINE', vehicle: { isNot: null } },
      include: {
        user: { select: { firstName: true, lastName: true } },
        vehicle: { select: { plateNumber: true, brand: true, model: true } },
      },
      take: 10,
    });

    const result = drivers.map((d: typeof drivers[number]) => ({
      id: d.id,
      name: `${d.user.firstName} ${d.user.lastName}`,
      avatar: `${d.user.firstName[0]}${d.user.lastName[0]}`,
      plate: d.vehicle?.plateNumber || '',
      model: d.vehicle ? `${d.vehicle.brand} ${d.vehicle.model}` : '',
      color: 'Beyaz',
      rating: d.rating,
      eta: `${Math.floor(Math.random() * 8) + 2} dk`,
    }));

    // DB boşsa demo sürücüler döndür
    if (result.length === 0) {
      return NextResponse.json({ drivers: DEMO_DRIVERS });
    }

    return NextResponse.json({ drivers: result });
  } catch (err) {
    console.error('Nearby drivers error:', err);
    return NextResponse.json({ drivers: DEMO_DRIVERS });
  }
}

const DEMO_DRIVERS = [
  { id: 'demo-1', name: 'Ahmed Mansoor', avatar: 'AM', plate: '34 PEK 001', model: 'Toyota Camry', color: 'Beyaz', rating: 4.9, eta: '3 dk' },
  { id: 'demo-2', name: 'Omar Hassan', avatar: 'OH', plate: '34 PNG 042', model: 'Tesla Model 3', color: 'Siyah', rating: 4.8, eta: '5 dk' },
  { id: 'demo-3', name: 'Khalid Al-Rashid', avatar: 'KR', plate: '34 PNG 118', model: 'BMW 5 Serisi', color: 'Gri', rating: 5.0, eta: '7 dk' },
];
