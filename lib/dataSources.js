const { httpBody } = require('./response-transforms');
const { encodeQueryString } = require('./utils');

const list = conn => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'data_sources'), {
    headers,
  }).then(httpBody);
};

const listInfo = conn => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'data_sources', 'list'), {
    headers,
  }).then(httpBody);
};

const info = (conn, name) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'data_sources', name, 'info'), {
    headers,
  }).then(httpBody);
};

const add = (conn, name, options) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'data_sources'), {
    method: 'POST',
    body: JSON.stringify({
      name,
      options,
    }),
    headers,
  }).then(httpBody);
};

const update = (conn, name, options, requestOptions = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');

  const body = { name, options };
  if (requestOptions.force) {
    body.force = requestOptions.force;
  }
  if (requestOptions.delta_options) {
    body.delta_options = requestOptions.delta_options;
  }

  return fetch(conn.request('admin', 'data_sources', name), {
    method: 'PUT',
    body: JSON.stringify(body),
    headers,
  }).then(httpBody);
};

const remove = (conn, name, params = {}) => {
  const headers = conn.headers();

  return fetch(
    conn.request(
      'admin',
      'data_sources',
      `${name}${encodeQueryString(params)}`
    ),
    {
      method: 'DELETE',
      headers,
    }
  ).then(httpBody);
};

const share = (conn, name) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'data_sources', name, 'share'), {
    method: 'POST',
    headers,
  }).then(httpBody);
};

const online = (conn, name) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'data_sources', name, 'online'), {
    method: 'POST',
    headers,
  }).then(httpBody);
};

const available = (conn, name) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'data_sources', name, 'available'), {
    headers,
  }).then(httpBody);
};

const options = (conn, name) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'data_sources', name, 'options'), {
    headers,
  }).then(httpBody);
};

const getMetadata = (conn, name, opts = {}) => {
  const headers = conn.headers();
  headers.set('Accept', opts.accept || 'text/turtle');

  return fetch(conn.request('admin', 'data_sources', name, 'metadata'), {
    headers,
  }).then(httpBody);
};

const getTableMetadata = (conn, dsName, opts) => {
  const headers = conn.headers();
  headers.set('Accept', opts.accept || 'text/turtle');
  headers.set('Content-Type', 'application/json');
  const body = {
    table_name: opts.table_name,
    table_type: opts.table_type,
  };
  if (opts.catalog) {
    body.catalog = opts.catalog;
  }
  if (opts.schema) {
    body.schema = opts.schema;
  }

  return fetch(
    conn.request('admin', 'data_sources', dsName, 'table_metadata'),
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }
  ).then(httpBody);
};

const getTables = (conn, name) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'data_sources', name, 'tables'), {
    headers,
  }).then(httpBody);
};

const updateMetadata = (conn, name, metadata, opts = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', opts.contentType || 'text/turtle');

  return fetch(conn.request('admin', 'data_sources', name, 'metadata'), {
    method: 'PUT',
    body: metadata,
    headers,
  }).then(httpBody);
};

const query = (conn, name, dataSourceQuery) => {
  const headers = conn.headers();
  const isString = typeof dataSourceQuery === 'string';
  headers.set('Content-Type', isString ? 'text/plain' : 'application/json');
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'data_sources', name, 'query'), {
    method: 'POST',
    body: isString ? dataSourceQuery : JSON.stringify(dataSourceQuery),
    headers,
  }).then(httpBody);
};

const refreshCounts = (conn, name, tableName = '') => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const body = {};
  if (tableName) {
    body.name = tableName;
  }

  return fetch(conn.request('admin', 'data_sources', name, 'refresh_counts'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  }).then(httpBody);
};

const refreshMetadata = (conn, name, tableName = '') => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const body = {};
  if (tableName) {
    body.name = tableName;
  }

  return fetch(
    conn.request('admin', 'data_sources', name, 'refresh_metadata'),
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }
  ).then(httpBody);
};

const suggestions = (conn, content, opts = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', opts.contentType || 'application/trig');
  headers.set('Accept', opts.accept || 'application/ld+json');

  return fetch(conn.request('matcher', 'suggestions'), {
    method: 'POST',
    body: content,
    headers,
  }).then(httpBody);
};

const typeDescription = conn => {
  const headers = conn.headers();
  return fetch(
    conn.request('admin', 'data_sources', 'data_source_type_description'),
    {
      headers,
    }
  ).then(httpBody);
};

module.exports = {
  add,
  available,
  getMetadata,
  getTableMetadata,
  getTables,
  info,
  list,
  listInfo,
  online,
  options,
  query,
  refreshCounts,
  refreshMetadata,
  remove,
  share,
  suggestions,
  typeDescription,
  update,
  updateMetadata,
};
