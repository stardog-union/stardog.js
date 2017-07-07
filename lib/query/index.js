const { fetch } = require('fetch-ponyfill')();
const _ = require('lodash');
const qs = require('querystring');

const { httpBody, httpMessage } = require('../response-transforms');
const { queryType, mimeType, buildQuery } = require('./utils');

const _dispatchQuery = (conn, query, params, options) => {
  const headers = conn.headers();
  headers.append('Accept', options.mimeType);
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(query, params);

  return fetch(conn.uri(conn.database, 'query'), {
    method: 'POST',
    body: qs.stringify(body),
    headers,
  }).then(httpBody);
};

const property = (conn, options, params) => {
  return execute(
    conn,
    `select * where {
      ${options.uri} ${options.property} ?val
    }
    `,
    params
  ).then(res => {
    const values = _.get(res, 'result.results.bindings', []);
    if (values.length > 0) {
      return Object.assign({}, res, {
        result: values[0].val.value,
      });
    }
  });
};

const execute = (conn, query, params) => {
  return _dispatchQuery(conn, query, params, {
    mimeType: mimeType(query),
  });
};

const turtle = (conn, query, params) => {
  const valid = ['describe', 'construct'];
  const type = queryType(query);

  if (valid.includes(type)) {
    return _dispatchQuery(conn, query, params, {
      mimeType: 'text/turtle',
    });
  }
  throw TypeError(
    `${type} can not be used with turtle(). Use execute() instead.`
  );
};

const explain = (conn, query, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'text/plain');
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(query, params);
  return fetch(conn.uri(conn.database, 'explain'), {
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
