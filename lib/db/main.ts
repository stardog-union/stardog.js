import FormData from 'form-data';
import flat from 'flat';
import lodashGet from 'lodash.get';
import { get as getOptions } from './options';
import {
  BaseDatabaseOptions,
  BaseOptions,
  BaseDatabaseOptionsWithGraphUri,
} from '../types';
import {
  RequestHeader,
  ContentType,
  RequestMethod,
  ALL_GRAPHS,
  ResponseStatus,
} from '../constants';
import dbopts from '../db/dbopts';
import { getFetchDispatcher } from '../request-utils';

const dispatchAdminDbFetch = getFetchDispatcher({
  basePath: `admin/databases`,
  allowedQueryParams: ['graph-uri', 'to'],
});

const dispatchFetchWithGraphUri = getFetchDispatcher({
  allowedQueryParams: ['graph-uri'],
});

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P] extends (infer U)[] ? DeepPartial<U>[] : T[P]
};

export const create = ({
  connection,
  database,
  databaseSettings,
  files = [] as { filename: string }[],
}: BaseDatabaseOptions & {
  databaseSettings: DeepPartial<typeof dbopts>;
  files: { filename: string }[];
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
    pathSuffix: `${database}/offine`,
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
}: BaseDatabaseOptionsWithGraphUri & { transactionId: string }) => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchFetchWithGraphUri({
    connection,
    params,
    method: RequestMethod.POST,
    pathSuffix: `${database}/${transactionId}/clear`,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.TEXT_PLAIN,
    },
  }).then((res) => ({
    ...res,
    transactionId,
  }));
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
}) => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchFetchWithGraphUri({
    connection,
    params,
    method: RequestMethod.POST,
    body: content,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.TEXT_PLAIN,
      [RequestHeader.CONTENT_TYPE]:
        requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.TEXT_PLAIN,
      [RequestHeader.CONTENT_ENCODING]:
        requestHeaders[RequestHeader.CONTENT_ENCODING],
    },
    pathSuffix: `${database}/${transactionId}/add`,
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
}) => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchFetchWithGraphUri({
    connection,
    params,
    method: RequestMethod.POST,
    body: content,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.TEXT_PLAIN,
      [RequestHeader.CONTENT_TYPE]:
        requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.TEXT_PLAIN,
      [RequestHeader.CONTENT_ENCODING]:
        requestHeaders[RequestHeader.CONTENT_ENCODING],
    },
    pathSuffix: `${database}/${transactionId}/remove`,
  });
};

export const namespaces = ({ connection, database }: BaseDatabaseOptions) =>
  getOptions({ connection, database }).then((res) => {
    if (res.status === ResponseStatus.OK) {
      const namespaces: string[] = lodashGet(
        res,
        'body.database.namespaces',
        []
      );
      const names = namespaces.reduce(
        (namespacesMap, namespace) => {
          const [key, value] = namespace.split('=');
          namespacesMap[key] = value;
          return namespacesMap;
        },
        {} as { [key: string]: string }
      );
      res.body = names;
    }
    return res;
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
