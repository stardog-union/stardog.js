const { fetch } = require('../fetch');
const { httpBody, httpMessage } = require('../response-transforms');

const list = (conn, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'users'), {
    headers,
  }).then(httpBody);
};

const listInfo = (conn, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'users', 'list'), {
    headers,
  }).then(httpBody);
};

const get = (conn, username, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'users', username), {
    headers,
  }).then(httpBody);
};

const create = (conn, user, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');

  const body = {
    username: user.username,
    password: user.password.split(''),
    superuser: typeof user.superuser === 'boolean' ? user.superuser : false,
  };

  return fetch(conn.request('admin', 'users'), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(httpBody);
};

const changePassword = (conn, username, currentPassword, password, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  const body = {
    current_password: currentPassword,
    password,
  };

  return fetch(conn.request('admin', 'users', username, 'pwd'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  }).then(httpMessage);
};

const valid = (conn, params) => {
  const headers = conn.headers();

  return fetch(conn.request('admin', 'users', 'valid'), {
    headers,
  }).then(httpBody);
};

const enabled = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'users', username, 'enabled'), {
    headers,
  }).then(httpBody);
};

// eslint-disable-next-line no-shadow
const enable = (conn, username, enabled, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'users', username, 'enabled'), {
    method: 'PUT',
    headers,
    body: JSON.stringify({ enabled }),
  }).then(httpMessage);
};

const setRoles = (conn, username, roles, params) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'users', username, 'roles'), {
    method: 'PUT',
    headers,
    body: JSON.stringify({ roles }),
  }).then(httpMessage);
};

const assignRole = (conn, username, role, params) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  return fetch(conn.request('admin', 'users', username, 'roles'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ rolename: role }),
  }).then(httpBody);
};

const listRoles = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'users', username, 'roles'), {
    headers,
  }).then(httpBody);
};

// resource types: db, user, role, admin, metadata, named-graph, icv-constraints
// actions: CREATE, DELETE, READ, WRITE, GRANT, REVOKE, EXECUTE
const assignPermission = (conn, username, permission, params) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  const body = {
    action: permission.action,
    resource_type: permission.resourceType,
    resource: permission.resources,
  };
  return fetch(conn.request('admin', 'permissions', 'user', username), {
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
  return fetch(
    conn.request('admin', 'permissions', 'user', username, 'delete'),
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
  ).then(httpMessage);
};

const permissions = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.request('admin', 'permissions', 'user', username), {
    headers,
  }).then(httpBody);
};

const effectivePermissions = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(
    conn.request('admin', 'permissions', 'effective', 'user', username),
    {
      headers,
    }
  ).then(httpBody);
};

const superUser = (conn, username, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'users', username, 'superuser'), {
    headers,
  }).then(httpBody);
};

const deleteUser = (conn, username, params) => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'users', username), {
    method: 'DELETE',
    headers,
  }).then(httpMessage);
};

const token = conn => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'token'), {
    headers,
  }).then(httpBody);
};

const whoAmI = conn => {
  const headers = conn.headers();
  return fetch(conn.request('admin', 'status', 'whoami'), {
    headers,
  }).then(httpBody);
};

module.exports = {
  assignRole,
  assignPermission,
  changePassword,
  create,
  deletePermission,
  effectivePermissions,
  enable,
  enabled,
  get,
  listRoles,
  list,
  listInfo,
  permissions,
  remove: deleteUser,
  setRoles,
  superUser,
  token,
  valid,
  whoAmI,
};
