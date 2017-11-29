const { fetch } = require('../fetch');
const qs = require('querystring');
const { httpBody } = require('../response-transforms');

const doGet = (
  conn,
  database,
  graphUri = null,
  accept = 'application/ld+json',
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Accept', accept);
  const uri = `${conn.uri(database)}?${graphUri
    ? qs.stringify({ graph: graphUri })
    : 'default'}`;

  return fetch(uri, {
    headers,
  }).then(httpBody);
};

const doDelete = (conn, database, graphUri = null, params = {}) => {
  const headers = conn.headers();
  const uri = `${conn.uri(database)}?${graphUri
    ? qs.stringify({ graph: graphUri })
    : 'default'}`;

  return fetch(uri, {
    headers,
    method: 'DELETE',
  }).then(httpBody);
};

const doPut = (
  conn,
  database,
  graphData,
  graphUri = null,
  contentType = 'application/ld+json',
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', contentType);
  const uri = `${conn.uri(database)}?${graphUri
    ? qs.stringify({ graph: graphUri })
    : 'default'}`;

  return fetch(uri, {
    headers,
    method: 'PUT',
    body: graphData,
  }).then(httpBody);
};

const doPost = (
  conn,
  database,
  graphData,
  graphUri = null,
  contentType = 'application/ld+json',
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', contentType);
  const uri = `${conn.uri(database)}?${graphUri
    ? qs.stringify({ graph: graphUri })
    : 'default'}`;

  return fetch(uri, {
    headers,
    method: 'POST',
    body: graphData,
  }).then(httpBody);
};

module.exports = { doGet, doPut, doPost, doDelete };
