const qs = require('querystring');
const Fetch = require('./fetch');
const { httpBody } = require('./response-transforms');

const info = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return Fetch.fetch(conn.request('admin', 'cluster'), {
    headers,
  }).then(httpBody);
};

const status = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return Fetch.fetch(conn.request('admin', 'cluster', 'status'), {
    headers,
  }).then(httpBody);
};

module.exports = {
  info,
  status,
};
