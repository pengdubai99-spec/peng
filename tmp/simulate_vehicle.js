const { io } = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3005';
const vehicleId = 'DXB-BYD-01';

const socket = io(SOCKET_URL);

socket.on('connect', () => {
  console.log('Connected to Tracking Service as vehicle:', vehicleId);
  
  // 1. Tell the server we started streaming so we show up in the list
  socket.emit('webrtc:start-stream', { vehicleId });
  
  // 2. Start sending fake GPS data
  let lat = 25.2048; // Dubai
  let lng = 55.2708;
  
  setInterval(() => {
    lat += (Math.random() - 0.5) * 0.001;
    lng += (Math.random() - 0.5) * 0.001;
    
    const update = {
      vehicleId,
      position: { lat, lng },
      speed: Math.floor(Math.random() * 80),
      heading: Math.floor(Math.random() * 360),
      recordedAt: new Date(),
    };
    
    console.log(`Sending GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    socket.emit('location:update', update);
  }, 1000);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
