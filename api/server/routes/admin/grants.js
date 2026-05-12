const express = require('express');
const { createAdminGrantsHandlers, getCachedPrincipals } = require('@librechat/api');
const { SystemCapabilities } = require('@librechat/data-schemas');
const { requireCapability } = require('~/server/middleware/roles/capabilities');
const { requireJwtAuth } = require('~/server/middleware');
const db = require('~/models');

const router = express.Router();

const requireAdminAccess = requireCapability(SystemCapabilities.ACCESS_ADMIN);

const handlers = createAdminGrantsHandlers({
  listGrants: db.listGrants,
  countGrants: db.countGrants,
  getCapabilitiesForPrincipal: db.getCapabilitiesForPrincipal,
  getCapabilitiesForPrincipals: db.getCapabilitiesForPrincipals,
  grantCapability: db.grantCapability,
  revokeCapability: db.revokeCapability,
  getUserPrincipals: db.getUserPrincipals,
  hasCapabilityForPrincipals: db.hasCapabilityForPrincipals,
  getHeldCapabilities: db.getHeldCapabilities,
  getCachedPrincipals,
  checkRoleExists: async (name) => (await db.getRoleByName(name)) != null,
});

router.use(requireJwtAuth, requireAdminAccess);

router.get('/', (req, res, next) => {
  console.log('Получение списка грантов администратором', req.user.id);
  handlers.listGrants(req, res, next);
});
router.get('/effective', (req, res, next) => {
  console.log('Получение эффективных возможностей администратором', req.user.id);
  handlers.getEffectiveCapabilities(req, res, next);
});
router.get('/:principalType/:principalId', (req, res, next) => {
  console.log('Получение грантов для', req.params.principalType, req.params.principalId, 'администратором', req.user.id);
  handlers.getPrincipalGrants(req, res, next);
});
router.post('/', (req, res, next) => {
  console.log('Назначение гранта администратором', req.user.id);
  handlers.assignGrant(req, res, next);
});
/** Callers should encodeURIComponent the capability for client compatibility (e.g. manage%3Aconfigs%3Aendpoints). */
router.delete('/:principalType/:principalId/:capability', (req, res, next) => {
  console.log('Отзыв гранта', req.params.capability, 'для', req.params.principalType, req.params.principalId, 'администратором', req.user.id);
  handlers.revokeGrant(req, res, next);
});

module.exports = router;
