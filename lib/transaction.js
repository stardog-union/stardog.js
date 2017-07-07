const { fetch } = require('fetch-ponyfill')();
const qs = require('querystring');

const { httpBody, httpMessage } = require('./response-transforms');
const { queryType, mimeType, buildQuery } = require('./query/utils');

const _attachTransactionId = transactionId => res =>
  Object.assign({}, res, { transactionId });

const _dispatchChange = (
  conn,
  transactionId,
  content,
  options,
  params = {}
) => {
  const headers = conn.headers();
  headers.append('Accept', 'text/plan');
  headers.append('Content-Type', options.contentType || 'text/plain');
  if (options.encoding) {
    headers.append('Content-Encoding', options.encoding);
  }
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const uri =
    conn.uri(conn.database, transactionId, options.resource) +
    (query.length > 0 ? `?${query}` : '');

  return fetch(uri, {
    method: 'POST',
    headers,
    body: (content += ''), // coerce to a string
  })
    .then(httpBody)
    .then(_attachTransactionId(transactionId));
};

const begin = (conn, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');

  return fetch(conn.uri(conn.database, 'transaction', 'begin'), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then(res => Object.assign({}, res, { transactionId: res.result }));
};

const query = (conn, transactionId, query, params) => {
  const headers = conn.headers();
  headers.append('Accept', mimeType(query));
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const body = buildQuery(query, params);

  return fetch(conn.uri(conn.database, transactionId, 'query'), {
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
const add = (conn, transactionId, content, options, params) => {
  return _dispatchChange(
    conn,
    transactionId,
    content,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'add',
    },
    params
  );
};

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const remove = (conn, transactionId, content, options, params) => {
  return _dispatchChange(
    conn,
    transactionId,
    content,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'remove',
    },
    params
  );
};

const rollback = (conn, transactionId, params) => {
  const headers = conn.headers();
  return fetch(
    conn.uri(conn.database, 'transaction', 'rollback', transactionId),
    {
      method: 'POST',
      headers,
    }
  )
    .then(httpMessage)
    .then(_attachTransactionId(transactionId));
};

const commit = (conn, transactionId, params) => {
  const headers = conn.headers();
  return fetch(
    conn.uri(conn.database, 'transaction', 'commit', transactionId),
    {
      method: 'POST',
      headers,
    }
  )
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
