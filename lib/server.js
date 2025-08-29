const { httpMessage, httpBody } = require('./response-transforms');
const { encodeQueryString } = require('./utils');

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

  return fetch(conn.request('admin', `status${encodeQueryString(params)}`), {
    headers,
  }).then(httpBody);
};

const properties = (conn, names = []) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(
    conn.request('admin', `properties${encodeQueryString({ name: names })}`),
    {
      headers,
    }
  ).then(httpBody);
};

const logs = conn => {
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
