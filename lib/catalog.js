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

module.exports = {
  status,
  reload,
};
