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
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Accept', 'application/json');

  const body = lodashPick(storedQuery, [
    'name',
    'database',
    'query',
    'shared',
    'reasoning',
    'description',
  ]);
  body.creator = conn.username;
  body.shared = typeof body.shared === 'boolean' ? body.shared : false;

  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
    method: 'POST',
    body: JSON.stringify(body),
  }).then(httpBody);
};

const list = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
  }).then(httpBody);
};

const deleteStoredQuery = (conn, storedQuery, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'queries', 'stored', storedQuery), {
    headers,
    method: 'DELETE',
  }).then(httpBody);
};

const renameStoredQuery = (conn, name, newName) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Accept', 'application/json');

  const body = { name: newName };
  return fetch(conn.request('admin', 'queries', 'stored', name), {
    headers,
    method: 'POST',
    body: JSON.stringify(body),
  }).then(httpBody);
};

const replace = (conn, storedQuery, params) =>
  deleteStoredQuery(conn, storedQuery.name).then(deleteResponse => {
    //  Update creates when the query did not already exist
    if (deleteResponse.status === 404 || deleteResponse.ok) {
      return create(conn, storedQuery, params);
    }
    return deleteResponse;
  });

const updateStoredQuery = (
  conn,
  storedQuery,
  params,
  useUpdateMethod = true
) => {
  if (!useUpdateMethod) {
    return replace(conn, storedQuery, params);
  }
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Accept', 'application/json');

  const body = lodashPick(storedQuery, [
    'name',
    'database',
    'query',
    'shared',
    'reasoning',
    'description',
  ]);
  body.creator = conn.username;
  body.shared = typeof body.shared === 'boolean' ? body.shared : false;
  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
    method: 'PUT',
    body: JSON.stringify(body),
  })
    .then(httpBody)
    .then(updateResponse => {
      if (updateResponse.status === 405) {
        return replace(conn, storedQuery, params);
      }
      return updateResponse;
    });
};

module.exports = {
  create,
  list,
  remove: deleteStoredQuery,
  rename: renameStoredQuery,
  update: updateStoredQuery,
};
