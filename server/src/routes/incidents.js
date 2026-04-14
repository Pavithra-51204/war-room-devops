const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

// incidentService is attached to app.locals in app.js
const svc = (req) => req.app.locals.incidentService;

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const incidents = await svc(req).getAll(req.query);
    res.json({ success: true, data: incidents });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const incident = await svc(req).getById(req.params.id);
    res.json({ success: true, data: incident });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const incident = await svc(req).create(req.body, req.user._id);
    res.status(201).json({ success: true, data: incident });
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const incident = await svc(req).update(req.params.id, req.body);
    res.json({ success: true, data: incident });
  } catch (e) { next(e); }
});

router.post('/:id/updates', async (req, res, next) => {
  try {
    const { message } = req.body;
    const incident = await svc(req).addUpdate(req.params.id, message, req.user.username);
    res.json({ success: true, data: incident });
  } catch (e) { next(e); }
});

router.delete('/:id', requireRole('COMMANDER', 'ADMIN'), async (req, res, next) => {
  try {
    const result = await svc(req).remove(req.params.id);
    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
