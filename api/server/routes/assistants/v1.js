const express = require('express');
const controllers = require('~/server/controllers/assistants/v1');
const documents = require('./documents');
const actions = require('./actions');
const tools = require('./tools');

const router = express.Router();
const avatar = express.Router();

/**
 * Assistant actions route.
 * @route GET|POST /assistants/actions
 */
router.use('/actions', actions);

/**
 * Create an assistant.
 * @route GET /assistants/tools
 * @returns {TPlugin[]} 200 - application/json
 */
router.use('/tools', tools);

/**
 * Create an assistant.
 * @route GET /assistants/documents
 * @returns {AssistantDocument[]} 200 - application/json
 */
router.use('/documents', documents);

/**
 * Create an assistant.
 * @route POST /assistants
 * @param {AssistantCreateParams} req.body - The assistant creation parameters.
 * @returns {Assistant} 201 - success response - application/json
 */
router.post('/', (req, res, next) => {
  console.log('Создание ассистента пользователем', req.user?.id, 'название:', req.body?.name);
  controllers.createAssistant(req, res, next);
});

/**
 * Retrieves an assistant.
 * @route GET /assistants/:id
 * @param {string} req.params.id - Assistant identifier.
 * @returns {Assistant} 200 - success response - application/json
 */
router.get('/:id', (req, res, next) => {
  console.log('Получение ассистента', req.params.id, 'пользователем', req.user?.id);
  controllers.retrieveAssistant(req, res, next);
});

/**
 * Modifies an assistant.
 * @route PATCH /assistants/:id
 * @param {string} req.params.id - Assistant identifier.
 * @param {AssistantUpdateParams} req.body - The assistant update parameters.
 * @returns {Assistant} 200 - success response - application/json
 */
router.patch('/:id', (req, res, next) => {
  console.log('Обновление ассистента', req.params.id, 'пользователем', req.user?.id);
  controllers.patchAssistant(req, res, next);
});

/**
 * Deletes an assistant.
 * @route DELETE /assistants/:id
 * @param {string} req.params.id - Assistant identifier.
 * @returns {Assistant} 200 - success response - application/json
 */
router.delete('/:id', (req, res, next) => {
  console.log('Удаление ассистента', req.params.id, 'пользователем', req.user?.id);
  controllers.deleteAssistant(req, res, next);
});

/**
 * Returns a list of assistants.
 * @route GET /assistants
 * @param {AssistantListParams} req.query - The assistant list parameters for pagination and sorting.
 * @returns {AssistantListResponse} 200 - success response - application/json
 */
router.get('/', (req, res, next) => {
  console.log('Получение списка ассистентов пользователем', req.user?.id);
  controllers.listAssistants(req, res, next);
});

/**
 * Uploads and updates an avatar for a specific assistant.
 * @route POST /assistants/:assistant_id/avatar/
 * @param {string} req.params.assistant_id - The ID of the assistant.
 * @param {Express.Multer.File} req.file - The avatar image file.
 * @param {string} [req.body.metadata] - Optional metadata for the assistant's avatar.
 * @returns {Object} 200 - success response - application/json
 */
avatar.post('/:assistant_id/avatar/', (req, res, next) => {
  console.log('Загрузка аватара для ассистента', req.params.assistant_id, 'пользователем', req.user?.id);
  controllers.uploadAssistantAvatar(req, res, next);
});

module.exports = { v1: router, avatar };
