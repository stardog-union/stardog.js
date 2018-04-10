const { fetch } = require('../fetch');

const { httpBody } = require('../response-transforms');

const execute = (conn, database, query, variables = {}, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request(database, 'graphql'), {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers,
  }).then(httpBody);
};

const listSchemas = (conn, database, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request(database, 'graphql', 'schemas'), {
    headers,
  }).then(httpBody);
};

const addSchema = (conn, database, name, schema, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/graphql');

  return fetch(conn.request(database, 'graphql', 'schemas', name), {
    method: 'PUT',
    body: schema,
    headers,
  }).then(httpBody);
};

const getSchema = (conn, database, name, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request(database, 'graphql', 'schemas', name), {
    headers,
  }).then(httpBody);
};

const removeSchema = (conn, database, name, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request(database, 'graphql', 'schemas', name), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const clearSchemas = (conn, database, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request(database, 'graphql', 'schemas'), {
    method: 'DELETE',
    headers,
  });
};

module.exports = {
  execute,
  listSchemas,
  addSchema,
  getSchema,
  removeSchema,
  clearSchemas,
};
