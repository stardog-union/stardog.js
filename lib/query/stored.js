const { fetch } = require('../fetch');
const { httpBody } = require('../response-transforms');

const CONTENT_TYPE_JSON = 'application/json';

const getBody = (conn, storedQuery, options) => {
  if (!options.contentType || options.contentType === CONTENT_TYPE_JSON) {
    const body = Object.assign({}, storedQuery);
    body.creator = conn.username;
    body.shared = typeof body.shared === 'boolean' ? body.shared : false;
    return body;
  }
  // pass storedQuery through
  return storedQuery;
};

/*
  body
    - name string
    - database string or "*"
    - query
    - shared boolean (defaults to false)
*/
const create = (conn, storedQuery, options = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || CONTENT_TYPE_JSON);
  headers.set('Accept', options.accept || CONTENT_TYPE_JSON);

  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
    method: 'POST',
    body: JSON.stringify(getBody(conn, storedQuery, options)),
  }).then(httpBody);
};

const list = (conn, options = {}) => {
  const headers = conn.headers();
  headers.set('Accept', options.accept || CONTENT_TYPE_JSON);

  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
  }).then(httpBody);
};

const deleteStoredQuery = (conn, storedQuery) => {
  const headers = conn.headers();
  headers.set('Accept', CONTENT_TYPE_JSON);

  return fetch(conn.request('admin', 'queries', 'stored', storedQuery), {
    headers,
    method: 'DELETE',
  }).then(httpBody);
};

const renameStoredQuery = (conn, name, newName) => {
  const headers = conn.headers();
  headers.set('Content-Type', CONTENT_TYPE_JSON);
  headers.set('Accept', CONTENT_TYPE_JSON);

  const body = { name: newName };
  return fetch(conn.request('admin', 'queries', 'stored', name), {
    headers,
    method: 'POST',
    body: JSON.stringify(body),
  }).then(httpBody);
};

const replace = (conn, storedQuery) =>
  deleteStoredQuery(conn, storedQuery.name).then(deleteResponse => {
    //  Update creates when the query did not already exist
    if (deleteResponse.status === 404 || deleteResponse.ok) {
      return create(conn, storedQuery);
    }
    return deleteResponse;
  });

const updateStoredQuery = (
  conn,
  storedQuery,
  options = {},
  useUpdateMethod = true
) => {
  if (!useUpdateMethod) {
    return replace(conn, storedQuery);
  }
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || CONTENT_TYPE_JSON);
  headers.set('Accept', options.accept || CONTENT_TYPE_JSON);

  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
    method: 'PUT',
    body: JSON.stringify(getBody(conn, storedQuery, options)),
  })
    .then(httpBody)
    .then(updateResponse => {
      if (updateResponse.status === 405) {
        return replace(conn, storedQuery);
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
