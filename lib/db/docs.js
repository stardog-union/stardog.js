const FormData = require('form-data');
const { fetch } = require('../fetch');

const { httpBody } = require('../response-transforms');

const size = (conn, database, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');

  return fetch(conn.request(database, 'docs', 'size'), {
    headers,
  }).then(httpBody);
};

const clear = (conn, database, params = {}) => {
  const headers = conn.headers();
  return fetch(conn.request(database, 'docs'), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const add = (conn, database, fileName, fileContents, params = {}) => {
  const headers = conn.headers();
  const formData = new FormData();
  formData.append('upload', new Buffer(fileContents), {
    filename: fileName,
  });
  return fetch(conn.request(database, 'docs'), {
    method: 'POST',
    body: formData,
    headers,
  }).then(httpBody);
};

const remove = (conn, database, fileName, params = {}) => {
  const headers = conn.headers();
  return fetch(conn.request(database, 'docs', fileName), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const get = (conn, database, fileName, params = {}) => {
  const headers = conn.headers();
  return fetch(conn.request(database, 'docs', fileName), {
    headers,
  }).then(httpBody);
};

module.exports = {
  size,
  clear,
  add,
  remove,
  get,
};
