const { fetch } = require('../fetch');

const { httpBody } = require('../response-transforms');

const attachTransactionId = transactionId => res =>
  Object.assign({}, res, { transactionId });

const begin = (conn, database, params) => {
  const headers = conn.headers();
  headers.set('Accept', '*/*');

  return fetch(conn.uri(database, 'transaction', 'begin'), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then(res => Object.assign({}, res, { transactionId: res.body }));
};

const rollback = (conn, database, transactionId, params) => {
  const headers = conn.headers();
  return fetch(conn.uri(database, 'transaction', 'rollback', transactionId), {
    method: 'POST',
    headers,
  })
    .then(httpBody)
    .then(attachTransactionId(transactionId));
};

const commit = (conn, database, transactionId, params) => {
  const headers = conn.headers();
  return fetch(conn.uri(database, 'transaction', 'commit', transactionId), {
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
