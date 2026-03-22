import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'E-posta ve şifre gerekli.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: 'Şifre hatalı.' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      token,
      user: { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Sunucu hatası.' }, { status: 500 });
  }
}
