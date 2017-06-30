const { fetch } = require('fetch-ponyfill')();
const _ = require('lodash');
const qs = require('querystring');

const { httpBody, httpMessage } = require('./response-transforms');

const property = (conn, options, params) => {
  return execute(
    conn,
    {
      query: `select * where {
        ${options.uri} ${options.property} ?val
        }
    `,
    },
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

const execute = (conn, options, params) => {
  const queryParams = ['baseURI', 'limit', 'offset', 'reasoning'];
  const headers = conn.headers();

  headers.append('Accept', 'application/sparql-results+json');
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = {
    query: options.query,
  };

  Object.keys(options)
    // If it's a supported query param and it has a value, include it
    .filter(v => queryParams.indexOf(v) > -1 && options[v] != null)
    .reduce((memo, key) => {
      memo[key] = options[key];
      return memo;
    }, body);

  return fetch(conn.uri(conn.database, 'query'), {
    method: 'POST',
    body: qs.stringify(body),
    credentials: 'include',
    headers,
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
};
