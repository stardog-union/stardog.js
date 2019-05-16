const { fetch } = require('../fetch');
const lodashPick = require('lodash/pick');
const server = require('../server');
const semver = require('semver');
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

const updateStoredQuery = (conn, storedQuery, params, stardogVersion) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const body = lodashPick(storedQuery, ['name', 'database', 'query', 'shared']);
  body.creator = conn.username;
  body.shared = typeof body.shared === 'boolean' ? body.shared : false;

  const stardogVersionPromise = stardogVersion
    ? Promise(stardogVersion)
    : server
        .status(conn, { databases: false })
        .then(statusRes => statusRes.body['dbms.version'].value);
  return stardogVersionPromise.then(version => {
    if (semver.gte(version, '6.2.0')) {
      return fetch(conn.request('admin', 'queries', 'stored'), {
        headers,
        method: 'PUT',
        body: JSON.stringify(body),
      }).then(httpBody);
    }
    return deleteStoredQuery(conn, storedQuery.name)
      .then(() => create(conn, storedQuery, params))
      .catch(deleteResponse => {
        //  Update creates when the query did not already exist
        if (deleteResponse.status === 404) {
          return create(conn, storedQuery, params);
        }
        return deleteResponse;
      });
  });
};

module.exports = {
  create,
  list,
  update: updateStoredQuery,
  remove: deleteStoredQuery,
};
