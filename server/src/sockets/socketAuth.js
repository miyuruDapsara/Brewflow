const jwt = require('jsonwebtoken');
const User = require('../modules/auth/user.model');
const { env } = require('../config/env');

/**
 * Socket.IO auth middleware: require valid JWT + active user.
 */
async function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization || '')
        .replace(/^Bearer\s+/i, '')
        .trim();

    if (!token) {
      return next(new Error('Authentication required'));
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      return next(new Error('Invalid or expired token'));
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return next(new Error('Authentication required'));
    }

    socket.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = socketAuth;
