const express = require('express');
const { callTool, verifyToolAuth, getToolCalls } = require('~/server/controllers/tools');
const { getAvailableTools } = require('~/server/controllers/PluginController');
const { toolCallLimiter } = require('~/server/middleware');

const router = express.Router();

/**
 * Get a list of available tools for agents.
 * @route GET /agents/tools
 * @returns {TPlugin[]} 200 - application/json
 */
router.get('/', (req, res, next) => {
  console.log('Получение доступных инструментов агента пользователем', req.user?.id);
  getAvailableTools(req, res, next);
});

/**
 * Get a list of tool calls.
 * @route GET /agents/tools/calls
 * @returns {ToolCallData[]} 200 - application/json
 */
router.get('/calls', (req, res, next) => {
  console.log('Получение вызовов инструментов пользователем', req.user?.id);
  getToolCalls(req, res, next);
});

/**
 * Verify authentication for a specific tool
 * @route GET /agents/tools/:toolId/auth
 * @param {string} toolId - The ID of the tool to verify
 * @returns {{ authenticated?: boolean; message?: string }}
 */
router.get('/:toolId/auth', (req, res, next) => {
  console.log('Проверка аутентификации инструмента', req.params.toolId, 'пользователем', req.user?.id);
  verifyToolAuth(req, res, next);
});

/**
 * Execute code for a specific tool
 * @route POST /agents/tools/:toolId/call
 * @param {string} toolId - The ID of the tool to execute
 * @param {object} req.body - Request body
 * @returns {object} Result of code execution
 */
router.post('/:toolId/call', toolCallLimiter, (req, res, next) => {
  console.log('Вызов инструмента', req.params.toolId, 'пользователем', req.user?.id);
  callTool(req, res, next);
});

module.exports = router;
