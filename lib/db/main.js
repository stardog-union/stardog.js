const { fetch } = require('fetch-ponyfill')();
const FormData = require('form-data');
const qs = require('querystring');
const flat = require('flat');
const lodashGet = require('lodash/get');

const { httpMessage, httpBody } = require('../response-transforms');
const { get: getOptions } = require('./options');

const create = (conn, database, databaseOptions = {}, options = {}, params) => {
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

const getDatabase = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.uri(database), {
    headers,
  }).then(httpBody);
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

const size = (conn, database, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'text/plain');
  return fetch(conn.uri(database, 'size'), {
    headers,
  }).then(httpBody);
};

const clear = (conn, database, transactionId, params = {}) => {
  const headers = conn.headers();
  headers.append('Accept', 'text/plain');
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const uri =
    conn.uri(database, transactionId, 'clear') +
    (query.length > 0 ? `?${query}` : '');
  return fetch(uri, {
    method: 'POST',
    headers,
  })
    .then(httpMessage)
    .then(res => Object.assign({}, res, { transactionId }));
};

const namespaces = (conn, database, params) =>
  getOptions(conn, database, params).then(res => {
    if (res.status === 200) {
      const n = lodashGet(res, 'body.database.namespaces', []);
      const names = n.reduce((memo, val) => {
        const [key, value] = val.split('=');
        return Object.assign({}, memo, { [key]: value });
      }, {});
      res.body = names;
    }
    return res;
  });

// options
//  mimeType
// params
//  graphUri
const exportData = (conn, database, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.append('Accept', options.mimetype || 'application/ld+json');

  const queryParams = {
    'graph-uri': params.graphUri || 'tag:stardog:api:context:all',
  };

  const uri = `${conn.uri(database, 'export')}?${qs.stringify(queryParams)}`;
  return fetch(uri, {
    headers,
  }).then(httpBody);
};

module.exports = {
  create,
  drop,
  get: getDatabase,
  offline,
  online,
  optimize,
  copy,
  list,
  size,
  clear,
  namespaces,
  exportData,
};
