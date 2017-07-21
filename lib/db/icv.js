const { fetch } = require('../fetch');
const qs = require('querystring');

const { httpBody } = require('../response-transforms');

const get = (conn, database, options, params = {}) => {
  const headers = conn.headers();
  headers.append('Accept', 'text/plain');

  return fetch(conn.uri(database, 'icv'), {
    headers,
  }).then(httpBody);
};

const set = (conn, database, icvAxioms, options, params = {}) => {
  const headers = conn.headers();
  headers.append('Content-Type', options.contentType || 'text/plain');

  return fetch(conn.uri(database, 'icv', 'add'), {
    method: 'POST',
    body: icvAxioms,
    headers,
  }).then(httpBody);
};

const clear = (conn, database, options, params = {}) => {
  const headers = conn.headers();
  headers.append('Content-Type', 'application/json');

  return fetch(conn.uri(database, 'icv', 'clear'), {
    method: 'POST',
    headers,
  }).then(httpBody);
};

const convert = (conn, database, icvAxiom, options, params = {}) => {
  const headers = conn.headers();
  headers.append('Content-Type', options.contentType || 'text/plain');

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

module.exports = {
  set,
  get,
  clear,
  convert,
};
