/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

jest.mock('../../sockets/socketClient', () => ({
  connectSocket: jest.fn(),
  getSocket: jest.fn(),
}));

jest.mock('../../sockets/orderSocketHandlers', () => ({
  attachOrderHandlers: jest.fn(() => jest.fn()),
  joinOrderRoom: jest.fn(async () => ({ ok: true })),
  leaveOrderRoom: jest.fn(async () => ({ ok: true })),
  joinStaffRoom: jest.fn(async () => ({ ok: true })),
  leaveStaffRoom: jest.fn(async () => ({ ok: true })),
}));

const { connectSocket } = require('../../sockets/socketClient');
const {
  attachOrderHandlers,
  joinOrderRoom,
  joinStaffRoom,
} = require('../../sockets/orderSocketHandlers');
const useOrderSocket = require('../../hooks/useOrderSocket').default;

function Probe(props) {
  useOrderSocket(props);
  return React.createElement('div', null, 'ok');
}

describe('useOrderSocket', () => {
  beforeEach(() => {
    connectSocket.mockReset();
    attachOrderHandlers.mockClear();
    joinOrderRoom.mockClear();
    joinStaffRoom.mockClear();
  });

  it('joins order room when orderId is provided', async () => {
    const socket = {
      connected: true,
      on: jest.fn(),
      off: jest.fn(),
    };
    connectSocket.mockReturnValue(socket);

    await act(async () => {
      TestRenderer.create(
        React.createElement(Probe, { orderId: 'o1' })
      );
    });

    expect(connectSocket).toHaveBeenCalled();
    expect(attachOrderHandlers).toHaveBeenCalled();
    expect(joinOrderRoom).toHaveBeenCalledWith(socket, 'o1');
  });

  it('joins staff room when joinStaff is true', async () => {
    const socket = {
      connected: true,
      on: jest.fn(),
      off: jest.fn(),
    };
    connectSocket.mockReturnValue(socket);

    await act(async () => {
      TestRenderer.create(
        React.createElement(Probe, { joinStaff: true })
      );
    });

    expect(joinStaffRoom).toHaveBeenCalledWith(socket);
  });
});
