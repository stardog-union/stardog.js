const { fetch } = require('../fetch');
const FormData = require('form-data');
const qs = require('querystring');
const flat = require('flat');
const lodashGet = require('lodash/get');

const { httpBody } = require('../response-transforms');
const { get: getOptions } = require('./options');

const dispatchChange = (conn, config, content, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  headers.set('Content-Type', config.contentType || 'text/plain');
  if (config.encoding) {
    headers.set('Content-Encoding', config.encoding);
  }
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const suffix = `${config.resource}${query.length > 0 ? `?${query}` : ''}`;

  return fetch(conn.request(config.database, config.transactionId, suffix), {
    method: 'POST',
    headers,
    body: content,
  })
    .then(httpBody)
    .then(res =>
      Object.assign({}, res, { transactionId: config.transactionId })
    );
};

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

  return fetch(conn.request('admin', 'databases'), {
    method: 'POST',
    headers,
    body,
  }).then(httpBody);
};

const drop = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'databases', database), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const getDatabase = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.request(database), {
    headers,
  }).then(httpBody);
};

const offline = (conn, database, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases', database, 'offline'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const online = (conn, database, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases', database, 'online'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const optimize = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'databases', database, 'optimize'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const copy = (conn, database, destination, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  const suffix = `copy?${qs.stringify({ to: destination })}`;

  return fetch(conn.request('admin', 'databases', database, suffix), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const list = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases'), {
    headers,
  }).then(httpBody);
};

const size = (conn, database, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  return fetch(conn.request(database, 'size'), {
    headers,
  }).then(httpBody);
};

const clear = (conn, database, transactionId, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const suffix = `clear${query.length > 0 ? `?${query}` : ''}`;

  return fetch(conn.request(database, transactionId, suffix), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then(res => Object.assign({}, res, { transactionId }));
};

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const add = (
  conn,
  database,
  transactionId,
  content,
  options = {},
  params = {}
) =>
  dispatchChange(
    conn,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'add',
      database,
      transactionId,
    },
    content,
    params
  );

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const remove = (
  conn,
  database,
  transactionId,
  content,
  options = {},
  params = {}
) =>
  dispatchChange(
    conn,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'remove',
      database,
      transactionId,
    },
    content,
    params
  );

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
  headers.set('Accept', options.mimetype || 'application/ld+json');

  const queryParams = {
    'graph-uri': params.graphUri || 'tag:stardog:api:context:all',
  };
  const suffix = `export?${qs.stringify(queryParams)}`;

  return fetch(conn.request(database, suffix), {
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
  add,
  remove,
  namespaces,
  exportData,
};
