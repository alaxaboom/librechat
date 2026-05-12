const express = require('express');
const { createSetBalanceConfig } = require('@librechat/api');
const {
  resetPasswordRequestController,
  resetPasswordController,
  registrationController,
  graphTokenController,
  refreshController,
} = require('~/server/controllers/AuthController');
const {
  regenerateBackupCodes,
  disable2FA,
  confirm2FA,
  enable2FA,
  verify2FA,
} = require('~/server/controllers/TwoFactorController');
const { verify2FAWithTempToken } = require('~/server/controllers/auth/TwoFactorAuthController');
const { logoutController } = require('~/server/controllers/auth/LogoutController');
const { loginController } = require('~/server/controllers/auth/LoginController');
const { findBalanceByUser, upsertBalanceFields } = require('~/models');
const { getAppConfig } = require('~/server/services/Config');
const middleware = require('~/server/middleware');

const setBalanceConfig = createSetBalanceConfig({
  getAppConfig,
  findBalanceByUser,
  upsertBalanceFields,
});

const router = express.Router();

const ldapAuth = !!process.env.LDAP_URL && !!process.env.LDAP_USER_SEARCH_BASE;
//Local
router.post('/logout', middleware.requireJwtAuth, (req, res, next) => {
  console.log('Выход пользователя', req.user?.id);
  logoutController(req, res, next);
});
router.post(
  '/login',
  middleware.logHeaders,
  middleware.loginLimiter,
  middleware.checkBan,
  ldapAuth ? middleware.requireLdapAuth : middleware.requireLocalAuth,
  setBalanceConfig,
  (req, res, next) => {
    console.log('Вход пользователя', req.body?.email || req.body?.username);
    loginController(req, res, next);
  },
);
router.post('/refresh', (req, res, next) => {
  console.log('Обновление токена');
  refreshController(req, res, next);
});
router.post(
  '/register',
  middleware.registerLimiter,
  middleware.checkBan,
  middleware.checkInviteUser,
  middleware.validateRegistration,
  (req, res, next) => {
    console.log('Регистрация пользователя', req.body?.email);
    registrationController(req, res, next);
  },
);
router.post(
  '/requestPasswordReset',
  middleware.resetPasswordLimiter,
  middleware.checkBan,
  middleware.validatePasswordReset,
  (req, res, next) => {
    console.log('Запрос сброса пароля для', req.body?.email);
    resetPasswordRequestController(req, res, next);
  },
);
router.post(
  '/resetPassword',
  middleware.checkBan,
  middleware.validatePasswordReset,
  (req, res, next) => {
    console.log('Сброс пароля');
    resetPasswordController(req, res, next);
  },
);

router.post('/2fa/enable', middleware.requireJwtAuth, (req, res, next) => {
  console.log('Включение 2FA пользователем', req.user?.id);
  enable2FA(req, res, next);
});
router.post('/2fa/verify', middleware.requireJwtAuth, (req, res, next) => {
  console.log('Проверка 2FA пользователем', req.user?.id);
  verify2FA(req, res, next);
});
router.post('/2fa/verify-temp', middleware.checkBan, (req, res, next) => {
  console.log('Проверка временного 2FA токена');
  verify2FAWithTempToken(req, res, next);
});
router.post('/2fa/confirm', middleware.requireJwtAuth, (req, res, next) => {
  console.log('Подтверждение 2FA пользователем', req.user?.id);
  confirm2FA(req, res, next);
});
router.post('/2fa/disable', middleware.requireJwtAuth, (req, res, next) => {
  console.log('Отключение 2FA пользователем', req.user?.id);
  disable2FA(req, res, next);
});
router.post('/2fa/backup/regenerate', middleware.requireJwtAuth, (req, res, next) => {
  console.log('Регенерация резервных кодов 2FA пользователем', req.user?.id);
  regenerateBackupCodes(req, res, next);
});

router.get('/graph-token', middleware.requireJwtAuth, (req, res, next) => {
  console.log('Получение graph токена пользователем', req.user?.id);
  graphTokenController(req, res, next);
});

module.exports = router;
