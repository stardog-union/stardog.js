const { httpBody } = require('./response-transforms');
const { encodeQueryString } = require('./utils');

const add = (conn, functions, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request('admin', 'functions', 'stored'), {
    method: 'POST',
    body: functions,
    headers,
  }).then(httpBody);
};

const get = (conn, name, params = {}) => {
  const headers = conn.headers();

  return fetch(
    conn.request('admin', 'functions', `stored${encodeQueryString({ name })}`),
    {
      headers,
    }
  ).then(httpBody);
};

const remove = (conn, name, params = {}) => {
  const headers = conn.headers();

  return fetch(
    conn.request('admin', 'functions', `stored${encodeQueryString({ name })}`),
    {
      method: 'DELETE',
      headers,
    }
  );
};

const clear = (conn, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request('admin', 'functions', 'stored'), {
    method: 'DELETE',
    headers,
  });
};

const getAll = (conn, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request('admin', 'functions', 'stored'), {
    headers,
  }).then(httpBody);
};

module.exports = {
  add,
  get,
  remove,
  clear,
  getAll,
};
