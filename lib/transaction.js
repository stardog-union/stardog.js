const { fetch } = require('fetch-ponyfill')();
const qs = require('querystring');

const { httpBody, httpMessage } = require('./response-transforms');
const { queryType, mimeType, buildQuery } = require('./query/utils');

const _attachTransactionId = transactionId => res =>
  Object.assign({}, res, { transactionId });

const _dispatchChange = (conn, config, content, params = {}) => {
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
    body: (config.content += ''), // coerce to a string
  })
    .then(httpBody)
    .then(_attachTransactionId(config.transactionId));
};

const begin = (conn, database, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');

  return fetch(conn.uri(database, 'transaction', 'begin'), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then(res => Object.assign({}, res, { transactionId: res.result }));
};

const query = (conn, database, transactionId, query, params) => {
  const headers = conn.headers();
  headers.append('Accept', mimeType(query));
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(query, params);

  return fetch(conn.uri(database, transactionId, 'query'), {
    method: 'POST',
    headers,
    body: qs.stringify(body),
  })
    .then(httpBody)
    .then(_attachTransactionId(transactionId));
};

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const add = (conn, database, transactionId, content, options, params) => {
  return _dispatchChange(
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
};

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const remove = (conn, database, transactionId, content, options, params) => {
  return _dispatchChange(
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
};

const rollback = (conn, database, transactionId, params) => {
  const headers = conn.headers();
  return fetch(conn.uri(database, 'transaction', 'rollback', transactionId), {
    method: 'POST',
    headers,
  })
    .then(httpMessage)
    .then(_attachTransactionId(transactionId));
};

const commit = (conn, database, transactionId, params) => {
  const headers = conn.headers();
  return fetch(conn.uri(database, 'transaction', 'commit', transactionId), {
    method: 'POST',
    headers,
  })
    .then(httpMessage)
    .then(_attachTransactionId(transactionId));
};

module.exports = {
  begin,
  query,
  add,
  rollback,
  commit,
  remove,
};
