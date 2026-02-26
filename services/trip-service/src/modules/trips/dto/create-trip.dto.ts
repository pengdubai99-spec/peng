import { IsNumber, IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class GeoPointDto {
  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;
}

export class CreateTripDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  passengerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => GeoPointDto)
  startLocation: GeoPointDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startAddress: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  endAddress?: string;
}
