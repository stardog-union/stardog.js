import { fetch } from '../fetch';
import FormData from 'form-data';
import qs from 'querystring';
import flat from 'flat';
import lodashGet from 'lodash.get';
import { httpBody } from '../response-transforms';
import { get as getOptions } from './options';

export const dispatchChange = (conn, config, content, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  headers.set('Content-Type', config.contentType || 'text/plain');
  if (config.encoding) {
    headers.set('Content-Encoding', config.encoding);
  }
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const suffix = `${config.resource}${query.length > 0 ? `?${query}` : ''}`;

  return fetch(conn.request(config.database, config.transactionId, suffix), {
    method: 'POST',
    headers,
    body: content,
  })
    .then(httpBody)
    .then((res) =>
      Object.assign({}, res, { transactionId: config.transactionId })
    );
};

export const create = (conn, database, databaseOptions = {}, options = {}) => {
  const headers = conn.headers();
  const dbOptions = flat(databaseOptions);

  const body = new FormData();
  body.append(
    'root',
    JSON.stringify({
      dbname: database,
      options: dbOptions,
      files: options.files,
    })
  );
  // Copy over formData headers, since node-fetch 2+ apparently doesn't do this
  // automatically. See: https://github.com/bitinn/node-fetch/issues/368
  const formDataHeaders = body.getHeaders();
  Object.keys(formDataHeaders).forEach((key) => {
    headers.set(key, formDataHeaders[key]);
  });

  return fetch(conn.request('admin', 'databases'), {
    method: 'POST',
    headers,
    body,
  }).then(httpBody);
};

export const drop = (conn, database) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'databases', database), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

export const getDatabase = (conn, database) => {
  const headers = conn.headers();
  return fetch(conn.request(database), {
    headers,
  }).then(httpBody);
};

export const offline = (conn, database) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases', database, 'offline'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

export const online = (conn, database) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases', database, 'online'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

export const optimize = (conn, database) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'databases', database, 'optimize'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

export const copy = (conn, database, destination) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  const suffix = `copy?${qs.stringify({ to: destination })}`;

  return fetch(conn.request('admin', 'databases', database, suffix), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

export const list = (conn) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases'), {
    headers,
  }).then(httpBody);
};

export const size = (conn, database) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  return fetch(conn.request(database, 'size'), {
    headers,
  }).then(httpBody);
};

export const clear = (conn, database, transactionId, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }
  const query = qs.stringify(queryParams);
  const suffix = `clear${query.length > 0 ? `?${query}` : ''}`;

  return fetch(conn.request(database, transactionId, suffix), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then((res) => Object.assign({}, res, { transactionId }));
};

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
export const add = (
  conn,
  database,
  transactionId,
  content,
  options = {},
  params = {}
) =>
  dispatchChange(
    conn,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'add',
      database,
      transactionId,
    },
    content,
    params
  );

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
export const remove = (
  conn,
  database,
  transactionId,
  content,
  options = {},
  params = {}
) =>
  dispatchChange(
    conn,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'remove',
      database,
      transactionId,
    },
    content,
    params
  );

export const namespaces = (conn, database, params) =>
  getOptions(conn, database, params).then((res) => {
    if (res.status === 200) {
      const n = lodashGet(res, 'body.database.namespaces', []);
      const names = n.reduce((memo, val) => {
        const [key, value] = val.split('=');
        return Object.assign({}, memo, { [key]: value });
      }, {});
      res.body = names;
    }
    return res;
  });

export const exportData = (conn, database, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', options.mimetype || 'application/ld+json');

  const queryParams = {
    'graph-uri': params.graphUri || 'tag:stardog:api:context:all',
  };
  const suffix = `export?${qs.stringify(queryParams)}`;

  return fetch(conn.request(database, suffix), {
    headers,
  }).then(httpBody);
};
