/**
 * @module stardogjs.db.transaction
 */
import { BaseDatabaseOptions } from '../types';
import { dispatchGenericFetch } from '../request-utils';
import { RequestMethod, RequestHeader, ContentType } from '../constants';

export const begin = ({
  connection,
  database,
}: BaseDatabaseOptions): Promise<Response & { transactionId: string }> =>
  dispatchGenericFetch({
    connection,
    method: RequestMethod.POST,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.ALL,
    },
    pathSuffix: `${database}/transaction/begin`,
  }).then((res) => {
    const resClone: any = res.clone();
    return res.text().then((text) => {
      resClone.transactionId = text;
      return resClone;
    });
  });

export const rollback = ({
  connection,
  database,
  transactionId,
}: BaseDatabaseOptions & { transactionId: string }) =>
  dispatchGenericFetch({
    connection,
    method: RequestMethod.POST,
    pathSuffix: `${database}/transaction/rollback/${transactionId}`,
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
