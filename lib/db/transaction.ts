import { BaseDatabaseOptions } from 'types';
import { getFetchDispatcher } from 'requestUtils';
import { RequestMethod, RequestHeader, ContentType } from '../constants';

const dispatchDbFetch = getFetchDispatcher();

export const begin = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchDbFetch({
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
  dispatchDbFetch({
    connection,
    method: RequestMethod.POST,
    pathSuffix: `${database}/transaction/rolllback/${transactionId}`,
  });

export const commit = ({
  connection,
  database,
  transactionId,
}: BaseDatabaseOptions & { transactionId: string }) =>
  dispatchDbFetch({
    connection,
    method: RequestMethod.POST,
    pathSuffix: `${database}/transaction/commit/${transactionId}`,
  });
