import { Server } from 'socket.io';

let io;

function roomName(rfqId) {
  return `rfq:${rfqId}`;
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('rfq:join', (rfqId) => {
      if (!rfqId) return;
      socket.join(roomName(rfqId));
    });

    socket.on('rfq:leave', (rfqId) => {
      if (!rfqId) return;
      socket.leave(roomName(rfqId));
    });
  });

  return io;
}

export function emitRfqUpdate(rfqId, event = 'updated') {
  if (!io || !rfqId) return;
  io.to(roomName(rfqId)).emit('rfq:updated', {
    rfqId,
    event,
    updatedAt: new Date().toISOString()
  });
}
