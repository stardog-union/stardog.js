const { fetch } = require('../fetch');
const qs = require('querystring');

const { httpBody } = require('../response-transforms');

const get = (conn, database, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/ld+json');

  return fetch(conn.uri(database, 'icv'), {
    headers,
  }).then(httpBody);
};

const add = (conn, database, icvAxioms, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');

  return fetch(conn.uri(database, 'icv', 'add'), {
    method: 'POST',
    body: icvAxioms,
    headers,
  }).then(httpBody);
};

const remove = (conn, database, icvAxioms, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');

  return fetch(conn.uri(database, 'icv', 'remove'), {
    method: 'POST',
    body: icvAxioms,
    headers,
  }).then(httpBody);
};

const clear = (conn, database, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.uri(database, 'icv', 'clear'), {
    method: 'POST',
    headers,
  }).then(httpBody);
};

const convert = (conn, database, icvAxiom, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const uri = `${conn.uri(database, 'icv', 'convert')}${query.length > 0
    ? `?${query}`
    : ''}`;

  return fetch(uri, {
    method: 'POST',
    body: icvAxiom,
    headers,
  }).then(httpBody);
};

const validate = (conn, database, constraints, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', 'text/boolean');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const uri = `${conn.uri(database, 'icv', 'validate')}${query.length > 0
    ? `?${query}`
    : ''}`;

  return fetch(uri, {
    method: 'POST',
    body: constraints,
    headers,
  }).then(httpBody);
};

const validateInTx = (
  conn,
  database,
  transactionId,
  constraints,
  options = {},
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', 'text/boolean');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const uri = `${conn.uri(
    database,
    'icv',
    transactionId,
    'validate'
  )}${query.length > 0 ? `?${query}` : ''}`;

  return fetch(uri, {
    method: 'POST',
    body: constraints,
    headers,
  }).then(httpBody);
};

const violations = (conn, database, constraints, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', '*/*');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const uri = `${conn.uri(database, 'icv', 'violations')}${query.length > 0
    ? `?${query}`
    : ''}`;

  return fetch(uri, {
    method: 'POST',
    body: constraints,
    headers,
  }).then(httpBody);
};

const violationsInTx = (
  conn,
  database,
  transactionId,
  constraints,
  options = {},
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', '*/*');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const uri = `${conn.uri(
    database,
    'icv',
    transactionId,
    'violations'
  )}${query.length > 0 ? `?${query}` : ''}`;

  return fetch(uri, {
    method: 'POST',
    body: constraints,
    headers,
  }).then(httpBody);
};

module.exports = {
  add,
  remove,
  get,
  clear,
  convert,
  validate,
  validateInTx,
  violations,
  violationsInTx,
};
