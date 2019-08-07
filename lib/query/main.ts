import * as qs from 'querystring';
import { query as queryUtils } from './utils';
import { BaseDatabaseOptions, JsonValue, BaseOptions } from '../types';
import {
  QueryType,
  RequestMethod,
  RequestHeader,
  ContentType,
} from '../constants';
import { dispatchGenericFetch, getFetchDispatcher } from '../request-utils';

const dispatchAdminQueriesFetch = getFetchDispatcher({
  basePath: 'admin/queries',
});

const dispatchQuery = ({
  connection,
  database,
  query,
  params,
  transactionId,
  requestHeaders = {},
}: BaseDatabaseOptions & {
  query: string;
  params?: JsonValue;
  transactionId?: string;
}) => {
  const type = queryUtils.utils.queryType(query);
  const resource = type === QueryType.UPDATE ? 'update' : 'query';
  const acceptHeader =
    requestHeaders[RequestHeader.ACCEPT] || queryUtils.utils.mimeType(query);

  // TODO:
  // Paths queries will return duplicate variable names
  // in body.head.vars (#135)
  // e.g., `paths start ?x end ?y via ?p` will return
  // ['x', 'x', 'p', 'y', 'y']. Use of a Set here
  // simply eliminates the duplicates for things like Studio
  return dispatchGenericFetch({
    connection,
    method: RequestMethod.POST,
    body: qs.stringify({ query }),
    params: params as any,
    requestHeaders: {
      [RequestHeader.CONTENT_TYPE]: ContentType.FORM_URLENCODED,
      [RequestHeader.ACCEPT]: acceptHeader,
    },
    pathSuffix: `${database}/${
      transactionId ? `${transactionId}/` : ''
    }${resource}`,
  });
};

export namespace query {
  export const execute = (
    executeData: BaseDatabaseOptions & { query: string; params?: JsonValue }
  ) => dispatchQuery(executeData);

  export const executeInTransaction = (
    executeInTxData: BaseDatabaseOptions & {
      query: string;
      transactionId: string;
      params?: JsonValue;
    }
  ) => dispatchQuery(executeInTxData);

  export const property = ({
    connection,
    database,
    uri,
    property,
    params,
  }: BaseDatabaseOptions & {
    uri: string;
    property: string;
    params?: JsonValue;
  }) =>
    execute({
      connection,
      database,
      query: `select * where {
      ${uri} ${property} ?val
    }
    `,
      params,
    }).then((res) => {
      const resClone = res.clone(); // just being safe, since we're mutating
      const originalJsonFn = resClone.json.bind(resClone);
      resClone.json = () =>
        originalJsonFn().then((json: any) => {
          const bindings = (json.results || {}).bindings;
          if (bindings && bindings.length > 0) {
            return {
              body: bindings[0].val.value,
            };
          }
          return {};
        });
      return resClone;
    });

  export const explain = ({
    connection,
    database,
    query,
    requestHeaders = {},
    params,
  }: BaseDatabaseOptions & {
    query: string;
    params?: JsonValue;
  }) => {
    const { Accept = ContentType.TEXT_PLAIN } = requestHeaders;

    return dispatchGenericFetch({
      connection,
      method: RequestMethod.POST,
      body: qs.stringify({ query }),
      requestHeaders: {
        [RequestHeader.ACCEPT]: Accept,
        [RequestHeader.CONTENT_TYPE]: ContentType.FORM_URLENCODED,
      },
      params: params as any,
      pathSuffix: `${database}/explain`,
    });
  };

  export const list = ({ connection }: BaseOptions) =>
    dispatchAdminQueriesFetch({
      connection,
      requestHeaders: {
        [RequestHeader.ACCEPT]: ContentType.JSON,
      },
    });

  export const kill = ({
    connection,
    queryId,
  }: BaseOptions & { queryId: string }) =>
    dispatchAdminQueriesFetch({
      connection,
      method: RequestMethod.DELETE,
      pathSuffix: queryId,
    });

  export const get = ({
    connection,
    queryId,
  }: BaseOptions & { queryId: string }) =>
    dispatchAdminQueriesFetch({
      connection,
      requestHeaders: {
        [RequestHeader.ACCEPT]: ContentType.JSON,
      },
      pathSuffix: queryId,
    });
}
