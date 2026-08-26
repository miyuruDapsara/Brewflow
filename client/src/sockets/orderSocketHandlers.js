export function attachOrderHandlers(socket, handlers = {}) {
  if (!socket) {
    return () => {};
  }

  const {
    onCreated,
    onUpdated,
    onReady,
    onCancelled,
  } = handlers;

  function handleCreated(payload) {
    onCreated?.(payload?.order || payload);
  }
  function handleUpdated(payload) {
    onUpdated?.(payload?.order || payload);
  }
  function handleReady(payload) {
    onReady?.(payload?.order || payload);
  }
  function handleCancelled(payload) {
    onCancelled?.(payload?.order || payload);
  }

  if (onCreated) socket.on('order:created', handleCreated);
  if (onUpdated) socket.on('order:updated', handleUpdated);
  if (onReady) socket.on('order:ready', handleReady);
  if (onCancelled) socket.on('order:cancelled', handleCancelled);

  return () => {
    if (onCreated) socket.off('order:created', handleCreated);
    if (onUpdated) socket.off('order:updated', handleUpdated);
    if (onReady) socket.off('order:ready', handleReady);
    if (onCancelled) socket.off('order:cancelled', handleCancelled);
  };
}

export function joinOrderRoom(socket, orderId) {
  return new Promise((resolve) => {
    if (!socket || !orderId) {
      resolve({ ok: false });
      return;
    }
    socket.emit('join:order', orderId, (ack) => resolve(ack || { ok: true }));
  });
}

export function leaveOrderRoom(socket, orderId) {
  return new Promise((resolve) => {
    if (!socket || !orderId) {
      resolve({ ok: false });
      return;
    }
    socket.emit('leave:order', orderId, (ack) => resolve(ack || { ok: true }));
  });
}

export function joinStaffRoom(socket) {
  return new Promise((resolve) => {
    if (!socket) {
      resolve({ ok: false });
      return;
    }
    socket.emit('join:staff', (ack) => resolve(ack || { ok: true }));
  });
}

export function leaveStaffRoom(socket) {
  return new Promise((resolve) => {
    if (!socket) {
      resolve({ ok: false });
      return;
    }
    socket.emit('leave:staff', (ack) => resolve(ack || { ok: true }));
  });
}
