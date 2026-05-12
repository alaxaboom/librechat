const express = require('express');
const { createAdminRolesHandlers } = require('@librechat/api');
const { SystemCapabilities } = require('@librechat/data-schemas');
const { requireCapability } = require('~/server/middleware/roles/capabilities');
const { requireJwtAuth } = require('~/server/middleware');
const db = require('~/models');

const router = express.Router();

const requireAdminAccess = requireCapability(SystemCapabilities.ACCESS_ADMIN);
const requireReadRoles = requireCapability(SystemCapabilities.READ_ROLES);
const requireManageRoles = requireCapability(SystemCapabilities.MANAGE_ROLES);

const handlers = createAdminRolesHandlers({
  listRoles: db.listRoles,
  countRoles: db.countRoles,
  getRoleByName: db.getRoleByName,
  createRoleByName: db.createRoleByName,
  updateRoleByName: db.updateRoleByName,
  updateAccessPermissions: db.updateAccessPermissions,
  deleteRoleByName: db.deleteRoleByName,
  findUser: db.findUser,
  updateUser: db.updateUser,
  updateUsersByRole: db.updateUsersByRole,
  findUserIdsByRole: db.findUserIdsByRole,
  updateUsersRoleByIds: db.updateUsersRoleByIds,
  listUsersByRole: db.listUsersByRole,
  countUsersByRole: db.countUsersByRole,
  deleteConfig: db.deleteConfig,
  deleteAclEntries: db.deleteAclEntries,
  deleteGrantsForPrincipal: db.deleteGrantsForPrincipal,
});

router.use(requireJwtAuth, requireAdminAccess);

router.get('/', requireReadRoles, (req, res, next) => {
  console.log('Получение списка ролей администратором', req.user.id);
  handlers.listRoles(req, res, next);
});
router.post('/', requireManageRoles, (req, res, next) => {
  console.log('Создание роли администратором', req.user.id, 'роль:', req.body?.name);
  handlers.createRole(req, res, next);
});
router.get('/:name', requireReadRoles, (req, res, next) => {
  console.log('Получение роли', req.params.name, 'администратором', req.user.id);
  handlers.getRole(req, res, next);
});
router.patch('/:name', requireManageRoles, (req, res, next) => {
  console.log('Обновление роли', req.params.name, 'администратором', req.user.id);
  handlers.updateRole(req, res, next);
});
router.delete('/:name', requireManageRoles, (req, res, next) => {
  console.log('Удаление роли', req.params.name, 'администратором', req.user.id);
  handlers.deleteRole(req, res, next);
});
router.patch('/:name/permissions', requireManageRoles, (req, res, next) => {
  console.log('Обновление разрешений роли', req.params.name, 'администратором', req.user.id);
  handlers.updateRolePermissions(req, res, next);
});
router.get('/:name/members', requireReadRoles, (req, res, next) => {
  console.log('Получение участников роли', req.params.name, 'администратором', req.user.id);
  handlers.getRoleMembers(req, res, next);
});
router.post('/:name/members', requireManageRoles, (req, res, next) => {
  console.log('Добавление участника в роль', req.params.name, 'администратором', req.user.id);
  handlers.addRoleMember(req, res, next);
});
router.delete('/:name/members/:userId', requireManageRoles, (req, res, next) => {
  console.log('Удаление участника', req.params.userId, 'из роли', req.params.name, 'администратором', req.user.id);
  handlers.removeRoleMember(req, res, next);
});

module.exports = router;
