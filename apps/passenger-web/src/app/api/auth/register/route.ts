import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password } = await req.json();

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ message: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return NextResponse.json({ message: 'Bu e-posta veya telefon zaten kayıtlı.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, phone, passwordHash, role: 'PASSENGER' },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      token,
      user: { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ message: 'Sunucu hatası.' }, { status: 500 });
  }
}
