import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SocketEvents,
  LocationUpdate,
  WebRTCOffer,
  WebRTCAnswer,
  WebRTCIceCandidate,
} from '@saferide/shared-types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Active streamers: vehicleId -> socketId
  private activeStreamers = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // ==========================================
  // GPS Location Tracking
  // ==========================================

  @SubscribeMessage(SocketEvents.LOCATION_UPDATE)
  handleLocationUpdate(
    @MessageBody() data: LocationUpdate,
    @ConnectedSocket() client: Socket,
  ) {
    const { vehicleId, position, speed } = data;
    const lat = (position as any).lat ?? position.latitude;
    const lng = (position as any).lng ?? position.longitude;
    console.log(`🛰️  [GPS] Vehicle: ${vehicleId} | Lat: ${lat?.toFixed(4)} Lng: ${lng?.toFixed(4)} | Speed: ${speed} km/h`);

    // Broadcast to subscribers of this vehicle/trip + global fleet
    this.server.to(`vehicle:${vehicleId}`).emit(SocketEvents.LOCATION_DATA, data);
    this.server.to('fleet:global').emit(SocketEvents.LOCATION_DATA, data);
    if (data.tripId) {
      this.server.to(`trip:${data.tripId}`).emit(SocketEvents.LOCATION_DATA, data);
    }
  }

  @SubscribeMessage(SocketEvents.LOCATION_SUBSCRIBE)
  handleSubscribe(
    @MessageBody() data: { vehicleId?: string; tripId?: string; fleetId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.fleetId) client.join(`fleet:${data.fleetId}`);
    if (data.vehicleId) {
      client.join(`vehicle:${data.vehicleId}`);
    }
    if (data.tripId) {
      client.join(`trip:${data.tripId}`);
    }
    console.log(`[SUB] ${client.id} joined: ${data.fleetId ? 'fleet:' + data.fleetId : ''} ${data.vehicleId ? 'vehicle:' + data.vehicleId : ''}`);
  }

  @SubscribeMessage(SocketEvents.LOCATION_UNSUBSCRIBE)
  handleUnsubscribe(
    @MessageBody() data: { vehicleId?: string; tripId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.vehicleId) {
      client.leave(`vehicle:${data.vehicleId}`);
    }
    if (data.tripId) {
      client.leave(`trip:${data.tripId}`);
    }
  }

  @SubscribeMessage('ai:simulate-alert')
  handleAiSimulateAlert(@MessageBody() data: any) {
    console.log(`⚠️ AI Alert Simulated: ${data.vehicleId} - ${data.type}`);
    // Broadcast to all clients (dashboards)
    this.server.emit('ai:alert', data);
  }
}
