const express = require('express');
const { getAvailableTools } = require('~/server/controllers/PluginController');

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('Получение доступных инструментов пользователем', req.user?.id);
  getAvailableTools(req, res, next);
});

module.exports = router;
