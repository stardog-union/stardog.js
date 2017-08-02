const { fetch } = require('../fetch');
const lodashGet = require('lodash/get');
const qs = require('querystring');

const { httpBody } = require('../response-transforms');
const { mimeType, buildQuery, queryType } = require('./utils');

const dispatchQuery = (conn, config, params) => {
  const headers = conn.headers();
  headers.append('Accept', config.accept);
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(config.query, params);

  return fetch(conn.uri(config.database, config.resource), {
    method: 'POST',
    body: qs.stringify(body),
    headers,
  }).then(httpBody);
};

const execute = (conn, database, query, params) => {
  const type = queryType(query);
  return dispatchQuery(
    conn,
    {
      database,
      query,
      accept: mimeType(query),
      resource: type === 'update' ? 'update' : 'query',
    },
    params
  );
};

const executeInTransaction = (conn, database, transactionId, query, params) => {
  const headers = conn.headers();
  headers.append('Accept', mimeType(query));
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(query, params);

  return fetch(conn.uri(database, transactionId, 'query'), {
    method: 'POST',
    headers,
    body: qs.stringify(body),
  }).then(httpBody);
};

const property = (conn, database, options, params) =>
  execute(
    conn,
    database,
    `select * where {
      ${options.uri} ${options.property} ?val
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
  headers.append('Accept', 'text/plain');
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(query, params);
  return fetch(conn.uri(database, 'explain'), {
    method: 'POST',
    headers,
    body: qs.stringify(body),
  }).then(httpBody);
};

const list = conn => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');

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
  headers.append('Accept', 'application/json');
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
