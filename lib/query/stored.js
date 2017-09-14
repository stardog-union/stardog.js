const { fetch } = require('../fetch');
const lodashPick = require('lodash/pick');

const { httpBody } = require('../response-transforms');

/*
  body
    - name string
    - database string or "*"
    - query
    - shared boolean (defaults to false)
*/
const create = (conn, storedQuery, params) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const body = lodashPick(storedQuery, ['name', 'database', 'query', 'shared']);
  body.creator = conn.username;
  body.shared = typeof body.shared === 'boolean' ? body.shared : false;

  return fetch(conn.uri('admin', 'queries', 'stored'), {
    headers,
    method: 'POST',
    body: JSON.stringify(body),
  }).then(httpBody);
};

const list = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.uri('admin', 'queries', 'stored'), {
    headers,
  }).then(httpBody);
};

const deleteStoredQuery = (conn, storedQuery, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.uri('admin', 'queries', 'stored', storedQuery), {
    headers,
    method: 'DELETE',
  }).then(httpBody);
};

module.exports = {
  create,
  list,
  remove: deleteStoredQuery,
};
