import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrackingGateway } from './gateways/tracking.gateway';
import { LivekitController } from './livekit/livekit.controller';
import { LivekitService } from './livekit/livekit.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [TrackingGateway, LivekitService],
  controllers: [LivekitController],
})
export class AppModule {}
