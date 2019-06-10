import { BaseDatabaseOptions } from '../types';
import { getFetchDispatcher } from '../request-utils';
import {
  RequestHeader,
  ContentType,
  RequestMethod,
  ResponseStatus,
} from '../constants';
import flat from 'flat';
import dbopts from '../db/dbopts';

const dispatchAdminDbFetch = getFetchDispatcher({
  basePath: `admin/databases`,
  allowedQueryParams: [],
});

export const get = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchAdminDbFetch({
    connection,
    method: RequestMethod.PUT,
    requestHeaders: {
      [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
    },
    pathSuffix: `${database}/options`,
    body: JSON.stringify(flat(dbopts, { safe: true })),
  }).then((res: Response) => {
    if (res.status === ResponseStatus.OK) {
      return {
        ...res,
        body: flat.unflatten(res.body),
      };
    }
    return res;
  });

export const set = ({
  connection,
  database,
  databaseOptions,
}: BaseDatabaseOptions & { databaseOptions: typeof dbopts }) =>
  dispatchAdminDbFetch({
    connection,
    method: RequestMethod.POST,
    requestHeaders: {
      [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
    },
    pathSuffix: `${database}/options`,
    body: JSON.stringify(flat(databaseOptions, { safe: true })),
  });
