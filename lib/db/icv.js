const { httpBody } = require('../response-transforms');
const { encodeURIComponentsWithQuestionMark } = require('../utils');

const get = (conn, database, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/ld+json');

  return fetch(conn.request(database, 'icv'), {
    headers,
  }).then(httpBody);
};

const add = (conn, database, icvAxioms, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');

  return fetch(conn.request(database, 'icv', 'add'), {
    method: 'POST',
    body: icvAxioms,
    headers,
  }).then(httpBody);
};

const remove = (conn, database, icvAxioms, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');

  return fetch(conn.request(database, 'icv', 'remove'), {
    method: 'POST',
    body: icvAxioms,
    headers,
  }).then(httpBody);
};

const clear = (conn, database, params = {}) => {
  const headers = conn.headers();

  return fetch(conn.request(database, 'icv', 'clear'), {
    method: 'POST',
    headers,
  }).then(httpBody);
};

const validate = (conn, database, constraints, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', 'text/boolean');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }

  return fetch(
    conn.request(
      database,
      'icv',
      `validate${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    {
      method: 'POST',
      body: constraints,
      headers,
    }
  ).then(httpBody);
};

const validateInTx = (
  conn,
  database,
  transactionId,
  constraints,
  options = {},
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', 'text/boolean');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }

  return fetch(
    conn.request(
      database,
      'icv',
      transactionId,
      `validate${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    {
      method: 'POST',
      body: constraints,
      headers,
    }
  ).then(httpBody);
};

const violations = (conn, database, constraints, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', '*/*');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }

  return fetch(
    conn.request(
      database,
      'icv',
      `violations${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    {
      method: 'POST',
      body: constraints,
      headers,
    }
  ).then(httpBody);
};

const violationsInTx = (
  conn,
  database,
  transactionId,
  constraints,
  options = {},
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', '*/*');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }

  return fetch(
    conn.request(
      database,
      'icv',
      transactionId,
      `violations${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    {
      method: 'POST',
      body: constraints,
      headers,
    }
  ).then(httpBody);
};

const report = (conn, database, constraints, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', options.accept || 'application/ld+json');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }

  return fetch(
    conn.request(
      database,
      'icv',
      `report${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    {
      method: 'POST',
      body: constraints,
      headers,
    }
  ).then(httpBody);
};

const reportInTx = (
  conn,
  database,
  transactionId,
  constraints,
  options = {},
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', options.accept || 'application/ld+json');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }

  return fetch(
    conn.request(
      database,
      'icv',
      transactionId,
      `report${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    {
      method: 'POST',
      body: constraints,
      headers,
    }
  ).then(httpBody);
};

module.exports = {
  add,
  remove,
  get,
  clear,
  validate,
  validateInTx,
  violations,
  violationsInTx,
  report,
  reportInTx,
};
