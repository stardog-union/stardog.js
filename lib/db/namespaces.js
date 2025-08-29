const { get: getOptions } = require('./options');
const lodashGet = require('lodash/get');

const { httpBody } = require('../response-transforms');

// For Stardog <= 7.0.2 compatibility. Remove later.
const backwardsCompatGetNamespaces = (conn, database) =>
  getOptions(conn, database, { database: { namespaces: null } }).then(res => {
    if (res.status === 200) {
      const n = lodashGet(res, 'body.database.namespaces', []);
      const names = n.reduce((memo, keyValString) => {
        const [key, value] = keyValString.split('=');
        return Object.assign({}, memo, { [key]: value });
      }, {});
      res.body = names;
    }
    return res;
  });

const get = (conn, database) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request(database, 'namespaces'), {
    method: 'GET',
    headers,
  }).then(res => {
    // Old version of Stardog:
    if (res.status === 404) {
      return backwardsCompatGetNamespaces(conn, database);
    }

    return httpBody(res).then(bodyRes =>
      Object.assign({}, bodyRes, {
        body: lodashGet(bodyRes, 'body.namespaces', []).reduce(
          (memo, { prefix, name }) =>
            Object.assign({}, memo, { [prefix]: name }),
          {}
        ),
      })
    );
  });
};

const add = (conn, database, fileOrContents, options = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  let body;

  if (typeof fileOrContents === 'string') {
    headers.set('Content-Type', options.contentType || 'text/turtle');
    body = fileOrContents;
  } else {
    body = new FormData();
    body.append('upload', fileOrContents);
  }

  return fetch(conn.request(database, 'namespaces'), {
    method: 'POST',
    headers,
    body,
  }).then(httpBody);
};

module.exports = {
  get,
  add,
};
