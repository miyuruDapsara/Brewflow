const { Server } = require('socket.io');
const { env } = require('../config/env');
const socketAuth = require('./socketAuth');
const {
  orderRoomName,
  STAFF_ORDERS_ROOM,
  assertCanJoinOrder,
  assertCanJoinStaff,
} = require('./socketAuthorization');
const { setIO } = require('./orderEvents');

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true,
    },
  });

  setIO(io);
  io.use(socketAuth);

  io.on('connection', (socket) => {
    socket.on('join:order', async (orderId, ack) => {
      try {
        await assertCanJoinOrder(socket.user, orderId);
        await socket.join(orderRoomName(orderId));
        if (typeof ack === 'function') {
          ack({ ok: true });
        }
      } catch (err) {
        if (typeof ack === 'function') {
          ack({ ok: false, error: err.message || 'Forbidden' });
        }
      }
    });

    socket.on('leave:order', async (orderId, ack) => {
      await socket.leave(orderRoomName(orderId));
      if (typeof ack === 'function') {
        ack({ ok: true });
      }
    });

    socket.on('join:staff', async (ack) => {
      try {
        assertCanJoinStaff(socket.user);
        await socket.join(STAFF_ORDERS_ROOM);
        if (typeof ack === 'function') {
          ack({ ok: true });
        }
      } catch (err) {
        if (typeof ack === 'function') {
          ack({ ok: false, error: err.message || 'Forbidden' });
        }
      }
    });

    socket.on('leave:staff', async (ack) => {
      await socket.leave(STAFF_ORDERS_ROOM);
      if (typeof ack === 'function') {
        ack({ ok: true });
      }
    });
  });

  return io;
}

module.exports = {
  initSocketServer,
};
