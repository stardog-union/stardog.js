const { fetch } = require('./fetch');

const { httpBody } = require('./response-transforms');

const status = conn => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'catalog', 'status'), {
    headers,
  }).then(httpBody);
};

const reload = (conn, provider) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');

  return fetch(conn.request('admin', 'catalog', 'reload'), {
    method: 'POST',
    body: JSON.stringify({ provider }),
    headers,
  }).then(httpBody);
};

const addCredential = (conn, user, label) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');

  const body = {
    username: user.username,
    password: user.password,
    label,
  };

  return fetch(conn.request('admin', 'catalog', 'credentials'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  }).then(httpBody);
};

const listCredentials = conn => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');

  return fetch(conn.request('admin', 'catalog', 'credentials'), {
    method: 'GET',
    headers,
  }).then(httpBody);
};

const removeCredential = (conn, accessKey) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');

  return fetch(conn.request('admin', 'catalog', 'credentials', accessKey), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const testConnection = (conn, connectionOptions) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'text/turtle');

  return fetch(
    conn.request('admin', 'catalog', 'providers', 'test_connection_properties'),
    {
      method: 'POST',
      // connectionOptions is a JSON object made up of properties of metadata provider parameters and their values in Turtle syntax
      body: JSON.stringify(connectionOptions),
      headers,
    }
  ).then(httpBody);
};

module.exports = {
  status,
  reload,
  addCredential,
  removeCredential,
  listCredentials,
  testConnection,
};
