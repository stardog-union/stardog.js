const { httpBody } = require('../response-transforms');
const { encodeQueryString } = require('../utils');

const doGet = (
  conn,
  database,
  graphUri = null,
  accept = 'application/ld+json',
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Accept', accept);

  const queryString = graphUri
    ? encodeQueryString({ graph: graphUri })
    : '?default';

  return fetch(conn.request(`${database}${queryString}`), {
    headers,
  }).then(httpBody);
};

const doDelete = (conn, database, graphUri = null, params = {}) => {
  const headers = conn.headers();
  const queryString = graphUri
    ? encodeQueryString({ graph: graphUri })
    : '?default';

  return fetch(conn.request(`${database}${queryString}`), {
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

  const queryString = graphUri
    ? encodeQueryString({ graph: graphUri })
    : '?default';

  return fetch(conn.request(`${database}${queryString}`), {
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

  const queryString = graphUri
    ? encodeQueryString({ graph: graphUri })
    : '?default';

  return fetch(conn.request(`${database}${queryString}`), {
    headers,
    method: 'POST',
    body: graphData,
  }).then(httpBody);
};

module.exports = { doGet, doPut, doPost, doDelete };
