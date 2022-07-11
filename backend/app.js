const express = require('express');
const bodyParser = require('body-parser');
const process = require('process');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { celebrate, Joi, errors } = require('celebrate');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const { createUser, login, signout } = require('./controllers/users');
const auth = require('./middlewares/auth');
const handleErrors = require('./middlewares/handleErrors');

const { PORT = 3001 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const options = {
  origin: [
    'https://localhost:3000',
    'http://localhost:3000',
    'http://vik163.student.nomoredomains.sbs',
    'https://vik163.student.nomoredomains.sbs',
  ],
  credentials: true, // эта опция позволяет устанавливать куки
};

app.use('*', cors(options));

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/(https?:\W{2}[www]?\W?([2-domains]|[-?\w+]+)[\Wru]([\W\w{2,}]?)*\W?.+#?)/),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), login);

app.get('/signout', signout);

app.use(cookieParser());
app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', (req, res, next) => {
  Promise.reject(new Error('Некорректный путь'))
    .catch((err) => next(err));
});

app.use(errorLogger);

app.use(errors());
app.use(handleErrors);

// eslint-disable-next-line consistent-return
app.use((err, req, res, next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  console.error(err.stack);

  res.status(500).send({ message: 'Что-то пошло не так' });

  next();
});

app.listen(PORT, () => {
});
