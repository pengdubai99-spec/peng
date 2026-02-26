import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../guards/roles.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'FLEET_MANAGER')
  @ApiOperation({ summary: 'Tüm kullanıcıları listele (Admin/Filo Yöneticisi)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kullanıcı detayı' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle' })
  async update(
    @Param('id') id: string,
    @Body() data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string },
  ) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Kullanıcıyı devre dışı bırak (Admin)' })
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Get('drivers/list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'FLEET_MANAGER')
  @ApiOperation({ summary: 'Sürücüleri listele' })
  @ApiQuery({ name: 'status', required: false })
  async getDrivers(@Query('status') status?: string) {
    return this.usersService.getDriversByStatus(status);
  }
}
