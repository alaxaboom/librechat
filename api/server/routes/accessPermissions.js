const express = require('express');
const { ResourceType, PermissionBits } = require('librechat-data-provider');
const {
  getUserEffectivePermissions,
  getAllEffectivePermissions,
  updateResourcePermissions,
  getResourcePermissions,
  getResourceRoles,
  searchPrincipals,
} = require('~/server/controllers/PermissionsController');
const { requireJwtAuth, checkBan, uaParser, canAccessResource } = require('~/server/middleware');
const { checkPeoplePickerAccess } = require('~/server/middleware/checkPeoplePickerAccess');
const { checkSharePublicAccess } = require('~/server/middleware/checkSharePublicAccess');
const { findMCPServerByObjectId, getSkillById } = require('~/models');

const router = express.Router();

// Apply common middleware
router.use(requireJwtAuth);
router.use(checkBan);
router.use(uaParser);

/**
 * Generic routes for resource permissions
 * Pattern: /api/permissions/{resourceType}/{resourceId}
 */

/**
 * GET /api/permissions/search-principals
 * Search for users and groups to grant permissions
 */
router.get('/search-principals', checkPeoplePickerAccess, (req, res, next) => {
  console.log('Поиск принципалов пользователем', req.user.id);
  searchPrincipals(req, res, next);
});

/**
 * GET /api/permissions/{resourceType}/roles
 * Get available roles for a resource type
 */
router.get('/:resourceType/roles', (req, res, next) => {
  console.log('Получение ролей для типа ресурса', req.params.resourceType, 'пользователем', req.user.id);
  getResourceRoles(req, res, next);
});

/**
 * Middleware factory to check resource access for permission-related operations.
 * SECURITY: Users must have SHARE permission to view or modify resource permissions.
 * @param {string} requiredPermission - The permission bit required (e.g., SHARE)
 * @returns Express middleware function
 */
const checkResourcePermissionAccess = (requiredPermission) => (req, res, next) => {
  const { resourceType } = req.params;
  let middleware;

  if (resourceType === ResourceType.AGENT) {
    middleware = canAccessResource({
      resourceType: ResourceType.AGENT,
      requiredPermission,
      resourceIdParam: 'resourceId',
    });
  } else if (resourceType === ResourceType.REMOTE_AGENT) {
    middleware = canAccessResource({
      resourceType: ResourceType.REMOTE_AGENT,
      requiredPermission,
      resourceIdParam: 'resourceId',
    });
  } else if (resourceType === ResourceType.PROMPTGROUP) {
    middleware = canAccessResource({
      resourceType: ResourceType.PROMPTGROUP,
      requiredPermission,
      resourceIdParam: 'resourceId',
    });
  } else if (resourceType === ResourceType.MCPSERVER) {
    middleware = canAccessResource({
      resourceType: ResourceType.MCPSERVER,
      requiredPermission,
      resourceIdParam: 'resourceId',
      idResolver: findMCPServerByObjectId,
    });
  } else if (resourceType === ResourceType.SKILL) {
    middleware = canAccessResource({
      resourceType: ResourceType.SKILL,
      requiredPermission,
      resourceIdParam: 'resourceId',
      idResolver: getSkillById,
    });
  } else {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Unsupported resource type: ${resourceType}`,
    });
  }

  // Execute the middleware
  middleware(req, res, next);
};

/**
 * GET /api/permissions/{resourceType}/{resourceId}
 * Get all permissions for a specific resource
 * SECURITY: Requires SHARE permission to view resource permissions
 */
router.get(
  '/:resourceType/:resourceId',
  checkResourcePermissionAccess(PermissionBits.SHARE),
  (req, res, next) => {
    console.log('Получение разрешений для ресурса', req.params.resourceType, req.params.resourceId, 'пользователем', req.user.id);
    getResourcePermissions(req, res, next);
  },
);

/**
 * PUT /api/permissions/{resourceType}/{resourceId}
 * Bulk update permissions for a specific resource
 * SECURITY: Requires SHARE permission to modify resource permissions
 * SECURITY: Requires SHARE_PUBLIC permission to enable public sharing
 */
router.put(
  '/:resourceType/:resourceId',
  checkResourcePermissionAccess(PermissionBits.SHARE),
  checkSharePublicAccess,
  (req, res, next) => {
    console.log('Обновление разрешений для ресурса', req.params.resourceType, req.params.resourceId, 'пользователем', req.user.id);
    updateResourcePermissions(req, res, next);
  },
);

/**
 * GET /api/permissions/{resourceType}/effective/all
 * Get user's effective permissions for all accessible resources of a type
 */
router.get('/:resourceType/effective/all', (req, res, next) => {
  console.log('Получение эффективных разрешений для всех ресурсов типа', req.params.resourceType, 'пользователем', req.user.id);
  getAllEffectivePermissions(req, res, next);
});

/**
 * GET /api/permissions/{resourceType}/{resourceId}/effective
 * Get user's effective permissions for a specific resource
 */
router.get('/:resourceType/:resourceId/effective', (req, res, next) => {
  console.log('Получение эффективных разрешений для ресурса', req.params.resourceType, req.params.resourceId, 'пользователем', req.user.id);
  getUserEffectivePermissions(req, res, next);
});

module.exports = router;
