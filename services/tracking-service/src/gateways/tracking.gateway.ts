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
    
    // Clean up if this was a streamer
    let disconnectedVehicleId: string | null = null;
    for (const [vId, sId] of this.activeStreamers.entries()) {
      if (sId === client.id) {
        disconnectedVehicleId = vId;
        break;
      }
    }

    if (disconnectedVehicleId) {
      this.activeStreamers.delete(disconnectedVehicleId);
      console.log(`🔴 Streamer disconnected: ${disconnectedVehicleId}`);
      this.broadcastStreamList();
    }
  }

  private broadcastStreamList() {
    this.server.emit(SocketEvents.WEBRTC_STREAM_LIST, {
      activeStreams: Array.from(this.activeStreamers.keys()),
    });
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
    console.log(`🛰️  [GPS] Vehicle: ${vehicleId} | Lat: ${position.latitude?.toFixed(4)} Lng: ${position.longitude?.toFixed(4)} | Speed: ${speed} km/h`);

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

  // ==========================================
  // LiveKit Stream Management (Socket-side)
  // ==========================================

  @SubscribeMessage(SocketEvents.WEBRTC_START_STREAM)
  handleStartStream(
    @MessageBody() data: { vehicleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`🟢 [LIVE] Vehicle ${data.vehicleId} started streaming on LiveKit`);
    this.activeStreamers.set(data.vehicleId, client.id);
    this.broadcastStreamList();
  }

  @SubscribeMessage(SocketEvents.WEBRTC_STOP_STREAM)
  handleStopStream(
    @MessageBody() data: { vehicleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`🔴 [STOP] Vehicle ${data.vehicleId} stopped streaming`);
    this.activeStreamers.delete(data.vehicleId);
    this.broadcastStreamList();
  }

  @SubscribeMessage(SocketEvents.WEBRTC_STREAM_LIST)
  handleGetStreamList(@ConnectedSocket() client: Socket) {
    client.emit(SocketEvents.WEBRTC_STREAM_LIST, {
      activeStreams: Array.from(this.activeStreamers.keys()),
    });
  }

  // ==========================================
  // WebRTC Signaling Relay
  // ==========================================

  @SubscribeMessage(SocketEvents.WEBRTC_REQUEST_STREAM)
  handleRequestStream(
    @MessageBody() data: { vehicleId: string; viewerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Viewer -> Streamer
    const streamerSocketId = this.activeStreamers.get(data.vehicleId);
    if (streamerSocketId) {
      console.log(`[WebRTC] Relay request-stream from viewer ${data.viewerId} to vehicle ${data.vehicleId}`);
      this.server.to(streamerSocketId).emit(SocketEvents.WEBRTC_REQUEST_STREAM, data);
    } else {
      console.log(`[WebRTC] Failed to request-stream: vehicle ${data.vehicleId} is not streaming.`);
    }
  }

  @SubscribeMessage(SocketEvents.WEBRTC_OFFER)
  handleWebRTCOffer(
    @MessageBody() data: WebRTCOffer,
    @ConnectedSocket() client: Socket,
  ) {
    // Streamer -> Viewer
    console.log(`[WebRTC] Relay offer from vehicle ${data.vehicleId} to viewer ${data.viewerId}`);
    this.server.to(data.viewerId).emit(SocketEvents.WEBRTC_OFFER, data);
  }

  @SubscribeMessage(SocketEvents.WEBRTC_ANSWER)
  handleWebRTCAnswer(
    @MessageBody() data: WebRTCAnswer,
    @ConnectedSocket() client: Socket,
  ) {
    // Viewer -> Streamer
    const streamerSocketId = this.activeStreamers.get(data.vehicleId);
    if (streamerSocketId) {
      console.log(`[WebRTC] Relay answer from viewer ${data.viewerId} to vehicle ${data.vehicleId}`);
      this.server.to(streamerSocketId).emit(SocketEvents.WEBRTC_ANSWER, data);
    }
  }

  @SubscribeMessage(SocketEvents.WEBRTC_ICE_CANDIDATE)
  handleIceCandidate(
    @MessageBody() data: WebRTCIceCandidate,
    @ConnectedSocket() client: Socket,
  ) {
    // Bidirectional Relay
    const streamerSocketId = this.activeStreamers.get(data.vehicleId);
    const isFromViewer = client.id !== streamerSocketId;

    if (isFromViewer) {
      // Viewer -> Streamer
      if (streamerSocketId) {
        this.server.to(streamerSocketId).emit(SocketEvents.WEBRTC_ICE_CANDIDATE, data);
      }
    } else {
      // Streamer -> Viewer
      this.server.to(data.viewerId).emit(SocketEvents.WEBRTC_ICE_CANDIDATE, data);
    }
  }
}
