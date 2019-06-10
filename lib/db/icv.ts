import { BaseDatabaseOptions, BaseDatabaseOptionsWithGraphUri } from 'types';
import { RequestHeader, ContentType, RequestMethod } from '../constants';
import { getFetchDispatcher } from 'request-utils';

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
  icvAxiom,
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  icvAxiom: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms: icvAxiom,
    resource: 'convert',
  });

export const validate = ({
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  constraints: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms: constraints,
    resource: 'validate',
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.TEXT_BOOLEAN,
    },
  });

export const validateInTx = ({
  transactionId,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  constraints: string;
  transactionId: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms: constraints,
    resource: `${transactionId}/validate`,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.TEXT_BOOLEAN,
    },
  });

export const violations = ({
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  constraints: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms: constraints,
    resource: 'violations',
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.ALL,
    },
  });

export const violationsInTx = ({
  transactionId,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  constraints: string;
  transactionId: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms: constraints,
    resource: `${transactionId}/violations`,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.ALL,
    },
  });

export const report = ({
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  constraints: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms: constraints,
    resource: 'report',
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.LD_JSON,
    },
  });

export const reportInTx = ({
  transactionId,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptionsWithGraphUri & {
  constraints: string;
  transactionId: string;
}) =>
  postIcv({
    ...icvRequestData,
    icvAxioms: constraints,
    resource: `${transactionId}/report`,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.ACCEPT]: ContentType.LD_JSON,
    },
  });
