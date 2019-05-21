const { fetch } = require('../fetch');
const flat = require('flat');

const DB_OPTIONS = require('./dbopts');
const { httpBody } = require('../response-transforms');

const dispatchDBOptions = (conn, config, body) => {
  config.headers.set('Content-Type', 'application/json');

  const requestOptions = {
    method: config.method,
    headers: config.headers,
  };

  if (body) {
    requestOptions.body = JSON.stringify(flat(body, { safe: true }));
  }
  return fetch(
    conn.request('admin', 'databases', config.database, 'options'),
    requestOptions
  );
};

const get = (conn, database, params) => {
  const headers = conn.headers();
  return dispatchDBOptions(
    conn,
    {
      headers,
      database,
      method: 'PUT',
    },
    DB_OPTIONS
  )
    .then(httpBody)
    .then(res => {
      if (res.status === 200) {
        return Object.assign({}, res, {
          body: flat.unflatten(res.body),
        });
      }
      return res;
    });
};

const getAll = (conn, database, params) => {
  const headers = conn.headers();
  return dispatchDBOptions(conn, {
    headers,
    database,
    method: 'GET',
  })
    .then(httpBody)
    .then(res => {
      if (res.status === 200) {
        return Object.assign({}, res, {
          body: flat.unflatten(res.body),
        });
      }
      return res;
    });
};

const set = (conn, database, databaseOptions, params) => {
  const headers = conn.headers();
  return dispatchDBOptions(
    conn,
    {
      headers,
      database,
      method: 'POST',
    },
    databaseOptions
  ).then(httpBody);
};

const getDbConfigProperties = (conn, params) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'config_properties'), {
    method: 'GET',
    headers,
  })
    .then(httpBody)
    .then(res => {
      if (res.status === 200) {
        return Object.assign({}, res, {
          body: flat.unflatten(res.body),
        });
      }
      return res;
    });
};

module.exports = { get, getAll, set, getDbConfigProperties };
