import { getFetchDispatcher } from '../request-utils';
import { RequestHeader, ContentType, RequestMethod } from '../constants';
import { BaseDatabaseOptions, BaseDatabaseOptionsWithGraphUri } from '../types';

// TODO: Confirm whether this is really necessary.
const jsonify = (res: Response) => {
  res.headers.set(RequestHeader.CONTENT_TYPE, ContentType.JSON);
  return res;
};

const dispatchFetchWithGraphUri = getFetchDispatcher({
  allowedQueryParams: ['graph-uri'],
});

export const consistency = ({
  connection,
  database,
  graphUri,
}: BaseDatabaseOptionsWithGraphUri) => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchFetchWithGraphUri({
    connection,
    pathSuffix: `${database}/reasoning/consistency`,
    params,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.TEXT_BOOLEAN,
    },
  });
};

// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
export const explainInference = ({
  connection,
  database,
  inference,
  requestHeaders = {},
}: BaseDatabaseOptions & { inference: string }) =>
  dispatchFetchWithGraphUri({
    connection,
    method: RequestMethod.POST,
    body: inference,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
      [RequestHeader.CONTENT_TYPE]:
        requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.TEXT_TURTLE,
    },
    pathSuffix: `${database}/reasoning/explain`,
  }).then(jsonify);

export const explainInconsistency = ({
  connection,
  database,
  graphUri,
}: BaseDatabaseOptionsWithGraphUri) => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchFetchWithGraphUri({
    connection,
    method: RequestMethod.POST,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
    params,
    pathSuffix: `${database}/reasoning/explain/inconsistency`,
  }).then(jsonify);
};

// contentType - application/x-turtle, text/turtle, application/rdf+xml, text/plain, application/x-trig, text/x-nquads, application/trix
export const explainInferenceInTransaction = ({
  connection,
  database,
  transactionId,
  inference,
  requestHeaders = {},
}: BaseDatabaseOptions & { transactionId: string; inference: string }) =>
  dispatchFetchWithGraphUri({
    connection,
    method: RequestMethod.POST,
    body: inference,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.CONTENT_TYPE]:
        requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.TEXT_TURTLE,
    },
    pathSuffix: `${database}/reasoning/${transactionId}/explain`,
  });

export const explainInconsistencyInTransaction = ({
  connection,
  database,
  transactionId,
  graphUri,
}: BaseDatabaseOptionsWithGraphUri & { transactionId: string }) => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchFetchWithGraphUri({
    connection,
    method: RequestMethod.POST,
    params,
    pathSuffix: `${database}/reasoning/${transactionId}/explain/inconsistency`,
  });
};

export const schema = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchFetchWithGraphUri({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.LD_JSON,
    },
    pathSuffix: `${database}/reasoning/schema`,
  });
