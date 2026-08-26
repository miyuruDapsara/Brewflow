import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '../sockets/socketClient';
import {
  attachOrderHandlers,
  joinOrderRoom,
  leaveOrderRoom,
  joinStaffRoom,
  leaveStaffRoom,
} from '../sockets/orderSocketHandlers';

/**
 * Subscribe to order and/or staff socket rooms.
 * @param {object} options
 * @param {string} [options.orderId]
 * @param {boolean} [options.joinStaff]
 * @param {function} [options.onOrderEvent] - receives updated order
 * @param {function} [options.onReconnect] - refetch via REST
 */
export default function useOrderSocket({
  orderId,
  joinStaff = false,
  onOrderEvent,
  onReconnect,
} = {}) {
  const onOrderEventRef = useRef(onOrderEvent);
  const onReconnectRef = useRef(onReconnect);

  useEffect(() => {
    onOrderEventRef.current = onOrderEvent;
  }, [onOrderEvent]);

  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) {
      return undefined;
    }

    let cancelled = false;
    let detachHandlers = () => {};

    function handleOrder(order) {
      if (order && onOrderEventRef.current) {
        onOrderEventRef.current(order);
      }
    }

    async function joinRooms() {
      if (cancelled) return;
      detachHandlers = attachOrderHandlers(socket, {
        onCreated: handleOrder,
        onUpdated: handleOrder,
        onReady: handleOrder,
        onCancelled: handleOrder,
      });

      if (orderId) {
        await joinOrderRoom(socket, orderId);
      }
      if (joinStaff) {
        await joinStaffRoom(socket);
      }
    }

    function onConnect() {
      joinRooms();
      if (onReconnectRef.current) {
        onReconnectRef.current();
      }
    }

    if (socket.connected) {
      joinRooms();
    }

    socket.on('connect', onConnect);

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      detachHandlers();
      if (orderId) {
        leaveOrderRoom(socket, orderId);
      }
      if (joinStaff) {
        leaveStaffRoom(socket);
      }
    };
  }, [orderId, joinStaff]);

  return getSocket();
}
