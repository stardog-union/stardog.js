import { fetch } from '../fetch';
import qs from 'querystring';
import { httpBody } from '../response-transforms';

export const get = (conn, database) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/ld+json');

  const fetchResponse = fetch(conn.request(database, 'icv'), {
    headers,
  });

  return httpBody(fetchResponse);
};

export const add = (conn, database, icvAxioms, options = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');

  const fetchResponse = fetch(conn.request(database, 'icv', 'add'), {
    method: 'POST',
    body: icvAxioms,
    headers,
  });

  return httpBody(fetchResponse);
};

export const remove = (conn, database, icvAxioms, options = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');

  const fetchResponse = fetch(conn.request(database, 'icv', 'remove'), {
    method: 'POST',
    body: icvAxioms,
    headers,
  });

  return httpBody(fetchResponse);
};

export const clear = (conn, database) => {
  const headers = conn.headers();

  const fetchResponse = fetch(conn.request(database, 'icv', 'clear'), {
    method: 'POST',
    headers,
  });

  return httpBody(fetchResponse);
};

export const convert = (
  conn,
  database,
  icvAxiom,
  options = {},
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const suffix = `convert${query.length > 0 ? `?${query}` : ''}`;

  const fetchResponse = fetch(conn.request(database, 'icv', suffix), {
    method: 'POST',
    body: icvAxiom,
    headers,
  });

  return httpBody(fetchResponse);
};

export const validate = (
  conn,
  database,
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
  const query = qs.stringify(queryParams);
  const suffix = `validate${query.length > 0 ? `?${query}` : ''}`;

  const fetchResponse = fetch(conn.request(database, 'icv', suffix), {
    method: 'POST',
    body: constraints,
    headers,
  });

  return httpBody(fetchResponse);
};

export const validateInTx = (
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
  const query = qs.stringify(queryParams);
  const suffix = `validate${query.length > 0 ? `?${query}` : ''}`;

  const fetchResponse = fetch(
    conn.request(database, 'icv', transactionId, suffix),
    {
      method: 'POST',
      body: constraints,
      headers,
    }
  );

  return httpBody(fetchResponse);
};

export const violations = (
  conn,
  database,
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
  const query = qs.stringify(queryParams);
  const suffix = `violations${query.length > 0 ? `?${query}` : ''}`;

  const fetchResponse = fetch(conn.request(database, 'icv', suffix), {
    method: 'POST',
    body: constraints,
    headers,
  });

  return httpBody(fetchResponse);
};

export const violationsInTx = (
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
  const query = qs.stringify(queryParams);
  const suffix = `violations${query.length > 0 ? `?${query}` : ''}`;

  const fetchResponse = fetch(
    conn.request(database, 'icv', transactionId, suffix),
    {
      method: 'POST',
      body: constraints,
      headers,
    }
  );

  return httpBody(fetchResponse);
};

const report = (conn, database, constraints, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', options.contentType || 'text/turtle');
  headers.set('Accept', options.accept || 'application/ld+json');

  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const suffix = `report${query.length > 0 ? `?${query}` : ''}`;

  return fetch(conn.request(database, 'icv', suffix), {
    method: 'POST',
    body: constraints,
    headers,
  }).then(httpBody);
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
  const query = qs.stringify(queryParams);
  const suffix = `report${query.length > 0 ? `?${query}` : ''}`;

  return fetch(conn.request(database, 'icv', transactionId, suffix), {
    method: 'POST',
    body: constraints,
    headers,
  }).then(httpBody);
};

module.exports = {
  add,
  remove,
  get,
  clear,
  convert,
  validate,
  validateInTx,
  violations,
  violationsInTx,
  report,
  reportInTx,
};
