/**
 * @jest-environment jsdom
 */

jest.mock('../../sockets/socketClient', () => ({
  connectSocket: jest.fn(),
  getSocket: jest.fn(),
}));

const {
  attachOrderHandlers,
  joinOrderRoom,
  joinStaffRoom,
} = require('../../sockets/orderSocketHandlers');

describe('orderSocketHandlers', () => {
  it('attaches and detaches order event listeners', () => {
    const handlers = {};
    const socket = {
      on: jest.fn((event, fn) => {
        handlers[event] = fn;
      }),
      off: jest.fn(),
    };
    const onUpdated = jest.fn();
    const detach = attachOrderHandlers(socket, { onUpdated });

    expect(socket.on).toHaveBeenCalledWith(
      'order:updated',
      expect.any(Function)
    );
    handlers['order:updated']({ order: { id: 'o1', status: 'READY' } });
    expect(onUpdated).toHaveBeenCalledWith({ id: 'o1', status: 'READY' });

    detach();
    expect(socket.off).toHaveBeenCalled();
  });

  it('joins order and staff rooms via emit ack', async () => {
    const socket = {
      emit: jest.fn((event, ...args) => {
        const ack = args[args.length - 1];
        if (typeof ack === 'function') {
          ack({ ok: true });
        }
      }),
    };

    await expect(joinOrderRoom(socket, 'o1')).resolves.toEqual({ ok: true });
    expect(socket.emit).toHaveBeenCalledWith(
      'join:order',
      'o1',
      expect.any(Function)
    );

    await expect(joinStaffRoom(socket)).resolves.toEqual({ ok: true });
    expect(socket.emit).toHaveBeenCalledWith(
      'join:staff',
      expect.any(Function)
    );
  });
});
