const { fetch } = require('../fetch');
const lodashGet = require('lodash/get');
const qs = require('querystring');

const { httpBody } = require('../response-transforms');
const { mimeType, queryType } = require('./utils');

const dispatchQuery = (
  conn,
  config,
  accept = config.accept,
  params = {},
  additionalHandlers = {}
) => {
  const headers = conn.headers();
  headers.set('Accept', accept);
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const queryString = qs.stringify(params);

  const suffix = `${config.resource}${
    queryString.length > 0 ? `?${queryString}` : ''
  }`;

  const fetchPromise = fetch(conn.request(config.database, suffix), {
    method: 'POST',
    body: qs.stringify({ query: config.query }),
    headers,
  });

  return fetchPromise.then(res => {
    const shouldContinue = !additionalHandlers.onResponseStart
      ? true
      : additionalHandlers.onResponseStart(res);

    if (shouldContinue === false) {
      return res;
    }

    return httpBody(res).then(bodyRes => {
      // Paths queries will return duplicate variable names
      // in body.head.vars (#135)
      // e.g., `paths start ?x end ?y via ?p` will return
      // ['x', 'x', 'p', 'y', 'y']. Use of a Set here
      // simply eliminates the duplicates for things like Studio
      if (bodyRes.body && bodyRes.body.head && bodyRes.body.head.vars) {
        bodyRes.body.head.vars = [...new Set(bodyRes.body.head.vars)];
      }
      return bodyRes;
    });
  });
};

const execute = (conn, database, query, accept, params, additionalHandlers) => {
  const type = queryType(query);
  return dispatchQuery(
    conn,
    {
      database,
      query,
      accept: mimeType(query),
      resource: type === 'update' ? 'update' : 'query',
    },
    accept,
    params,
    additionalHandlers
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

  const type = queryType(query);
  const suffix = `${type === 'update' ? 'update' : 'query'}${
    queryString.length > 0 ? `?${queryString}` : ''
  }`;

  return fetch(conn.request(database, transactionId, suffix), {
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

const explain = (conn, database, query, accept = 'text/plain', params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', accept);
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const queryString = qs.stringify(params);
  const suffix = `explain${queryString.length > 0 ? `?${queryString}` : ''}`;

  return fetch(conn.request(database, suffix), {
    method: 'POST',
    headers,
    body: qs.stringify({ query }),
  }).then(httpBody);
};

const list = conn => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'queries'), {
    headers,
  }).then(httpBody);
};

const kill = (conn, queryId) => {
  const headers = conn.headers();

  return fetch(conn.request('admin', 'queries', queryId), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const get = (conn, queryId) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'queries', queryId), {
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
