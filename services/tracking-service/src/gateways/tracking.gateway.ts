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
import { SocketEvents, LocationUpdate } from '@saferide/shared-types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SocketEvents.LOCATION_UPDATE)
  handleLocationUpdate(
    @MessageBody() data: LocationUpdate,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Location update from vehicle ${data.vehicleId}:`, data.position);
    
    // Broadcast to subscribers of this vehicle/trip
    this.server.to(`vehicle:${data.vehicleId}`).emit(SocketEvents.LOCATION_DATA, data);
    if (data.tripId) {
      this.server.to(`trip:${data.tripId}`).emit(SocketEvents.LOCATION_DATA, data);
    }
  }

  @SubscribeMessage(SocketEvents.LOCATION_SUBSCRIBE)
  handleSubscribe(
    @MessageBody() data: { vehicleId?: string; tripId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.vehicleId) {
      client.join(`vehicle:${data.vehicleId}`);
      console.log(`Client ${client.id} subscribed to vehicle:${data.vehicleId}`);
    }
    if (data.tripId) {
      client.join(`trip:${data.tripId}`);
      console.log(`Client ${client.id} subscribed to trip:${data.tripId}`);
    }
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
}
