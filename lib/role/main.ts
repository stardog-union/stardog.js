import { getFetchDispatcher } from '../request-utils';
import { BaseOptions, BaseRoleOptions, BasePermissionOptions } from '../types';
import { RequestHeader, ContentType, RequestMethod } from '../constants';

const dispatchRolesFetch = getFetchDispatcher({
  basePath: 'admin/roles',
  allowedQueryParams: [],
});
const dispatchPermissionsFetch = getFetchDispatcher({
  basePath: 'admin/permissions',
  allowedQueryParams: [],
});

const jsonAcceptHeaders = {
  [RequestHeader.ACCEPT]: ContentType.JSON,
};
const jsonContentTypeHeaders = {
  [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
};

export namespace role {
  export const create = ({ connection, role }: BaseRoleOptions) =>
    dispatchRolesFetch({
      connection,
      method: RequestMethod.POST,
      body: JSON.stringify({ rolename: role.name }),
      requestHeaders: jsonContentTypeHeaders,
    });

  export const list = ({ connection }: BaseOptions) =>
    dispatchRolesFetch({
      connection,
      requestHeaders: jsonAcceptHeaders,
    });

  export const deleteRole = ({ connection, role }: BaseRoleOptions) =>
    dispatchRolesFetch({
      connection,
      method: RequestMethod.DELETE,
      pathSuffix: role.name,
    });

  export const usersWithRole = ({ connection, role }: BaseRoleOptions) =>
    dispatchRolesFetch({
      connection,
      requestHeaders: jsonAcceptHeaders,
      pathSuffix: `${role.name}/users`,
    });

  // resource types: db, user, role, admin, metadata, named-graph, icv-constraints, virtual-graph
  // actions: CREATE, DELETE, READ, WRITE, GRANT, REVOKE, EXECUTE
  export const assignPermission = ({
    connection,
    role,
    permission,
  }: BaseRoleOptions & BasePermissionOptions) =>
    dispatchPermissionsFetch({
      connection,
      method: RequestMethod.PUT,
      body: JSON.stringify({
        action: permission.action,
        resource_type: permission.resourceType,
        resource: permission.resources,
      }),
      requestHeaders: jsonContentTypeHeaders,
      pathSuffix: `role/${role.name}`,
    });

  export const deletePermission = ({
    connection,
    role,
    permission,
  }: BaseRoleOptions & BasePermissionOptions) =>
    dispatchPermissionsFetch({
      connection,
      method: RequestMethod.POST,
      body: JSON.stringify({
        action: permission.action,
        resource_type: permission.resourceType,
        resource: permission.resources,
      }),
      requestHeaders: jsonContentTypeHeaders,
      pathSuffix: `role/${role.name}/delete`,
    });

  export const permissions = ({ connection, role }: BaseRoleOptions) =>
    dispatchPermissionsFetch({
      connection,
      requestHeaders: jsonAcceptHeaders,
      pathSuffix: `role/${role.name}`,
    });
}
