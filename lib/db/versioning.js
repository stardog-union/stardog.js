const { fetch } = require('../fetch');
const qs = require('querystring');
const { httpBody } = require('../response-transforms');
const { mimeType } = require('../query/utils');

const executeQuery = (
  conn,
  database,
  query,
  accept = mimeType(query),
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Accept', accept);
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const queryString = qs.stringify(params);

  const suffix = `query${queryString.length > 0 ? `?${queryString}` : ''}`;

  return fetch(conn.request(database, 'vcs', suffix), {
    method: 'POST',
    body: qs.stringify({ query }),
    headers,
  }).then(httpBody);
};

const commit = (conn, database, transactionId, commitMsg, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'text/plain');
  return fetch(conn.request(database, 'vcs', transactionId, 'commit_msg'), {
    method: 'POST',
    body: commitMsg,
    headers,
  }).then(httpBody);
};

const createTag = (conn, database, revisionId, tagName, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'text/plain');
  return fetch(conn.request(database, 'vcs', 'tags', 'create'), {
    method: 'POST',
    body: `"tag:stardog:api:versioning:version:${revisionId}", "${tagName}"`,
    headers,
  }).then(httpBody);
};

const deleteTag = (conn, database, tagName, params = {}) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'text/plain');
  return fetch(conn.request(database, 'vcs', 'tags', 'delete'), {
    method: 'POST',
    body: tagName,
    headers,
  }).then(httpBody);
};

const revert = (
  conn,
  database,
  fromRevisionId,
  toRevisionId,
  logMsg,
  params = {}
) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'text/plain');
  return fetch(conn.request(database, 'vcs', 'revert'), {
    method: 'POST',
    body: `"tag:stardog:api:versioning:version:${toRevisionId}", "tag:stardog:api:versioning:version:${fromRevisionId}", "${logMsg}"`,
    headers,
  }).then(httpBody);
};

module.exports = {
  query: executeQuery,
  commit,
  createTag,
  deleteTag,
  revert,
};
