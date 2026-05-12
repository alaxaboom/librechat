const express = require('express');
const { generateCheckAccess, createApiKeyHandlers } = require('@librechat/api');
const { PermissionTypes, Permissions } = require('librechat-data-provider');
const {
  getAgentApiKeyById,
  createAgentApiKey,
  deleteAgentApiKey,
  listAgentApiKeys,
  getRoleByName,
} = require('~/models');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

const handlers = createApiKeyHandlers({
  createAgentApiKey,
  listAgentApiKeys,
  deleteAgentApiKey,
  getAgentApiKeyById,
});

const checkRemoteAgentsUse = generateCheckAccess({
  permissionType: PermissionTypes.REMOTE_AGENTS,
  permissions: [Permissions.USE],
  getRoleByName,
});

router.post('/', requireJwtAuth, checkRemoteAgentsUse, (req, res, next) => {
  console.log('Создание API ключа пользователем', req.user.id);
  handlers.createApiKey(req, res, next);
});

router.get('/', requireJwtAuth, checkRemoteAgentsUse, (req, res, next) => {
  console.log('Получение списка API ключей пользователем', req.user.id);
  handlers.listApiKeys(req, res, next);
});

router.get('/:id', requireJwtAuth, checkRemoteAgentsUse, (req, res, next) => {
  console.log('Получение API ключа', req.params.id, 'пользователем', req.user.id);
  handlers.getApiKey(req, res, next);
});

router.delete('/:id', requireJwtAuth, checkRemoteAgentsUse, (req, res, next) => {
  console.log('Удаление API ключа', req.params.id, 'пользователем', req.user.id);
  handlers.deleteApiKey(req, res, next);
});

module.exports = router;
