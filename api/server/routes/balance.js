const express = require('express');
const router = express.Router();
const controller = require('../controllers/Balance');
const { requireJwtAuth } = require('../middleware/');

router.get('/', requireJwtAuth, (req, res, next) => {
  console.log('Получение баланса пользователем', req.user.id);
  controller(req, res, next);
});

module.exports = router;
