import qs from 'querystring';
import { BaseDatabaseOptions, BaseOptionsWithRequestHeaders } from 'types';
import { RequestHeader, ContentType, RequestMethod } from '../constants';

export interface IcvParams {
  graphUri?: string;
}

export const get = ({ connection, database }: BaseDatabaseOptions) => {
  const headers = connection.headers();
  headers.set(RequestHeader.ACCEPT, ContentType.LD_JSON);
  return fetch(connection.request(database, 'icv'), {
    headers,
  });
};

export const clear = (connection, database) => {
  const headers = connection.headers();
  return fetch(connection.request(database, 'icv', 'clear'), {
    method: RequestMethod.POST,
    headers,
  });
};

export const getPathSuffix = ({
  suffixBase,
  params = {},
}: {
  suffixBase: string;
  params?: IcvParams;
}) =>
  !params.graphUri
    ? suffixBase
    : `${suffixBase}?${qs.stringify({ 'graph-uri': params.graphUri })}`;

const getFetchInit = ({
  connection,
  icvAxioms,
  requestHeaders = {},
}: BaseOptionsWithRequestHeaders & { icvAxioms: string }) => {
  const headers = connection.headers();
  headers.set(
    RequestHeader.CONTENT_TYPE,
    requestHeaders.contentType || ContentType.TEXT_TURTLE
  );
  if (requestHeaders.accept) {
    headers.set(RequestHeader.ACCEPT, requestHeaders.accept);
  }

  return {
    method: RequestMethod.POST,
    body: icvAxioms,
    headers,
  };
};

const postIcv = ({
  connection,
  icvAxioms,
  resource,
  requestHeaders = {},
}: BaseOptionsWithRequestHeaders & {
  icvAxioms: string;
  resource: string | Request;
}) => fetch(resource, getFetchInit({ connection, icvAxioms, requestHeaders }));

const postIcvWithGraphUri = ({
  suffixBase,
  connection,
  database,
  params = {},
  ...requestData
}: BaseDatabaseOptions & {
  params?: IcvParams;
  suffixBase: string;
  icvAxioms: string;
}) =>
  postIcv({
    ...requestData,
    connection,
    resource: connection.request(
      database,
      'icv',
      getPathSuffix({ suffixBase, params })
    ),
  });

export const add = ({
  connection,
  database,
  ...icvRequestData
}: BaseDatabaseOptions & {
  icvAxioms: string;
}) =>
  postIcv({
    ...icvRequestData,
    connection,
    resource: connection.request(database, 'icv', 'add'),
  });

export const remove = ({
  connection,
  database,
  ...icvRequestData
}: BaseDatabaseOptions & { icvAxioms: string }) =>
  postIcv({
    ...icvRequestData,
    connection,
    resource: connection.request(database, 'icv', 'remove'),
  });

export const convert = ({
  connection,
  icvAxiom,
  ...icvRequestData
}: BaseDatabaseOptions & {
  icvAxiom: string;
  params?: IcvParams;
}) =>
  postIcvWithGraphUri({
    ...icvRequestData,
    connection,
    icvAxioms: icvAxiom,
    suffixBase: 'convert',
  });

export const validate = ({
  connection,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptions & {
  constraints: string;
  params?: IcvParams;
}) =>
  postIcvWithGraphUri({
    ...icvRequestData,
    connection,
    icvAxioms: constraints,
    suffixBase: 'validate',
    requestHeaders: {
      ...requestHeaders,
      accept: ContentType.TEXT_BOOLEAN,
    },
  });

export const validateInTx = ({
  connection,
  transactionId,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptions & {
  constraints: string;
  transactionId: string;
  params?: IcvParams;
}) =>
  postIcvWithGraphUri({
    ...icvRequestData,
    connection,
    icvAxioms: constraints,
    suffixBase: `${transactionId}/validate`,
    requestHeaders: {
      ...requestHeaders,
      accept: ContentType.TEXT_BOOLEAN,
    },
  });

export const violations = ({
  connection,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptions & {
  constraints: string;
  params?: IcvParams;
}) =>
  postIcvWithGraphUri({
    ...icvRequestData,
    connection,
    icvAxioms: constraints,
    suffixBase: 'violations',
    requestHeaders: {
      ...requestHeaders,
      accept: ContentType.ALL,
    },
  });

export const violationsInTx = ({
  connection,
  transactionId,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptions & {
  constraints: string;
  transactionId: string;
  params?: IcvParams;
}) =>
  postIcvWithGraphUri({
    ...icvRequestData,
    connection,
    icvAxioms: constraints,
    suffixBase: `${transactionId}/violations`,
    requestHeaders: {
      ...requestHeaders,
      accept: ContentType.ALL,
    },
  });

export const report = ({
  connection,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptions & {
  constraints: string;
  params?: IcvParams;
}) =>
  postIcvWithGraphUri({
    ...icvRequestData,
    connection,
    icvAxioms: constraints,
    suffixBase: 'report',
    requestHeaders: {
      ...requestHeaders,
      accept: requestHeaders.accept || ContentType.LD_JSON,
    },
  });

export const reportInTx = ({
  connection,
  transactionId,
  constraints,
  requestHeaders = {},
  ...icvRequestData
}: BaseDatabaseOptions & {
  constraints: string;
  transactionId: string;
  params?: IcvParams;
}) =>
  postIcvWithGraphUri({
    ...icvRequestData,
    connection,
    icvAxioms: constraints,
    suffixBase: `${transactionId}/report`,
    requestHeaders: {
      ...requestHeaders,
      accept: requestHeaders.accept || ContentType.LD_JSON,
    },
  });
