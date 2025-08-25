const flat = require('flat');

const { httpBody } = require('../response-transforms');
const { encodeURIComponentsWithQuestionMark } = require('../utils');

const dispatchChange = (conn, config, content, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  headers.set('Content-Type', config.contentType || 'text/plain');
  if (config.encoding) {
    headers.set('Content-Encoding', config.encoding);
  }
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }

  return fetch(
    conn.request(
      config.database,
      config.transactionId,
      `${config.resource}${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    {
      method: 'POST',
      headers,
      body: content,
    }
  )
    .then(httpBody)
    .then(res => ({ ...res, transactionId: config.transactionId }));
};

const create = (conn, database, databaseOptions = {}, options = {}, params) => {
  const headers = conn.headers();
  const dbOptions = flat(databaseOptions);
  const { propertiesFile } = options;
  const body = new FormData();

  if (propertiesFile) {
    body.append('propertiesFile', propertiesFile, `${database}.properties`);
  }

  body.append(
    'root',
    JSON.stringify({
      dbname: database,
      options: dbOptions,
      files: options.files,
    })
  );

  return fetch(conn.request('admin', 'databases'), {
    method: 'POST',
    headers,
    body,
  }).then(httpBody);
};

const drop = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'databases', database), {
    method: 'DELETE',
    headers,
  }).then(httpBody);
};

const getDatabase = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.request(database), {
    headers,
  }).then(httpBody);
};

const offline = (conn, database, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases', database, 'offline'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const online = (conn, database, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases', database, 'online'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const optimize = (conn, database, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'databases', database, 'optimize'), {
    method: 'PUT',
    headers,
  }).then(httpBody);
};

const list = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'databases'), {
    headers,
  }).then(httpBody);
};

const listInfo = (conn, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'databases', 'options'), {
    headers,
  }).then(httpBody);
};

const size = (conn, database, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  return fetch(conn.request(database, 'size'), {
    headers,
  }).then(httpBody);
};

const model = (conn, database, options = {}, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', options.accept || 'text/plain');

  return fetch(
    conn.request(
      database,
      `model${encodeURIComponentsWithQuestionMark(params)}`
    ),
    {
      headers,
    }
  ).then(httpBody);
};

const clear = (conn, database, transactionId, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');
  const queryParams = {};
  if (params.graphUri) {
    queryParams['graph-uri'] = params.graphUri;
  }

  return fetch(
    conn.request(
      database,
      transactionId,
      `clear${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    {
      method: 'POST',
      headers,
    }
  )
    .then(httpBody)
    .then(res => ({ ...res, transactionId }));
};

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const add = (
  conn,
  database,
  transactionId,
  content,
  options = {},
  params = {}
) =>
  dispatchChange(
    conn,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'add',
      database,
      transactionId,
    },
    content,
    params
  );

// options - graphUri, contentType, encoding
// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
// encoding - gzip, compress, deflate, identity, br
const remove = (
  conn,
  database,
  transactionId,
  content,
  options = {},
  params = {}
) =>
  dispatchChange(
    conn,
    {
      contentType: options.contentType,
      encoding: options.encoding,
      resource: 'remove',
      database,
      transactionId,
    },
    content,
    params
  );

// options
//  mimeType
// params
//  graphUri
const exportData = (
  conn,
  database,
  options = {},
  params = {},
  additionalHandlers = {}
) => {
  const headers = conn.headers();
  headers.set('Accept', options.mimetype || 'application/ld+json');

  const queryParams = {
    'graph-uri': params.graphUri || 'tag:stardog:api:context:all',
  };

  if (params.compression) {
    queryParams['server-side'] = true; // required for using compression
    queryParams.compression = params.compression;
  }
  if (params.format) {
    queryParams.format = params.format;
  }

  const fetchPromise = fetch(
    conn.request(
      database,
      `export${encodeURIComponentsWithQuestionMark(queryParams)}`
    ),
    { headers }
  );

  return fetchPromise.then(res => {
    const shouldContinue = !additionalHandlers.onResponseStart
      ? true
      : additionalHandlers.onResponseStart(res);

    if (shouldContinue === false) {
      return res;
    }

    return httpBody(res);
  });
};

module.exports = {
  create,
  drop,
  get: getDatabase,
  offline,
  online,
  optimize,
  list,
  listInfo,
  size,
  model,
  clear,
  add,
  remove,
  exportData,
};
