const { fetch } = require('../fetch');
const lodashGet = require('lodash/get');
const qs = require('querystring');

const { httpBody } = require('../response-transforms');
const { mimeType, queryType } = require('./utils');

const dispatchQuery = (conn, config, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', options.accept || config.accept);
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const queryString = qs.stringify(params);

  const uri =
    conn.uri(config.database, config.resource) +
    (queryString.length > 0 ? `?${queryString}` : '');

  return fetch(uri, {
    method: 'POST',
    body: qs.stringify({ query: config.query }),
    headers,
  }).then(httpBody);
};

const execute = (conn, database, query, options, params) => {
  const type = queryType(query);
  return dispatchQuery(
    conn,
    {
      database,
      query,
      accept: mimeType(query),
      resource: type === 'update' ? 'update' : 'query',
    },
    options,
    params
  );
};

const executeInTransaction = (
  conn,
  database,
  transactionId,
  query,
  options = {},
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Accept', options.accept || mimeType(query));
  headers.set('Content-Type', 'application/x-www-form-urlencoded');
  const queryString = qs.stringify(params);

  const uri =
    conn.uri(database, transactionId, 'query') +
    (queryString.length > 0 ? `?${queryString}` : '');

  return fetch(uri, {
    method: 'POST',
    headers,
    body: qs.stringify({ query }),
  })
    .then(httpBody)
    .then(res => Object.assign({}, res, { transactionId }));
};

const property = (conn, database, config, params) =>
  execute(
    conn,
    database,
    `select * where {
      ${config.uri} ${config.property} ?val
    }
    `,
    params
  ).then(res => {
    const values = lodashGet(res, 'body.results.bindings', []);
    if (values.length > 0) {
      return Object.assign({}, res, {
        body: values[0].val.value,
      });
    }
    return res;
  });

const explain = (conn, database, query, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const queryString = qs.stringify(params);
  const uri =
    conn.uri(database, 'explain') +
    (queryString.length > 0 ? `?${queryString}` : '');

  return fetch(uri, {
    method: 'POST',
    headers,
    body: qs.stringify({ query }),
  }).then(httpBody);
};

const list = conn => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.uri('admin', 'queries'), {
    headers,
  }).then(httpBody);
};

const kill = (conn, queryId) => {
  const headers = conn.headers();

  return fetch(conn.uri('admin', 'queries', queryId), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const get = (conn, queryId) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.uri('admin', 'queries', queryId), {
    headers,
  }).then(httpBody);
};

module.exports = {
  execute,
  executeInTransaction,
  property,
  list,
  kill,
  get,
  explain,
};
