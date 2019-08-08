/**
 * @module stardogjs.db
 */
import FormData from 'form-data';
import flat from 'flat';
import { get as getOptions } from './options';
import {
  BaseDatabaseOptions,
  BaseOptions,
  BaseDatabaseOptionsWithGraphUri,
  DeepPartial,
  RequestHeaders,
} from '../types';
import {
  RequestHeader,
  ContentType,
  RequestMethod,
  ALL_GRAPHS,
} from '../constants';
import dbopts from '../db/dbopts';
import { getFetchDispatcher } from '../request-utils';

const namespacesRequestOptionsToGet = { database: { namespaces: true } };
const dispatchAdminDbFetch = getFetchDispatcher({
  basePath: `admin/databases`,
  allowedQueryParams: ['graph-uri', 'to'],
});

const dispatchFetchWithGraphUri = getFetchDispatcher({
  allowedQueryParams: ['graph-uri'],
});

export const create = ({
  connection,
  database,
  databaseSettings = {},
  files = [] as { filename: string }[],
}: BaseDatabaseOptions & {
  databaseSettings?: DeepPartial<typeof dbopts>;
  files?: { filename: string }[];
}) => {
  const dbOptions = flat(databaseSettings);
  const body = new FormData();

  body.append(
    'root',
    JSON.stringify({
      dbname: database,
      options: dbOptions,
      files,
    })
  );

  return dispatchAdminDbFetch({
    connection,
    body: body as any, // form-data doesn't implement all `FormData` methods
    method: RequestMethod.POST,
    requestHeaders: body.getHeaders(), // node-fetch 2+ apparently doesn't copy over formData headers automatically: https://github.com/bitinn/node-fetch/issues/368
  });
};

export const drop = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchAdminDbFetch({
    connection,
    pathSuffix: database,
    method: RequestMethod.DELETE,
  });

export const getDatabase = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchFetchWithGraphUri({
    connection,
    pathSuffix: database,
  });

export const offline = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchAdminDbFetch({
    connection,
    pathSuffix: `${database}/offline`,
    method: RequestMethod.PUT,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
  });

export const online = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchAdminDbFetch({
    connection,
    pathSuffix: `${database}/online`,
    method: RequestMethod.PUT,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
  });

export const optimize = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchAdminDbFetch({
    connection,
    pathSuffix: `${database}/optimize`,
    method: RequestMethod.PUT,
  });

export const copy = ({
  connection,
  database,
  destination,
}: BaseDatabaseOptions & { destination: string }) =>
  dispatchAdminDbFetch({
    connection,
    pathSuffix: `${database}/copy`,
    method: RequestMethod.PUT,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
    params: {
      to: destination,
    },
  });

export const list = ({ connection }: BaseOptions) =>
  dispatchAdminDbFetch({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
  });

export const size = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchFetchWithGraphUri({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.TEXT_PLAIN,
    },
    pathSuffix: `${database}/size`,
  });

export const clear = ({
  connection,
  database,
  transactionId,
  graphUri,
}: BaseDatabaseOptionsWithGraphUri & { transactionId: string }): Promise<
  Response & { transactionId: string }
> => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchFetchWithGraphUri({
    connection,
    params,
    method: RequestMethod.POST,
    pathSuffix: `${database}/${transactionId}/clear`,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.TEXT_PLAIN,
    },
  }).then((res) => {
    const resClone: any = res.clone(); // just being safe, since we're mutating
    resClone.transactionId = transactionId;
    return resClone;
  });
};

export const add = ({
  connection,
  database,
  transactionId,
  content,
  graphUri,
  requestHeaders = {},
}: BaseDatabaseOptionsWithGraphUri & {
  transactionId: string;
  content: any;
}): Promise<Response & { transactionId: string }> => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  const headers: RequestHeaders = {
    [RequestHeader.ACCEPT]: ContentType.TEXT_PLAIN,
    [RequestHeader.CONTENT_TYPE]:
      requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.TEXT_PLAIN,
  };

  if (requestHeaders[RequestHeader.CONTENT_ENCODING]) {
    headers[RequestHeader.CONTENT_ENCODING] =
      requestHeaders[RequestHeader.CONTENT_ENCODING];
  }

  return dispatchFetchWithGraphUri({
    connection,
    params,
    method: RequestMethod.POST,
    body: content,
    requestHeaders: headers,
    pathSuffix: `${database}/${transactionId}/add`,
  }).then((res) => {
    const resClone: any = res.clone(); // just being safe, since we're mutating
    resClone.transactionId = transactionId;
    return resClone;
  });
};

export const remove = ({
  connection,
  database,
  transactionId,
  content,
  graphUri,
  requestHeaders = {},
}: BaseDatabaseOptionsWithGraphUri & {
  transactionId: string;
  content: any;
}): Promise<Response & { transactionId: string }> => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  const headers: RequestHeaders = {
    [RequestHeader.ACCEPT]: ContentType.TEXT_PLAIN,
    [RequestHeader.CONTENT_TYPE]:
      requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.TEXT_PLAIN,
  };

  if (requestHeaders[RequestHeader.CONTENT_ENCODING]) {
    headers[RequestHeader.CONTENT_ENCODING] =
      requestHeaders[RequestHeader.CONTENT_ENCODING];
  }

  return dispatchFetchWithGraphUri({
    connection,
    params,
    method: RequestMethod.POST,
    body: content,
    requestHeaders: headers,
    pathSuffix: `${database}/${transactionId}/remove`,
  }).then((res) => {
    const resClone: any = res.clone(); // just being safe, since we're mutating
    resClone.transactionId = transactionId;
    return resClone;
  });
};

export const namespaces = ({ connection, database }: BaseDatabaseOptions) =>
  getOptions({
    connection,
    database,
    optionsToGet: namespacesRequestOptionsToGet,
  }).then((res) => {
    const resClone = res.clone(); // just being safe, since we're mutating
    const originalJsonFn = resClone.json.bind(resClone);
    resClone.json = () =>
      originalJsonFn().then((json: { 'database.namespaces': string[] }) => {
        const namespaces = json['database.namespaces'] || [];
        return namespaces.reduce(
          (namespacesMap: { [key: string]: string }, namespace: string) => {
            const [key, value] = namespace.split('=');
            namespacesMap[key] = value;
            return namespacesMap;
          },
          {} as { [key: string]: string }
        );
      });

    return resClone;
  });

export const exportData = ({
  connection,
  database,
  graphUri = ALL_GRAPHS,
  requestHeaders = {},
}: BaseDatabaseOptionsWithGraphUri) =>
  dispatchFetchWithGraphUri({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]:
        requestHeaders[RequestHeader.ACCEPT] || ContentType.LD_JSON,
    },
    params: {
      'graph-uri': graphUri,
    },
    pathSuffix: `${database}/export`,
  });
