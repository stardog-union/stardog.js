/**
 * @module stardogjs.storedFunction
 */
import { getFetchDispatcher } from '../request-utils';
import { BaseOptions } from '../types';
import { RequestMethod } from '../constants';

const dispatchStoredFunctionsFetch = getFetchDispatcher({
  basePath: 'admin/functions/stored',
  allowedQueryParams: ['name'],
});

export const add = ({
  connection,
  functions,
}: BaseOptions & { functions: string }) =>
  dispatchStoredFunctionsFetch({
    connection,
    method: RequestMethod.POST,
    body: functions,
  });

export const get = ({ connection, name }: BaseOptions & { name: string }) =>
  dispatchStoredFunctionsFetch({
    connection,
    params: {
      name,
    },
  });

export const remove = ({ connection, name }: BaseOptions & { name: string }) =>
  dispatchStoredFunctionsFetch({
    connection,
    method: RequestMethod.DELETE,
    params: {
      name,
    },
  });

export const clear = ({ connection }: BaseOptions) =>
  dispatchStoredFunctionsFetch({
    connection,
    method: RequestMethod.DELETE,
  });

export const getAll = ({ connection }: BaseOptions) =>
  dispatchStoredFunctionsFetch({
    connection,
  });
