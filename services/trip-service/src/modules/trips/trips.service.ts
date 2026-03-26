import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTripDto) {
    return this.prisma.trip.create({
      data: {
        passengerId: dto.passengerId,
        driverId: dto.driverId,
        vehicleId: dto.vehicleId,
        startLat: dto.startLocation.latitude,
        startLng: dto.startLocation.longitude,
        startAddress: dto.startAddress,
        endAddress: dto.endAddress,
        status: TripStatus.REQUESTED,
      },
    });
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        passenger: true,
        driver: {
          include: {
            user: true,
            vehicle: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Yolculuk bulunamadı');
    }

    return trip;
  }

  async startTrip(id: string) {
    return this.prisma.trip.update({
      where: { id },
      data: {
        status: TripStatus.ACTIVE,
        startedAt: new Date(),
      },
    });
  }

  async completeTrip(id: string, endLocation: { latitude: number; longitude: number }) {
    return this.prisma.trip.update({
      where: { id },
      data: {
        status: TripStatus.COMPLETED,
        endedAt: new Date(),
        endLat: endLocation.latitude,
        endLng: endLocation.longitude,
      },
    });
  }

  async getUserTrips(userId: string) {
    return this.prisma.trip.findMany({
      where: {
        OR: [{ passengerId: userId }, { driver: { userId } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
