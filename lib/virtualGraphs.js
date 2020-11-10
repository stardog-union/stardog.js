const FormData = require('form-data');
const { fetch } = require('./fetch');

const { httpBody } = require('./response-transforms');

const list = conn => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs'), {
    headers,
  }).then(httpBody);
};

const listInfo = conn => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'virtual_graphs', 'list'), {
    headers,
  }).then(httpBody);
};

const add = (conn, name, mappings, options, meta = {}) => {
  const { db, dataSource } = meta;
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'virtual_graphs'), {
    method: 'POST',
    body: JSON.stringify({
      name,
      mappings,
      options,
      db,
      data_source: dataSource,
    }),
    headers,
  }).then(httpBody);
};

const update = (conn, name, mappings, options, meta = {}) => {
  const { db, dataSource } = meta;
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'virtual_graphs', name), {
    method: 'PUT',
    body: JSON.stringify({
      name,
      mappings,
      options,
      db,
      data_source: dataSource,
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

const online = (conn, name) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'virtual_graphs', name, 'online'), {
    method: 'POST',
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

const importFile = (conn, file, fileType, database, importOptions = {}) => {
  const { mappings: importMappings, properties, namedGraph } = importOptions;
  const headers = conn.headers();
  const body = new FormData();

  body.append('input_file_type', fileType);
  body.append('database', database);
  if (importMappings) {
    body.append('mappings', importMappings);
  }
  if (properties) {
    body.append('options', properties);
  }
  if (namedGraph) {
    body.append('named_graph', namedGraph);
  }
  // IMPORTANT: Stardog API *requires* that input_file is appended last.
  body.append('input_file', file);

  if (body.getHeaders) {
    // Copy over formData headers, since node-fetch 2+ apparently doesn't do this
    // automatically. See: https://github.com/bitinn/node-fetch/issues/368
    const formDataHeaders = body.getHeaders();
    Object.keys(formDataHeaders).forEach(key => {
      headers.set(key, formDataHeaders[key]);
    });
  }

  return fetch(conn.request('admin', 'virtual_graphs', 'import'), {
    method: 'POST',
    body,
    headers,
  }).then(httpBody);
};

module.exports = {
  list,
  listInfo,
  add,
  update,
  remove,
  online,
  available,
  options,
  mappings,
  importFile,
};
