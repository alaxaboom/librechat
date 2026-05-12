const express = require('express');
const { createAdminGroupsHandlers } = require('@librechat/api');
const { SystemCapabilities } = require('@librechat/data-schemas');
const { requireCapability } = require('~/server/middleware/roles/capabilities');
const { requireJwtAuth } = require('~/server/middleware');
const db = require('~/models');

const router = express.Router();

const requireAdminAccess = requireCapability(SystemCapabilities.ACCESS_ADMIN);
const requireReadGroups = requireCapability(SystemCapabilities.READ_GROUPS);
const requireManageGroups = requireCapability(SystemCapabilities.MANAGE_GROUPS);

const handlers = createAdminGroupsHandlers({
  listGroups: db.listGroups,
  countGroups: db.countGroups,
  findGroupById: db.findGroupById,
  createGroup: db.createGroup,
  updateGroupById: db.updateGroupById,
  deleteGroup: db.deleteGroup,
  addUserToGroup: db.addUserToGroup,
  removeUserFromGroup: db.removeUserFromGroup,
  removeMemberById: db.removeMemberById,
  findUsers: db.findUsers,
  deleteConfig: db.deleteConfig,
  deleteAclEntries: db.deleteAclEntries,
});

router.use(requireJwtAuth, requireAdminAccess);

router.get('/', requireReadGroups, (req, res, next) => {
  console.log('Получение списка групп администратором', req.user.id);
  handlers.listGroups(req, res, next);
});
router.post('/', requireManageGroups, (req, res, next) => {
  console.log('Создание группы администратором', req.user.id, 'название:', req.body?.name);
  handlers.createGroup(req, res, next);
});
router.get('/:id', requireReadGroups, (req, res, next) => {
  console.log('Получение группы', req.params.id, 'администратором', req.user.id);
  handlers.getGroup(req, res, next);
});
router.patch('/:id', requireManageGroups, (req, res, next) => {
  console.log('Обновление группы', req.params.id, 'администратором', req.user.id);
  handlers.updateGroup(req, res, next);
});
router.delete('/:id', requireManageGroups, (req, res, next) => {
  console.log('Удаление группы', req.params.id, 'администратором', req.user.id);
  handlers.deleteGroup(req, res, next);
});
router.get('/:id/members', requireReadGroups, (req, res, next) => {
  console.log('Получение участников группы', req.params.id, 'администратором', req.user.id);
  handlers.getGroupMembers(req, res, next);
});
router.post('/:id/members', requireManageGroups, (req, res, next) => {
  console.log('Добавление участника в группу', req.params.id, 'администратором', req.user.id);
  handlers.addGroupMember(req, res, next);
});
router.delete('/:id/members/:userId', requireManageGroups, (req, res, next) => {
  console.log('Удаление участника', req.params.userId, 'из группы', req.params.id, 'администратором', req.user.id);
  handlers.removeGroupMember(req, res, next);
});

module.exports = router;
