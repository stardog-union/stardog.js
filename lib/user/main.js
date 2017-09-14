const { fetch } = require('../fetch');
const { httpBody, httpMessage } = require('../response-transforms');

const list = (conn, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'users'), {
    headers,
  }).then(httpBody);
};

const get = (conn, username, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'users', username), {
    headers,
  }).then(httpBody);
};

const create = (conn, user, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');

  const body = {
    username: user.name,
    password: user.password.split(''),
    superuser: typeof user.superuser === 'boolean' ? user.superuser : false,
  };

  return fetch(conn.uri('admin', 'users'), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(httpBody);
};

const changePassword = (conn, username, password, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  const body = {
    password,
  };

  return fetch(conn.uri('admin', 'users', username, 'pwd'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  }).then(httpMessage);
};

const valid = (conn, params) => {
  const headers = conn.headers();

  return fetch(conn.uri('admin', 'users', 'valid'), {
    headers,
  }).then(httpBody);
};

const enabled = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.uri('admin', 'users', username, 'enabled'), {
    headers,
  }).then(httpBody);
};

// eslint-disable-next-line no-shadow
const enable = (conn, username, enabled, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'users', username, 'enabled'), {
    method: 'PUT',
    headers,
    body: JSON.stringify({ enabled }),
  }).then(httpMessage);
};

const setRoles = (conn, username, roles, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'users', username, 'roles'), {
    method: 'PUT',
    headers,
    body: JSON.stringify({ roles }),
  }).then(httpMessage);
};

const listRoles = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.uri('admin', 'users', username, 'roles'), {
    headers,
  }).then(httpBody);
};

// resource types: db, user, role, admin, metadata, named-graph, icv-constraints
// actions: CREATE, DELETE, READ, WRITE, GRANT, REVOKE, EXECUTE
const assignPermission = (conn, username, permission, params) => {
  const headers = conn.headers();
  const body = {
    action: permission.action,
    resource_type: permission.resourceType,
    resource: permission.resources,
  };
  return fetch(conn.uri('admin', 'permissions', 'user', username), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  }).then(httpMessage);
};

const deletePermission = (conn, username, permission, params) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  const body = {
    action: permission.action,
    resource_type: permission.resourceType,
    resource: permission.resources,
  };
  return fetch(conn.uri('admin', 'permissions', 'user', username, 'delete'), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(httpMessage);
};

const permissions = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.uri('admin', 'permissions', 'user', username), {
    headers,
  }).then(httpBody);
};

const effectivePermissions = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(
    conn.uri('admin', 'permissions', 'effective', 'user', username),
    {
      headers,
    }
  ).then(httpBody);
};

const superUser = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.uri('admin', 'users', username, 'superuser'), {
    headers,
  }).then(httpBody);
};

const deleteUser = (conn, username, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'users', username), {
    method: 'DELETE',
    headers,
  }).then(httpMessage);
};

module.exports = {
  list,
  get,
  create,
  changePassword,
  valid,
  enabled,
  enable,
  setRoles,
  listRoles,
  assignPermission,
  deletePermission,
  permissions,
  effectivePermissions,
  superUser,
  remove: deleteUser,
};
