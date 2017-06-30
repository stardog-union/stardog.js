const { fetch } = require('fetch-ponyfill')();
const shutdown = (conn, params) => {
  const headers = conn.headers();
  headers.append('Accept', 'application/json');
  return fetch(uri(this.endpoint, 'admin', 'shutdown'), {
    headers,
  }).then(ResponseBody);
};

module.exports = {
  shutdown,
};
