import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TripsModule } from './modules/trips/trips.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TripsModule,
  ],
})
export class AppModule {}
