import { Connection } from 'Connection';
import { RequestHeader } from './constants';

export interface BaseOptions {
  connection: Connection;
}

export interface RequestHeaders {
  [RequestHeader.ACCEPT]?: string;
  [RequestHeader.CONTENT_ENCODING]?: string;
  [RequestHeader.CONTENT_TYPE]?: string;
}

export interface BaseOptionsWithRequestHeaders extends BaseOptions {
  requestHeaders?: RequestHeaders;
}

export interface BaseDatabaseOptions extends BaseOptionsWithRequestHeaders {
  database: string;
}

export interface BaseDatabaseOptionsWithGraphUri extends BaseDatabaseOptions {
  graphUri?: string;
}

export interface BaseUserOptions extends BaseOptionsWithRequestHeaders {
  username: string;
}

export interface BaseRoleOptions extends BaseOptionsWithRequestHeaders {
  role: Role;
}

export interface BasePermissionOptions extends BaseOptionsWithRequestHeaders {
  permission: Permission;
}

export interface BaseVirtualGraphOptions extends BaseOptions {
  name: string;
}

export interface Permission {
  action: Action;
  resourceType: ResourceType;
  resources: string[];
}

export interface Role {
  name: string;
}

export type Action =
  | 'CREATE'
  | 'DELETE'
  | 'READ'
  | 'WRITE'
  | 'GRANT'
  | 'REVOKE'
  | 'EXECUTE';

export type ResourceType =
  | 'db'
  | 'user'
  | 'role'
  | 'admin'
  | 'metadata'
  | 'named-graph'
  | 'icv-constraints';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export interface JsonArray extends Array<JsonValue> {}
