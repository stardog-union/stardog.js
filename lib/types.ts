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
