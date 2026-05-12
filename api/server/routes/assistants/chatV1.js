const express = require('express');

const router = express.Router();
const {
  setHeaders,
  handleAbort,
  validateModel,
  buildEndpointOption,
} = require('~/server/middleware');
const validateConvoAccess = require('~/server/middleware/validate/convoAccess');
const validateAssistant = require('~/server/middleware/assistants/validate');
const chatController = require('~/server/controllers/assistants/chatV1');

router.post('/abort', (req, res, next) => {
  console.log('Прерывание чата ассистента пользователем', req.user?.id);
  handleAbort()(req, res, next);
});

/**
 * @route POST /
 * @desc Chat with an assistant
 * @access Public
 * @param {express.Request} req - The request object, containing the request data.
 * @param {express.Response} res - The response object, used to send back a response.
 * @returns {void}
 */
router.post(
  '/',
  validateModel,
  buildEndpointOption,
  validateAssistant,
  validateConvoAccess,
  setHeaders,
  (req, res, next) => {
    console.log('Чат с ассистентом пользователем', req.user?.id, 'ассистент:', req.body?.assistant_id);
    chatController(req, res, next);
  },
);

module.exports = router;
