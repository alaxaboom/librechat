const express = require('express');
const { configMiddleware } = require('~/server/middleware');
const v1 = require('~/server/controllers/assistants/v1');
const v2 = require('~/server/controllers/assistants/v2');
const documents = require('./documents');
const actions = require('./actions');
const tools = require('./tools');

const router = express.Router();
router.use(configMiddleware);

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
  console.log('Создание ассистента V2 пользователем', req.user?.id, 'название:', req.body?.name);
  v2.createAssistant(req, res, next);
});

/**
 * Retrieves an assistant.
 * @route GET /assistants/:id
 * @param {string} req.params.id - Assistant identifier.
 * @returns {Assistant} 200 - success response - application/json
 */
router.get('/:id', (req, res, next) => {
  console.log('Получение ассистента V2', req.params.id, 'пользователем', req.user?.id);
  v1.retrieveAssistant(req, res, next);
});

/**
 * Modifies an assistant.
 * @route PATCH /assistants/:id
 * @param {string} req.params.id - Assistant identifier.
 * @param {AssistantUpdateParams} req.body - The assistant update parameters.
 * @returns {Assistant} 200 - success response - application/json
 */
router.patch('/:id', (req, res, next) => {
  console.log('Обновление ассистента V2', req.params.id, 'пользователем', req.user?.id);
  v2.patchAssistant(req, res, next);
});

/**
 * Deletes an assistant.
 * @route DELETE /assistants/:id
 * @param {string} req.params.id - Assistant identifier.
 * @returns {Assistant} 200 - success response - application/json
 */
router.delete('/:id', (req, res, next) => {
  console.log('Удаление ассистента V2', req.params.id, 'пользователем', req.user?.id);
  v1.deleteAssistant(req, res, next);
});

/**
 * Returns a list of assistants.
 * @route GET /assistants
 * @param {AssistantListParams} req.query - The assistant list parameters for pagination and sorting.
 * @returns {AssistantListResponse} 200 - success response - application/json
 */
router.get('/', (req, res, next) => {
  console.log('Получение списка ассистентов V2 пользователем', req.user?.id);
  v1.listAssistants(req, res, next);
});

/**
 * Uploads and updates an avatar for a specific assistant.
 * @route POST /avatar/:assistant_id
 * @param {string} req.params.assistant_id - The ID of the assistant.
 * @param {Express.Multer.File} req.file - The avatar image file.
 * @param {string} [req.body.metadata] - Optional metadata for the assistant's avatar.
 * @returns {Object} 200 - success response - application/json
 */
router.post('/avatar/:assistant_id', (req, res, next) => {
  console.log('Загрузка аватара для ассистента V2', req.params.assistant_id, 'пользователем', req.user?.id);
  v1.uploadAssistantAvatar(req, res, next);
});

module.exports = router;
