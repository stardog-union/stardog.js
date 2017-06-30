const { fetch } = require('fetch-ponyfill')();
const FormData = require('form-data');
const qs = require('querystring');
const flat = require('flat');

const DB_OPTIONS = require('./dbopts');
const { httpMessage, httpBody } = require('./response-transforms');

const dbOptions = (conn, options, body) => {
  options.headers.append('Content-Type', 'application/json');
  return fetch(conn.uri('admin', 'databases', options.database, 'options'), {
    method: options.method,
    headers: options.headers,
    body: JSON.stringify(flat(body)),
  });
};

const create = (conn, database, databaseOptions, options, params) => {
  const headers = conn.headers();
  const dbOptions = flat(databaseOptions);

  const body = new FormData();
  body.append(
    'root',
    JSON.stringify({
      dbname: database,
      options: dbOptions,
      files: options.files,
    })
  );

  return fetch(conn.uri('admin', 'databases'), {
    method: 'POST',
    headers,
    body,
    credentials: 'include',
  }).then(httpMessage);
};

const drop = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'databases', database), {
    method: 'DELETE',
    headers,
  }).then(httpMessage);
};

const get = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.uri(database), {
    headers,
  }).then(httpBody);
};

const getOptions = (conn, database, params) => {
  const headers = conn.headers();
  return dbOptions(
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
          result: flat.unflatten(res.result),
        });
      }
      return res;
    });
};

const setOptions = (conn, database, databaseOptions, params) => {
  const headers = conn.headers();
  return dbOptions(
    conn,
    {
      headers,
      database,
      method: 'POST',
    },
    databaseOptions
  ).then(httpMessage);
};

const offline = (conn, database, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');
  return fetch(conn.uri('admin', 'databases', database, 'offline'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const online = (conn, database, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');
  return fetch(conn.uri('admin', 'databases', database, 'online'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const optimize = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'databases', database, 'optimize'), {
    method: 'PUT',
    headers,
  }).then(httpMessage);
};

const copy = (conn, database, destination, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');
  const resource = `${conn.uri(
    'admin',
    'databases',
    database,
    'copy'
  )}?${qs.stringify({ to: destination })}`;
  return fetch(resource, {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const list = (conn, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');
  return fetch(conn.uri('admin', 'databases'), {
    headers,
  }).then(httpBody);
};

module.exports = {
  create,
  drop,
  get,
  getOptions,
  setOptions,
  offline,
  online,
  optimize,
  copy,
  list,
};
