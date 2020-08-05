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

const submitSchema = (
  conn,
  database,
  name,
  schema,
  params = {},
  method = 'POST'
) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/graphql');

  return fetch(conn.request(database, 'graphql', 'schemas', name), {
    method,
    body: schema,
    headers,
  }).then(httpBody);
};
const addSchema = (conn, database, name, schema, params) =>
  submitSchema(conn, database, name, schema, params, 'POST').then(
    addResponse => {
      if (addResponse.status === 405 /* Method Not Supported */) {
        // Stardog <= 7.1.2 had the wrong method for addSchema; use it to retain
        // backwards compatibility.
        return submitSchema(conn, database, name, schema, params, 'PUT');
      }
      return addResponse;
    }
  );
const updateSchema = (conn, database, name, schema, params) =>
  submitSchema(conn, database, name, schema, params, 'PUT');

module.exports = {
  execute,
  listSchemas,
  addSchema,
  updateSchema,
  getSchema,
  removeSchema,
  clearSchemas,
};
