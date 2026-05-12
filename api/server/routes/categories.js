const express = require('express');
const router = express.Router();
const { requireJwtAuth } = require('~/server/middleware');
const { getCategories } = require('~/models');

router.get('/', requireJwtAuth, async (req, res) => {
  try {
    console.log('Получение категорий пользователем', req.user.id);
    const categories = await getCategories();
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send({ message: 'Failed to retrieve categories', error: error.message });
  }
});

module.exports = router;
