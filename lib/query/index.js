const { fetch } = require('fetch-ponyfill')();
const lodashGet = require('lodash/get');
const qs = require('querystring');

const { httpBody, httpMessage } = require('../response-transforms');
const { queryType, mimeType, buildQuery } = require('./utils');

const dispatchQuery = (conn, config, params) => {
  const headers = conn.headers();
  headers.append('Accept', config.mimeType);
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(config.query, params);

  return fetch(conn.uri(config.database, 'query'), {
    method: 'POST',
    body: qs.stringify(body),
    headers,
  }).then(httpBody);
};

const execute = (conn, database, query, params) =>
  dispatchQuery(
    conn,
    {
      database,
      query,
      mimeType: mimeType(query),
    },
    params
  );

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

const turtle = (conn, database, query, params) => {
  const valid = ['describe', 'construct'];
  const type = queryType(query);

  if (valid.includes(type)) {
    return dispatchQuery(
      conn,
      {
        mimeType: 'text/turtle',
        query,
        database,
      },
      params
    );
  }
  throw TypeError(
    `${type} can not be used with turtle(). Use execute() instead.`
  );
};

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
  }).then(httpMessage);
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
  property,
  list,
  kill,
  get,
  turtle,
  explain,
};
