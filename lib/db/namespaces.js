const { fetch } = require('../fetch');
const FormData = require('form-data');
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
        body: bodyRes.body.namespaces.reduce(
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
    headers.set('Content-Type', 'multipart/form-data');
    body = new FormData();
    body.append('upload', fileOrContents);

    if (body.getHeaders) {
      // Copy over formData headers, since node-fetch 2+ apparently doesn't do this
      // automatically. See: https://github.com/bitinn/node-fetch/issues/368
      const formDataHeaders = body.getHeaders();
      Object.keys(formDataHeaders).forEach(key => {
        headers.set(key, formDataHeaders[key]);
      });
    }
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
