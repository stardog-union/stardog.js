const { fetch } = require('../fetch');
const { httpBody, httpMessage } = require('../response-transforms');

const create = (conn, role, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'roles'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ rolename: role.name }),
  }).then(httpMessage);
};

const list = (conn, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.uri('admin', 'roles'), {
    headers,
  }).then(httpBody);
};

const deleteRole = (conn, role, params) => {
  const headers = conn.headers();
  return fetch(conn.uri('admin', 'roles', role), {
    method: 'DELETE',
    headers,
  }).then(httpMessage);
};

const usersWithRole = (conn, role, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.uri('admin', 'roles', role, 'users'), {
    headers,
  }).then(httpBody);
};

// resource types: db, user, role, admin, metadata, named-graph, icv-constraints
// actions: CREATE, DELETE, READ, WRITE, GRANT, REVOKE, EXECUTE
const assignPermission = (conn, role, permission, params) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  const body = {
    action: permission.action,
    resource_type: permission.resourceType,
    resource: permission.resources,
  };
  return fetch(conn.uri('admin', 'permissions', 'role', role), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  }).then(httpBody);
};

const deletePermission = (conn, role, permission, params) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  const body = {
    action: permission.action,
    resource_type: permission.resourceType,
    resource: permission.resources,
  };
  return fetch(conn.uri('admin', 'permissions', 'role', role, 'delete'), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(httpMessage);
};

const permissions = (conn, role, params) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  return fetch(conn.uri('admin', 'permissions', 'role', role), {
    headers,
  }).then(httpBody);
};

module.exports = {
  create,
  list,
  remove: deleteRole,
  usersWithRole,
  assignPermission,
  deletePermission,
  permissions,
};
