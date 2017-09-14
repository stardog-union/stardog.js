const { fetch } = require('./fetch');
const { httpMessage } = require('./response-transforms');

const shutdown = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.uri('admin', 'shutdown'), {
    headers,
  }).then(httpMessage);
};

module.exports = {
  shutdown,
};
