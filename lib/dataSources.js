const { fetch } = require('./fetch');

const { httpBody } = require('./response-transforms');

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

const update = (conn, name, options) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'data_sources', name), {
    method: 'PUT',
    body: JSON.stringify({
      name,
      options,
    }),
    headers,
  }).then(httpBody);
};

const remove = (conn, name) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'data_sources', name), {
    method: 'DELETE',
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

const updateMetadata = (conn, name, metadata, opts = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', opts.contentType || 'text/turtle');

  return fetch(conn.request('admin', 'data_sources', name, 'metadata'), {
    method: 'PUT',
    body: metadata,
    headers,
  }).then(httpBody);
};

module.exports = {
  list,
  listInfo,
  info,
  add,
  update,
  remove,
  online,
  available,
  options,
  getMetadata,
  updateMetadata,
};
