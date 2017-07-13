const { fetch } = require('fetch-ponyfill')();
const qs = require('querystring');

const { httpBody, httpMessage } = require('./response-transforms');
const { mimeType, buildQuery } = require('./query/utils');

const attachTransactionId = transactionId => res =>
  Object.assign({}, res, { transactionId });

const dispatchChange = (conn, config, content, params = {}) => {
  const headers = conn.headers();
  headers.append('Accept', 'text/plan');
  headers.append('Content-Type', config.contentType || 'text/plain');
  if (config.encoding) {
    headers.append('Content-Encoding', config.encoding);
  }
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const uri =
    conn.uri(config.database, config.transactionId, config.resource) +
    (query.length > 0 ? `?${query}` : '');

  return fetch(uri, {
    method: 'POST',
    headers,
    body: config.content + '', // eslint-disable-line prefer-template
  })
    .then(httpBody)
    .then(attachTransactionId(config.transactionId));
};

const begin = (conn, database, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');

  return fetch(conn.uri(database, 'transaction', 'begin'), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then(res => Object.assign({}, res, { transactionId: res.body }));
};

const query = (conn, database, transactionId, q, params) => {
  const headers = conn.headers();
  headers.append('Accept', mimeType(q));
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(q, params);

  return fetch(conn.uri(database, transactionId, 'query'), {
    method: 'POST',
    headers,
    body: qs.stringify(body),
  })
    .then(httpBody)
    .then(attachTransactionId(transactionId));
};

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const add = (conn, database, transactionId, content, options, params) =>
  dispatchChange(
    conn,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'add',
      database,
      transactionId,
      content,
    },
    params
  );

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const remove = (conn, database, transactionId, content, options, params) =>
  dispatchChange(
    conn,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'remove',
      database,
      transactionId,
      content,
    },
    params
  );

const rollback = (conn, database, transactionId, params) => {
  const headers = conn.headers();
  return fetch(conn.uri(database, 'transaction', 'rollback', transactionId), {
    method: 'POST',
    headers,
  })
    .then(httpMessage)
    .then(attachTransactionId(transactionId));
};

const commit = (conn, database, transactionId, params) => {
  const headers = conn.headers();
  return fetch(conn.uri(database, 'transaction', 'commit', transactionId), {
    method: 'POST',
    headers,
  })
    .then(httpMessage)
    .then(attachTransactionId(transactionId));
};

module.exports = {
  begin,
  query,
  add,
  rollback,
  commit,
  remove,
};
