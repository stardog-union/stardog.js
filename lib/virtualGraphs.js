const { fetch } = require('./fetch');

const { httpBody } = require('./response-transforms');

const list = conn => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs'), {
    headers,
  }).then(httpBody);
};

const add = (conn, name, mappings, options) => {
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

const update = (conn, name, mappings, options) => {
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

const remove = (conn, name) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs', name), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const available = (conn, name) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'virtual_graphs', name, 'available'), {
    headers,
  }).then(httpBody);
};

const options = (conn, name) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs', name, 'options'), {
    headers,
  }).then(httpBody);
};

const mappings = (conn, name, requestOptions = {}) => {
  const headers = conn.headers();

  if (requestOptions.preferUntransformed) {
    // Try to get the mappings string that was last submitted, not the
    // transformed mappings. (If syntax doesn't match, however, you'll still
    // get generated mapptings.)
    const syntax = requestOptions.syntax || 'SMS2';
    return fetch(
      conn.request('admin', 'virtual_graphs', name, 'mappingsString', syntax),
      {
        headers,
      }
    ).then(httpBody);
  }

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
