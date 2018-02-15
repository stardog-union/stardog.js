const { fetch } = require('./fetch');

const { httpBody } = require('./response-transforms');

const list = (conn, params = {}) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs'), {
    headers,
  }).then(httpBody);
};

const add = (conn, name, mappings, options, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'virtual_graphs'), {
    method: 'POST',
    body: JSON.stringify({
      name,
      mappings,
      options,
    }),
    headers,
  }).then(httpBody);
};

const update = (conn, name, mappings, options, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'virtual_graphs', name), {
    method: 'PUT',
    body: JSON.stringify({
      name,
      mappings,
      options,
    }),
    headers,
  }).then(httpBody);
};

const remove = (conn, name, params = {}) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs', name), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const available = (conn, name, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'virtual_graphs', name, 'available'), {
    headers,
  }).then(httpBody);
};

const options = (conn, name, params = {}) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs', name, 'options'), {
    headers,
  }).then(httpBody);
};

const mappings = (conn, name, params = {}) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs', name, 'mappings'), {
    headers,
  }).then(httpBody);
};

module.exports = {
  list,
  add,
  update,
  remove,
  available,
  options,
  mappings,
};
