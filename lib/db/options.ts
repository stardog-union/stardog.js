/**
 * @module stardogjs.db.options
 */
import { BaseDatabaseOptions, DeepPartial, BaseOptions } from '../types';
import { getFetchDispatcher } from '../request-utils';
import { RequestHeader, ContentType, RequestMethod } from '../constants';
import flat from 'flat';
import dbopts from '../db/dbopts';

const dispatchAdminDbFetch = getFetchDispatcher({
  basePath: 'admin/databases',
  allowedQueryParams: [],
});
const dispatchConfigPropertiesFetch = getFetchDispatcher({
  basePath: 'admin/config_properties',
  allowedQueryParams: [],
});

export const get = ({
  connection,
  database,
  optionsToGet = dbopts,
  method = RequestMethod.PUT,
}: BaseDatabaseOptions & {
  optionsToGet?: DeepPartial<typeof dbopts>;
  method?: RequestMethod;
}) => {
  const fetchOptions: Parameters<typeof dispatchAdminDbFetch>[0] = {
    connection,
    method,
    requestHeaders: {
      [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
    },
    pathSuffix: `${database}/options`,
  };

  if (optionsToGet) {
    fetchOptions.body = JSON.stringify(flat(optionsToGet, { safe: true }));
  }

  return dispatchAdminDbFetch(fetchOptions);
  // .then((res) => {
  //   if (res.status === ResponseStatus.OK) {
  //     return {
  //       ...res,
  //       body: flat.unflatten(res.body),
  //     };
  //   }
  //   return res;
  // });
};

export const set = ({
  connection,
  database,
  databaseOptions,
}: BaseDatabaseOptions & { databaseOptions: DeepPartial<typeof dbopts> }) =>
  dispatchAdminDbFetch({
    connection,
    method: RequestMethod.POST,
    requestHeaders: {
      [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
    },
    pathSuffix: `${database}/options`,
    body: JSON.stringify(flat(databaseOptions, { safe: true })),
  });

export const getAll = ({ connection, database }: Parameters<typeof get>[0]) =>
  get({
    connection,
    database,
    optionsToGet: null,
    method: RequestMethod.GET,
  });

export const getAvailable = ({ connection }: BaseOptions) =>
  dispatchConfigPropertiesFetch({
    connection,
    method: RequestMethod.GET,
    requestHeaders: {
      [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
    },
  });
