import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isActive: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        driver: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async update(id: string, data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) {
    await this.findById(id); // Ensure exists

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async deactivate(id: string) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDriversByStatus(status?: string) {
    return this.prisma.driver.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        vehicle: true,
      },
    });
  }
}
