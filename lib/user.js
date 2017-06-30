const { fetch } = require('fetch-ponyfill')();
const { httpBody, httpMessage } = require('./response-transforms');

const list = (conn, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'users'), {
    headers,
  }).then(httpBody);
};

const create = (conn, user, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');
  headers.append('Content-Type', 'application/json');

  const body = {
    username: user.username,
    password: user.password.split(''),
    superuser: typeof user.superuser === 'boolean' ? user.superuser : false,
  };

  return fetch(conn.uri('admin', 'users'), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(httpBody);
};

const changePassword = (conn, username, password, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');

  const body = {
    password,
  };

  return fetch(conn.uri('admin', 'users', username, 'pwd'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  }).then(httpMessage);
};

const enabled = (conn, username, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');

  return fetch(conn.uri('admin', 'users', username, 'enabled'), {
    headers,
  }).then(httpBody);
};

const enable = (conn, username, enabled, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'users', username, 'enabled'), {
    method: 'PUT',
    headers,
    body: JSON.stringify({ enabled }),
  });
};

module.exports = {
  list,
  create,
  changePassword,
  enabled,
  enable,
};
