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

    // Remove from active streamers if this was a streamer
    for (const [vehicleId, socketId] of this.activeStreamers) {
      if (socketId === client.id) {
        this.activeStreamers.delete(vehicleId);
        this.server.emit(SocketEvents.WEBRTC_STOP_STREAM, { vehicleId });
        console.log(`📹 Stream stopped (disconnect): ${vehicleId}`);
        break;
      }
    }
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

  // ==========================================
  // WebRTC Signaling
  // ==========================================

  @SubscribeMessage(SocketEvents.WEBRTC_START_STREAM)
  handleStartStream(
    @MessageBody() data: { vehicleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.activeStreamers.set(data.vehicleId, client.id);
    console.log(`📹 Stream started: ${data.vehicleId} (socket: ${client.id})`);

    // Notify all connected clients about new stream
    this.server.emit(SocketEvents.WEBRTC_STREAM_LIST, {
      activeStreams: Array.from(this.activeStreamers.keys()),
    });
  }

  @SubscribeMessage(SocketEvents.WEBRTC_STOP_STREAM)
  handleStopStream(
    @MessageBody() data: { vehicleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.activeStreamers.delete(data.vehicleId);
    console.log(`📹 Stream stopped: ${data.vehicleId}`);

    this.server.emit(SocketEvents.WEBRTC_STREAM_LIST, {
      activeStreams: Array.from(this.activeStreamers.keys()),
    });
  }

  @SubscribeMessage(SocketEvents.WEBRTC_REQUEST_STREAM)
  handleRequestStream(
    @MessageBody() data: { vehicleId: string; viewerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const streamerSocketId = this.activeStreamers.get(data.vehicleId);
    if (!streamerSocketId) {
      client.emit('error', { message: `Vehicle ${data.vehicleId} is not streaming` });
      return;
    }

    console.log(`👁️  Viewer ${data.viewerId} requesting stream from ${data.vehicleId}`);

    // Tell the streamer (phone) that a viewer wants to watch
    this.server.to(streamerSocketId).emit(SocketEvents.WEBRTC_REQUEST_STREAM, {
      vehicleId: data.vehicleId,
      viewerId: data.viewerId,
    });
  }

  @SubscribeMessage(SocketEvents.WEBRTC_OFFER)
  handleOffer(
    @MessageBody() data: WebRTCOffer,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`📡 Offer from ${data.vehicleId} to viewer ${data.viewerId}`);

    // Forward offer to the viewer
    this.server.emit(`webrtc:offer:${data.viewerId}`, {
      vehicleId: data.vehicleId,
      viewerId: data.viewerId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage(SocketEvents.WEBRTC_ANSWER)
  handleAnswer(
    @MessageBody() data: WebRTCAnswer,
    @ConnectedSocket() client: Socket,
  ) {
    const streamerSocketId = this.activeStreamers.get(data.vehicleId);
    if (!streamerSocketId) return;

    console.log(`📡 Answer from viewer ${data.viewerId} to ${data.vehicleId}`);

    // Forward answer to the streamer (phone)
    this.server.to(streamerSocketId).emit(SocketEvents.WEBRTC_ANSWER, {
      vehicleId: data.vehicleId,
      viewerId: data.viewerId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage(SocketEvents.WEBRTC_ICE_CANDIDATE)
  handleIceCandidate(
    @MessageBody() data: WebRTCIceCandidate,
    @ConnectedSocket() client: Socket,
  ) {
    const streamerSocketId = this.activeStreamers.get(data.vehicleId);

    // Determine direction: from streamer → viewer, or viewer → streamer
    if (client.id === streamerSocketId) {
      // Streamer sending ICE to viewer
      this.server.emit(`webrtc:ice-candidate:${data.viewerId}`, {
        vehicleId: data.vehicleId,
        viewerId: data.viewerId,
        candidate: data.candidate,
      });
    } else {
      // Viewer sending ICE to streamer
      if (streamerSocketId) {
        this.server.to(streamerSocketId).emit(SocketEvents.WEBRTC_ICE_CANDIDATE, {
          vehicleId: data.vehicleId,
          viewerId: data.viewerId,
          candidate: data.candidate,
        });
      }
    }
  }

  @SubscribeMessage(SocketEvents.WEBRTC_STREAM_LIST)
  handleStreamList(@ConnectedSocket() client: Socket) {
    client.emit(SocketEvents.WEBRTC_STREAM_LIST, {
      activeStreams: Array.from(this.activeStreamers.keys()),
    });
  }

  @SubscribeMessage('ai:simulate-alert')
  handleAiSimulateAlert(@MessageBody() data: any) {
    console.log(`⚠️ AI Alert Simulated: ${data.vehicleId} - ${data.type}`);
    // Broadcast to all clients (dashboards)
    this.server.emit('ai:alert', data);
  }
}
