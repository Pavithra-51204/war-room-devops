const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

const register = async ({ username, email, password, role }) => {
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw Object.assign(new Error('User already exists'), { statusCode: 409 });

  const user = await User.create({ username, email, password, role });
  const token = signToken(user._id);
  return { token, user: user.toSafeObject() };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  user.lastSeen = Date.now();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  return { token, user: user.toSafeObject() };
};

module.exports = { register, login };
