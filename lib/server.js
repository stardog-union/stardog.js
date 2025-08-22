const qs = require('querystring');
const { httpMessage, httpBody } = require('./response-transforms');

const shutdown = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'shutdown'), {
    headers,
  }).then(httpMessage);
};

const status = (conn, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  const queryString = qs.stringify(params);
  return fetch(
    conn.request(
      'admin',
      `status${queryString.length > 0 ? `?${queryString}` : ''}`
    ),
    {
      headers,
    }
  ).then(httpBody);
};

const properties = (conn, names = []) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  const queryString = names
    .map((name) => `name=${encodeURIComponent(name)}`)
    .join('&');
  return fetch(
    conn.request(
      'admin',
      `properties${queryString.length > 0 ? `?${queryString}` : ''}`
    ),
    {
      headers,
    }
  ).then(httpBody);
};

const logs = (conn) => {
  const headers = conn.headers();
  const response = fetch(conn.request('admin', 'logs'), {
    headers,
  });

  return response;
};

module.exports = {
  shutdown,
  status,
  properties,
  logs,
};
