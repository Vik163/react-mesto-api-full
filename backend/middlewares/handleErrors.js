const ErrorEmail = require('../errors/errorEmail');
const ErrorAuth = require('../errors/errorAuth');
const ErrorNotFound = require('../errors/notFound');
const ErrorOwnerId = require('../errors/errorOwnerId');

const handleErrors = (err, req, res, next) => {
  const DUPLICATE_ERROR_CODE = 11000;

  if (err.code === DUPLICATE_ERROR_CODE) {
    throw new ErrorEmail('При регистрации указан email, который уже существует на сервере');
  }
  if (err.message === 'Неправильные почта или пароль') {
    throw new ErrorAuth('Неправильные почта или пароль');
  }
  if (err === 'error') {
    throw new ErrorNotFound('Карточка или пользователь не найдены');
  }
  if (err === 'errorOwnerId') {
    throw new ErrorOwnerId('Попытка удалить чужую карточку');
  }
  if (err.message === 'Некорректный путь') {
    throw new ErrorNotFound('Некорректный путь');
  }
  next(err);
};

module.exports = handleErrors;
