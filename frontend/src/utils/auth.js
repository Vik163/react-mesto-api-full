class Auth {
  constructor(settings) {
    this._settings = settings;
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }
    throw new Error(`Ошибка: ${res.statusText}`);
  }

  registration(password, email) {
    return fetch(`${this._settings.baseUrl}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({
        password: password,
        email: email,
      }),
    }).then(this._checkResponse);
  }

  authorization(password, email) {
    return fetch(`${this._settings.baseUrl}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({
        password: password,
        email: email,
      }),
    }).then(this._checkResponse);
  }

  checkToken(jwt) {
    return fetch(`${this._settings.baseUrl}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${jwt}`,
      },
      credentials: 'include',
    }).then(this._checkResponse);
  }
}

export const auth = new Auth({
  baseUrl: "http://localhost:3001",
  // baseUrl: "https://auth.nomoreparties.co",
  headers: {
    "Content-Type": "application/json",
  },
});
