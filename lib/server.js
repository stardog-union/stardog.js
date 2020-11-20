const qs = require('querystring');
const { fetch } = require('./fetch');
const { httpMessage, httpBody } = require('./response-transforms');

const properties = (conn, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  const suffix = `${params.name ? `?name=${params.name}` : ''}`;
  return fetch(conn.request('admin', 'properties', suffix), {
    headers,
  }).then(httpBody);
};

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

module.exports = {
  properties,
  shutdown,
  status,
};
