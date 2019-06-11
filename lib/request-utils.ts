import { fetch } from './fetch';
import qs from 'querystring';
import { RequestMethod } from './constants';
import {
  BaseOptionsWithRequestHeaders,
  BaseOptions,
  RequestHeaders,
} from './types';

const getRequestInit = ({
  connection,
  method = RequestMethod.GET,
  body,
  requestHeaders,
}: BaseOptionsWithRequestHeaders & {
  method?: RequestMethod;
  body?: any;
}): RequestInit => {
  const headers = connection.headers();

  if (requestHeaders) {
    Object.keys(requestHeaders).forEach((headerKey: keyof RequestHeaders) =>
      headers.set(headerKey, requestHeaders[headerKey])
    );
  }

  return {
    method,
    body,
    headers,
  };
};

// Uses the provided connection, basePath, pathSuffix (if any), params (if
// any), and map of allowed query params (if any) to construct and return a
// complete Stardog resource URL, including the connection's endpoint URL, the
// base path, the path suffix (if any), and a query string containing any
// allowed query params found on `params`.
const getRequestInfo = <T>({
  connection,
  basePath,
  pathSuffix,
  allowedParamsMap,
  params,
}: BaseOptions & {
  basePath: string;
  pathSuffix: string;
  allowedParamsMap: null | { [K in keyof T]?: boolean };
  params: T;
}): RequestInfo => {
  if (!params) {
    // No params, so nothing to do.
    return connection.request(basePath, pathSuffix);
  }

  if (!allowedParamsMap) {
    // No restrictions specified, so all params allowed.
    const queryString = qs.stringify(params);
    return connection.request(
      basePath,
      `${pathSuffix}${queryString ? `?${queryString}` : ''}`
    );
  }

  const paramsKeys: (keyof T)[] = Object.keys(params) as any;

  if (paramsKeys.length === 0) {
    // Empty params objects, so also nothing to do. (Not checked earlier to avoid unnecessary computation.)
    return connection.request(basePath, pathSuffix);
  }

  const queryParamsMap: { [K in keyof T]: string } = paramsKeys.reduce(
    (paramsMap, param) => {
      if (!allowedParamsMap[param]) {
        return paramsMap;
      }
      paramsMap[param] = params[param];
      return paramsMap;
    },
    {} as any
  );
  const queryString = qs.stringify(queryParamsMap);

  return connection.request(
    basePath,
    `${pathSuffix}${queryString ? `?${queryString}` : ''}`
  );
};

// Returns a function that can be used to call `fetch` with a predefined base
// URL and with certain other tedious tasks automated. For example, the
// function converts `params` objects to query strings (filtering out query
// params that are not allowed), converts the provided map of request headers to
// a `Headers` instance, prepends the connection's `endpoint` URL and the
// defined `basePath` to the `fetch` URL, and so on.
export const getFetchDispatcher = <T extends string>({
  basePath = '',
  allowedQueryParams,
}: {
  basePath?: string;
  allowedQueryParams?: T[];
} = {}) => {
  // Construct a map for quick look-ups.
  const allowedParamsMap = !allowedQueryParams
    ? null
    : allowedQueryParams.reduce(
        (paramsMap, param) => {
          paramsMap[param] = true;
          return paramsMap;
        },
        {} as { [K in T]?: boolean }
      );

  return ({
    connection,
    method = RequestMethod.GET,
    body,
    requestHeaders,
    params,
    pathSuffix = '',
  }: BaseOptionsWithRequestHeaders & {
    method?: RequestMethod;
    body?: RequestInit['body'];
    params?: typeof allowedQueryParams extends void[]
      ? never
      : { [K in T]?: string };
    pathSuffix?: string;
  }) =>
    fetch(
      getRequestInfo({
        connection,
        basePath,
        pathSuffix,
        allowedParamsMap: allowedParamsMap as any,
        params,
      }),
      getRequestInit({ connection, method, body, requestHeaders })
    );
};

export const dispatchGenericFetch = getFetchDispatcher();
export type GenericFetchParams = Parameters<typeof dispatchGenericFetch>[0];
