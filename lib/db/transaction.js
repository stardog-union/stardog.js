const { httpBody } = require('../response-transforms');

const attachTransactionId = transactionId => res => ({ ...res, transactionId });

const begin = (conn, database, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', '*/*');
  return fetch(conn.request(database, 'transaction', 'begin'), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then(res => ({ ...res, transactionId: res.body }));
};

const rollback = (conn, database, transactionId, params = {}) => {
  const headers = conn.headers();
  return fetch(
    conn.request(database, 'transaction', 'rollback', transactionId),
    {
      method: 'POST',
      headers,
    }
  )
    .then(httpBody)
    .then(attachTransactionId(transactionId));
};

const commit = (conn, database, transactionId, params = {}) => {
  const headers = conn.headers();
  return fetch(conn.request(database, 'transaction', 'commit', transactionId), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then(attachTransactionId(transactionId));
};

module.exports = {
  begin,
  rollback,
  commit,
};
