import { BaseOptions, BaseUserOptions, BasePermissionOptions } from '../types';
import { getFetchDispatcher } from '../request-utils';
import { RequestMethod, RequestHeader, ContentType } from '../constants';

const dispatchUsersFetch = getFetchDispatcher({
  basePath: 'admin/users',
});
const dispatchPermissionsFetch = getFetchDispatcher({
  basePath: 'admin/permissions',
});

const jsonAcceptHeaders = {
  [RequestHeader.ACCEPT]: ContentType.JSON,
};
const jsonContentTypeHeaders = {
  [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
};

export const list = ({ connection }: BaseOptions) =>
  dispatchUsersFetch({
    connection,
  });

export const get = ({ connection, username }: BaseUserOptions) =>
  dispatchUsersFetch({
    connection,
    pathSuffix: username,
  });

export const create = ({
  connection,
  user: { name, password, superuser = false },
}: BaseOptions & {
  user: { name: string; password: string; superuser?: boolean };
}) =>
  dispatchUsersFetch({
    connection,
    method: RequestMethod.POST,
    body: JSON.stringify({
      username: name,
      password: password.split(''),
      superuser,
    }),
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
      [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
    },
  });

export const changePassword = ({
  connection,
  username,
  password,
}: BaseUserOptions & { password: string }) =>
  dispatchUsersFetch({
    connection,
    method: RequestMethod.PUT,
    body: JSON.stringify({ password }),
    requestHeaders: jsonAcceptHeaders,
    pathSuffix: `${username}/pwd`,
  }); // TODO: apply httpMessage?

export const valid = ({ connection }: BaseOptions) =>
  dispatchUsersFetch({
    connection,
    pathSuffix: 'valid',
  });

export const enabled = ({ connection, username }: BaseUserOptions) =>
  dispatchUsersFetch({
    connection,
    requestHeaders: jsonAcceptHeaders,
    pathSuffix: `${username}/enabled`,
  });

export const enable = ({
  connection,
  username,
  enabled,
}: BaseUserOptions & { enabled: boolean }) =>
  dispatchUsersFetch({
    connection,
    method: RequestMethod.PUT,
    body: JSON.stringify({ enabled }),
    pathSuffix: `${username}/enabled`,
  }); // TODO: apply httpMessage?

export const setRoles = ({
  connection,
  username,
  roles,
}: BaseUserOptions & { roles: string[] }) =>
  dispatchUsersFetch({
    connection,
    method: RequestMethod.PUT,
    body: JSON.stringify({ roles }),
    requestHeaders: jsonContentTypeHeaders,
    pathSuffix: `${username}/roles`,
  }); // TODO: apply httpMessage?

export const listRoles = ({ connection, username }: BaseUserOptions) =>
  dispatchUsersFetch({
    connection,
    requestHeaders: jsonAcceptHeaders,
    pathSuffix: `${username}/roles`,
  });

// resource types: db, user, role, admin, metadata, named-graph, icv-constraints
// actions: CREATE, DELETE, READ, WRITE, GRANT, REVOKE, EXECUTE
export const assignPermission = ({
  connection,
  username,
  permission: { action, resources, resourceType },
}: BaseUserOptions & BasePermissionOptions) =>
  dispatchPermissionsFetch({
    connection,
    method: RequestMethod.PUT,
    body: JSON.stringify({
      action,
      resource_type: resourceType,
      resource: resources,
    }),
    requestHeaders: jsonContentTypeHeaders,
    pathSuffix: `user/${username}`,
  });

export const deletePermission = ({
  connection,
  username,
  permission: { action, resources, resourceType },
}: BaseUserOptions & BasePermissionOptions) =>
  dispatchPermissionsFetch({
    connection,
    method: RequestMethod.POST,
    body: JSON.stringify({
      action,
      resource_type: resourceType,
      resource: resources,
    }),
    requestHeaders: jsonContentTypeHeaders,
    pathSuffix: `user/${username}/delete`,
  }); // TODO: httpMessage?

export const permissions = ({ connection, username }: BaseUserOptions) =>
  dispatchPermissionsFetch({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
    pathSuffix: `user/${username}`,
  });

export const effectivePermissions = ({
  connection,
  username,
}: BaseUserOptions) =>
  dispatchPermissionsFetch({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
    pathSuffix: `effective/user/${username}`,
  });

export const superUser = ({ connection, username }: BaseUserOptions) =>
  dispatchUsersFetch({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
    pathSuffix: `${username}/superuser`,
  });

export const deleteUser = ({ connection, username }: BaseUserOptions) =>
  dispatchUsersFetch({
    connection,
    method: RequestMethod.DELETE,
    pathSuffix: `${username}/superuser`,
  });
