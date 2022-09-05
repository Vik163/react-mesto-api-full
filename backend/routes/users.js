const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers,
  doesUserExist,
  getCurrentUser,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/', getUsers);

// Получить текущего пользователя
router.get('/me', getCurrentUser);

// Валидация - библиотека celebrate

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24),
  }),
}), doesUserExist);

// Обновить пользователя -------------------------
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

// Обновить аватар -------------------------
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(/(https?:\W{2}[www]?\W?([2-domains]|[-?\w+]+)[\Wru]([\W\w{2,}]?)*\W?.+#?)/),
  }),
}), updateUserAvatar);

module.exports = router;
