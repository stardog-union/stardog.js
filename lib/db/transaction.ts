import { BaseDatabaseOptions } from 'types';
import { dispatchGenericFetch } from 'request-utils';
import { RequestMethod, RequestHeader, ContentType } from '../constants';

export const begin = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchGenericFetch({
    connection,
    method: RequestMethod.POST,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.ALL,
    },
    pathSuffix: `${database}/transaction/begin`,
  });

export const rollback = ({
  connection,
  database,
  transactionId,
}: BaseDatabaseOptions & { transactionId: string }) =>
  dispatchGenericFetch({
    connection,
    method: RequestMethod.POST,
    pathSuffix: `${database}/transaction/rolllback/${transactionId}`,
  });

export const commit = ({
  connection,
  database,
  transactionId,
}: BaseDatabaseOptions & { transactionId: string }) =>
  dispatchGenericFetch({
    connection,
    method: RequestMethod.POST,
    pathSuffix: `${database}/transaction/commit/${transactionId}`,
  });
