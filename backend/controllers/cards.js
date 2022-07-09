const Card = require('../models/card');

function addError(res, card) {
  if ((res.statusCode === 200 && !card)) {
    const err = 'error';
    throw err;
  }
}

module.exports.getCards = (req, res, next) => {
  Card.find()
    .then((cards) => {
      res.send(cards);
    })
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => next(err));
};

module.exports.deleteCard = (req, res, next) => {
  Card.findOne({ _id: req.params.cardId })
    .then((card) => {
      if (!card) {
        addError(res, card);
      }
      return Card.findOneAndRemove({ _id: req.params.cardId, owner: req.user._id })
        .populate('owner')
        .then((cardOwnerId) => {
          if (cardOwnerId === null) {
            const err = 'errorOwnerId';
            throw err;
          }
          res.send(card);
        });
    })
    .catch((err) => next(err));
};

module.exports.addLike = (req, res, next) => {
  Card.findOneAndUpdate(
    { _id: req.params.cardId, owner: req.user._id },
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    {
      new: true,
      runValidators: true,
    },
  )
    .then((card) => {
      addError(res, card);
      res.send(card);
    })
    .catch((err) => next(err));
};

module.exports.deleteLike = (req, res, next) => {
  Card.findOneAndUpdate(
    { _id: req.params.cardId, owner: req.user._id },
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    {
      new: true,
      runValidators: true,
    },
  )
    .then((card) => {
      addError(res, card);
      res.send(card);
    })
    .catch((err) => next(err));
};
