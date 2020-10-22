const { fetch } = require('../fetch');
const qs = require('querystring');
const { httpBody } = require('../response-transforms');

const execute = (
  conn,
  database,
  query,
  variables = {},
  params = {},
  additionalHandlers = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');

  const queryString = qs.stringify(params);

  const suffix = `graphql${queryString.length > 0 ? `?${queryString}` : ''}`;

  return fetch(conn.request(database, suffix), {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers,
  }).then(res => {
    const shouldContinue = !additionalHandlers.onResponseStart
      ? true
      : additionalHandlers.onResponseStart(res);

    if (shouldContinue === false) {
      return res;
    }

    return httpBody(res);
  });
};

const listSchemas = (conn, database, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request(database, 'graphql', 'schemas'), {
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

const getSchema = (conn, database, name, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request(database, 'graphql', 'schemas', name), {
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

module.exports = {
  execute,
  listSchemas,
  addSchema,
  getSchema,
  removeSchema,
  clearSchemas,
};
