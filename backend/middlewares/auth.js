require('dotenv').config();

const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Error('Неправильные почта или пароль');
  }
  // Удаляю Bearer ----------------------------------
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    // верифицирую токен ----------------------
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(err);
  }

  req.user = payload;

  next();
};
