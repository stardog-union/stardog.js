const qs = require('querystring');
const { fetch } = require('./fetch');
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

const versionPromise = (version, conn) => {
  if (version) {
    return Promise.resolve(version);
  } else if (conn) {
    return status(conn, { databases: false }).then(
      statusResponse =>
        statusResponse.status === 200
          ? statusResponse.body['dbms.version'].value
          : null
    );
  }
  return null;
};

module.exports = {
  shutdown,
  status,
  version: versionPromise,
};
