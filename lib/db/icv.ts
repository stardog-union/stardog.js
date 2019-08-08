/**
 * @module stardogjs.db.icv
 */
import { BaseDatabaseOptions, BaseDatabaseOptionsWithGraphUri } from '../types';
import { RequestHeader, ContentType, RequestMethod } from '../constants';
import { getFetchDispatcher } from '../request-utils';

const dispatchFetchWithGraphUri = getFetchDispatcher({
  allowedQueryParams: ['graph-uri'],
});

export const get = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchFetchWithGraphUri({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.LD_JSON,
    },
    pathSuffix: `${database}/icv`,
  });

export const clear = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchFetchWithGraphUri({
    connection,
    method: RequestMethod.POST,
    pathSuffix: `${database}/icv/clear`,
  });

const postIcv = ({
  connection,
  database,
  icvAxioms,
  resource,
  graphUri,
  requestHeaders = {},
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxioms: string;
  resource: string | Request;
}) => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchFetchWithGraphUri({
    connection,
    method: RequestMethod.POST,
    body: icvAxioms,
    params,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.CONTENT_TYPE]:
        requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.TEXT_TURTLE,
    },
    pathSuffix: `${database}/icv/${resource}`,
  });
};

export const add = (
  icvRequestData: BaseDatabaseOptions & {
    icvAxioms: string;
  }
) =>
  postIcv({
    ...icvRequestData,
    resource: 'add',
  });

export const remove = (
  icvRequestData: BaseDatabaseOptions & { icvAxioms: string }
) =>
  postIcv({
    ...icvRequestData,
    resource: 'remove',
  });

export const convert = ({
  icvAxioms,
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxioms: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms,
    resource: 'convert',
  });

export const validate = ({
  icvAxioms,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxioms: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms,
    resource: 'validate',
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.TEXT_BOOLEAN,
    },
  });

export const validateInTx = ({
  transactionId,
  icvAxioms,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxioms: string;
  transactionId: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms,
    resource: `${transactionId}/validate`,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.TEXT_BOOLEAN,
    },
  });

export const violations = ({
  icvAxioms,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxioms: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms,
    resource: 'violations',
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.ALL,
    },
  });

export const violationsInTx = ({
  transactionId,
  icvAxioms,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxioms: string;
  transactionId: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms,
    resource: `${transactionId}/violations`,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.ALL,
    },
  });

export const report = ({
  icvAxioms,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxioms: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms,
    resource: 'report',
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.LD_JSON,
    },
  });

export const reportInTx = ({
  transactionId,
  icvAxioms,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxioms: string;
  transactionId: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms,
    resource: `${transactionId}/report`,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.LD_JSON,
    },
  });
