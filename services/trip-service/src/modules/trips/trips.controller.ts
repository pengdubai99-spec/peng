import { Controller, Post, Body, Get, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni yolculuk talebi oluştur' })
  async create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Yolculuk detayı' })
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Yolculuğu başlat (Sürücü)' })
  async start(@Param('id') id: string) {
    return this.tripsService.startTrip(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Yolculuğu tamamla' })
  async complete(
    @Param('id') id: string,
    @Body() endLocation: { latitude: number; longitude: number },
  ) {
    return this.tripsService.completeTrip(id, endLocation);
  }

  @Get('history/me')
  @ApiOperation({ summary: 'Kullanıcının yolculuk geçmişi' })
  async getMyTrips(@Request() req: any) {
    // Assuming auth middleware sets req.user
    return this.tripsService.getUserTrips(req.user.sub);
  }
}
