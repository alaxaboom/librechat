const express = require('express');
const { createAdminConfigHandlers } = require('@librechat/api');
const { SystemCapabilities } = require('@librechat/data-schemas');
const {
  hasConfigCapability,
  requireCapability,
} = require('~/server/middleware/roles/capabilities');
const { getAppConfig, invalidateConfigCaches } = require('~/server/services/Config');
const { requireJwtAuth } = require('~/server/middleware');
const db = require('~/models');

const router = express.Router();

const requireAdminAccess = requireCapability(SystemCapabilities.ACCESS_ADMIN);

const handlers = createAdminConfigHandlers({
  listAllConfigs: db.listAllConfigs,
  findConfigByPrincipal: db.findConfigByPrincipal,
  upsertConfig: db.upsertConfig,
  patchConfigFields: db.patchConfigFields,
  unsetConfigField: db.unsetConfigField,
  deleteConfig: db.deleteConfig,
  toggleConfigActive: db.toggleConfigActive,
  hasConfigCapability,
  getAppConfig,
  invalidateConfigCaches,
});

router.use(requireJwtAuth, requireAdminAccess);

router.get('/', (req, res, next) => {
  console.log('Получение списка конфигураций администратором', req.user.id);
  handlers.listConfigs(req, res, next);
});
router.get('/base', (req, res, next) => {
  console.log('Получение базовой конфигурации администратором', req.user.id);
  handlers.getBaseConfig(req, res, next);
});
router.get('/:principalType/:principalId', (req, res, next) => {
  console.log('Получение конфигурации для', req.params.principalType, req.params.principalId, 'администратором', req.user.id);
  handlers.getConfig(req, res, next);
});
router.put('/:principalType/:principalId', (req, res, next) => {
  console.log('Обновление конфигурации для', req.params.principalType, req.params.principalId, 'администратором', req.user.id);
  handlers.upsertConfigOverrides(req, res, next);
});
router.patch('/:principalType/:principalId/fields', (req, res, next) => {
  console.log('Изменение полей конфигурации для', req.params.principalType, req.params.principalId, 'администратором', req.user.id);
  handlers.patchConfigField(req, res, next);
});
router.delete('/:principalType/:principalId/fields', (req, res, next) => {
  console.log('Удаление полей конфигурации для', req.params.principalType, req.params.principalId, 'администратором', req.user.id);
  handlers.deleteConfigField(req, res, next);
});
router.delete('/:principalType/:principalId', (req, res, next) => {
  console.log('Удаление конфигурации для', req.params.principalType, req.params.principalId, 'администратором', req.user.id);
  handlers.deleteConfigOverrides(req, res, next);
});
router.patch('/:principalType/:principalId/active', (req, res, next) => {
  console.log('Переключение активности конфигурации для', req.params.principalType, req.params.principalId, 'администратором', req.user.id);
  handlers.toggleConfig(req, res, next);
});

module.exports = router;
