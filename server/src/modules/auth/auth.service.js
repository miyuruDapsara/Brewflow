const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const { ROLES, BCRYPT_SALT_ROUNDS } = require('./auth.constants');
const { env } = require('../../config/env');
const ApiError = require('../../utils/ApiError');

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: ROLES.CUSTOMER,
  });

  const token = signToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash'
  );

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Authentication required');
  }

  return user.toSafeObject();
}

module.exports = {
  register,
  login,
  getMe,
  signToken,
};
