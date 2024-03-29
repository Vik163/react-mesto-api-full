import React, { useState, useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import Login from './Login.js';
import Register from './Register.js';
import Header from './Header.js';
import Footer from './Footer.js';
import Main from './Main.js';
import AddPlacePopup from './AddPlacePopup.js';
import PopupWithForm from './PopupWithForm.js';
import ImagePopup from './ImagePopup.js';
import EditProfilePopup from './EditProfilePopup.js';
import EditAvatarPopup from './EditAvatarPopup.js';
import InfoTooltip from './InfoTooltip.js';
import ProtectedRoute from './ProtectedRoute';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { api } from './../utils/api.js';
import { auth } from '../utils/auth.js';

function App() {
  const [currentUser, setCurrentUser] = useState({});
  const history = useHistory();
  const [logInfo, setLogInfo] = useState({
    id: '',
    email: '',
  });

  const [loggedIn, setLoggedIn] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isAddInfoTooltip, setIsAddInfoTooltip] = useState(false);
  const [isSign, setIsSign] = useState(false);
  const [messageInfoTooltip, setMessageInfoTooltip] = useState('');
  const [isAddConfirmPopupOpen, setIsAddConfirmPopupOpen] = useState(false);
  const [valueSubmit, setValueSubmit] = useState('Сохранить');
  const [valueSubmitDeleteCard, setValueSubmitDeleteCard] = useState('Да');
  const [selectedCard, setSelectedCard] = useState({});
  const [cardDelete, setCardDelete] = useState({});
  const [cards, setCards] = useState([]);

  // Проверка авторизации ----------------------
  const checkToken = () => {
    const jwt = localStorage.getItem('jwt');

    if (jwt) {
      auth
        .checkToken(jwt)
        .then((res) => {
          if (res) {
            setLogInfo({
              id: res._id,
              email: res.email,
            });
            setLoggedIn(true);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    checkToken();
  }, []);

  // Перенаправление авторизованного пользователя
  useEffect(() => {
    if (loggedIn) {
      history.push('/');
    }
  }, [loggedIn]);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');

    if (jwt) {
      Promise.all([api.getUserInfo(), api.getInitialCards()])
        .then(([userData, cards]) => {
          setCurrentUser(userData);
          setCards(cards);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  // Регистрация пользователя ----------------------------
  function handleRegister({ password, email }) {
    return auth
      .registration(password, email)
      .then((res) => {
        if (res) {
          // Попап подтверждения регистрации ----------------------
          setMessageInfoTooltip('Вы успешно зарегистрировались!');
          setIsSign(true);

          history.push('/sign-in');
        }
      })
      .catch((err) => {
        console.log(err);
        setMessageInfoTooltip('Что-то пошло не так! Попробуйте ещё раз.');
        setIsSign(false);
      })
      .finally(() => {
        setIsAddInfoTooltip(true); // Попап подтверждения регистрации
      });
  }

  // Вход пользователя -----------------------------
  function handleLogin({ password, email }) {
    return auth
      .authorization(password, email)
      .then((data) => {
        if (data.token) {
          localStorage.setItem('jwt', data.token);
          checkToken();
          setCurrentUser(data.user);
          api.getInitialCards().then((cards) => {
            setCards(cards);
          });
          history.push('/');
        }
      })
      .catch((err) => console.log(err));
  }

  // Выход пользователя -------------------
  function signOut() {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
    setLogInfo({
      id: null,
      email: null,
    });
    history.push('/sign-in');
  }

  // Добавить карту -------------------------------
  function handleAddPlaceSubmit(obj, clearInput) {
    setValueSubmit('Сохранение...'); // Прелоадер
    api
      .addCard(obj)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
        clearInput();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setValueSubmit('Сохранить');
      });
  }

  // Удаление карты -----------------------------
  function handleCardDelete(e) {
    e.preventDefault();

    setValueSubmitDeleteCard('Сохранение...');
    api
      .deleteCard(cardDelete)
      .then(() => {
        // Удаление выбранной карты ------------------------------------------
        setCards((state) => state.filter((c) => !(c._id === cardDelete._id)));
        // -------------------------------------------------------------------
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setValueSubmitDeleteCard('Да');
      });
  }

  // Попап с подтверждением удаления карты
  function onConfirmDelete(card) {
    setIsAddConfirmPopupOpen(true);
    setCardDelete(card);
  }

  // Обновление данных пользователя ----------
  function handleUpdateUser(obj) {
    setValueSubmit('Сохранение...');

    api
      .sendInfoProfile(obj)
      .then((result) => {
        setCurrentUser(result);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setValueSubmit('Сохранить');
      });
  }

  // Переключение лайков ------------------------------------------
  function handleCardLike(card) {
    // Выбор запроса в зависимости от состояния лайка карты
    const isLiked = card.likes.some((i) => i === currentUser._id);
    const action = isLiked ? api.deleteLike(card) : api.addLikes(card);
    action
      .then((result) => {
        setCards((state) =>
          // Отображение лайков ----------------------------------
          state.map((c) => (c._id === card._id ? result : c))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Обновление аватара ----------------------------------
  function handleUpdateAvatar(avatar, clearInput) {
    setValueSubmit('Сохранение...');
    api
      .addAvatar(avatar)
      .then((result) => {
        setCurrentUser(result);
        closeAllPopups();
        clearInput();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setValueSubmit('Сохранить');
      });
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({});
    setIsAddConfirmPopupOpen(false);
    setIsAddInfoTooltip(false);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className='page'>
        <Switch>
          <Route path='/sign-up'>
            <InfoTooltip
              sign={isSign}
              isOpen={isAddInfoTooltip}
              onClose={closeAllPopups}
              text={messageInfoTooltip}
            />
            <Header
              infoLink='Войти'
              link='/sign-in'
              signOut={null}
              email={null}
            />
            <Register handleRegister={handleRegister} />
          </Route>
          <Route path='/sign-in'>
            <InfoTooltip
              sign={isSign}
              isOpen={isAddInfoTooltip}
              onClose={closeAllPopups}
              text={messageInfoTooltip}
            />
            <Header
              infoLink='Регистрация'
              link='/sign-up'
              signOut={null}
              email={null}
            />
            <Login handleLogin={handleLogin} />
          </Route>
          {/* Защита от незарегистрированных пользователей */}
          <ProtectedRoute exact path='/' loggedIn={loggedIn}>
            <Header
              infoLink='Выйти'
              signOut={signOut}
              link='/sign-in'
              email={logInfo.email}
            />
            <Main
              onEditAvatar={handleEditAvatarClick}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onImagePopup={handleCardClick}
              onCardLike={handleCardLike}
              onCardDelete={onConfirmDelete}
              cards={cards}
            />
            <Footer />
            <section className='popups' tabIndex='0'>
              <EditAvatarPopup
                isOpen={isEditAvatarPopupOpen}
                onClose={closeAllPopups}
                onUpdateAvatar={handleUpdateAvatar}
                text={valueSubmit}
              />
              <EditProfilePopup
                isOpen={isEditProfilePopupOpen}
                onClose={closeAllPopups}
                onUpdateUser={handleUpdateUser}
                text={valueSubmit}
              />
              <AddPlacePopup
                isOpen={isAddPlacePopupOpen}
                onClose={closeAllPopups}
                onAddPlace={handleAddPlaceSubmit}
                text={valueSubmit}
              />

              <PopupWithForm
                name='delete-card'
                title='Вы уверены?'
                text={valueSubmitDeleteCard}
                isOpen={isAddConfirmPopupOpen}
                onClose={closeAllPopups}
                onSubmit={handleCardDelete}
              ></PopupWithForm>
              <ImagePopup
                name='image'
                card={selectedCard}
                onClose={closeAllPopups}
              />
            </section>
          </ProtectedRoute>
        </Switch>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
