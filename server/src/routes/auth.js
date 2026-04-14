const router = require('express').Router();
const { register, login } = require('../services/authService');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() });
});

module.exports = router;
