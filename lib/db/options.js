const { fetch } = require('../fetch');
const flat = require('flat');

const DB_OPTIONS = require('./dbopts');
const { httpBody } = require('../response-transforms');

const dispatchDBOptions = (conn, config, body) => {
  config.headers.set('Content-Type', 'application/json');
  return fetch(conn.uri('admin', 'databases', config.database, 'options'), {
    method: config.method,
    headers: config.headers,
    body: JSON.stringify(flat(body)),
  });
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

module.exports = { get, set };
