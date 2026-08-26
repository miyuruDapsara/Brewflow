const {
  orderRoomName,
  STAFF_ORDERS_ROOM,
  assertCanJoinStaff,
  isStaffRole,
} = require('../../src/sockets/socketAuthorization');
const { ROLES } = require('../../src/modules/auth/auth.constants');
const {
  setIO,
  getIO,
  emitOrderCreated,
  emitOrderUpdated,
  emitOrderReady,
  emitOrderCancelled,
} = require('../../src/sockets/orderEvents');

describe('socketAuthorization helpers', () => {
  it('builds order room names and recognizes staff roles', () => {
    expect(orderRoomName('abc')).toBe('order:abc');
    expect(STAFF_ORDERS_ROOM).toBe('staff:orders');
    expect(isStaffRole(ROLES.STAFF)).toBe(true);
    expect(isStaffRole(ROLES.MANAGER)).toBe(true);
    expect(isStaffRole(ROLES.CUSTOMER)).toBe(false);
  });

  it('rejects customers from staff room', () => {
    expect(() =>
      assertCanJoinStaff({ id: 'u1', role: ROLES.CUSTOMER })
    ).toThrow(/Forbidden/);
  });

  it('allows staff to join staff room', () => {
    expect(
      assertCanJoinStaff({ id: 'u1', role: ROLES.STAFF })
    ).toBe(true);
  });
});

describe('orderEvents emits', () => {
  afterEach(() => {
    setIO(null);
  });

  it('no-ops when IO is not initialized', () => {
    setIO(null);
    expect(() =>
      emitOrderCreated({ id: 'o1', status: 'PLACED' })
    ).not.toThrow();
  });

  it('emits to order and staff rooms', () => {
    const emitted = [];
    const fakeIo = {
      to(room) {
        return {
          emit(event, payload) {
            emitted.push({ room, event, payload });
          },
        };
      },
    };
    setIO(fakeIo);
    expect(getIO()).toBe(fakeIo);

    const order = { id: 'o1', status: 'PREPARING' };
    emitOrderUpdated(order);
    emitOrderReady({ id: 'o1', status: 'READY' });
    emitOrderCancelled({ id: 'o1', status: 'CANCELLED' });
    emitOrderCreated({ id: 'o1', status: 'PLACED' });

    expect(emitted.some((e) => e.event === 'order:updated')).toBe(true);
    expect(emitted.some((e) => e.event === 'order:ready')).toBe(true);
    expect(emitted.some((e) => e.event === 'order:cancelled')).toBe(true);
    expect(emitted.some((e) => e.event === 'order:created')).toBe(true);
    expect(emitted.some((e) => e.room === 'order:o1')).toBe(true);
    expect(emitted.some((e) => e.room === 'staff:orders')).toBe(true);
  });
});
