import { getFetchDispatcher } from 'requestUtils';
import { BaseDatabaseOptionsWithGraphUri } from 'db/graph';
import { RequestHeader, ContentType, RequestMethod } from '../constants';
import { BaseDatabaseOptions } from 'types';

// TODO: Confirm whether this is really necessary.
const jsonify = (res: Response) => {
  res.headers.set(RequestHeader.CONTENT_TYPE, ContentType.JSON);
  return res;
};

const dispatchDbFetch = getFetchDispatcher({
  allowedQueryParams: ['graph-uri'],
});

export const consistency = ({
  connection,
  database,
  graphUri,
}: BaseDatabaseOptionsWithGraphUri) => {
  const params = graphUri ? { 'graph-uri': graphUri } : null;
  return dispatchDbFetch({
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
  dispatchDbFetch({
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
  return dispatchDbFetch({
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
  dispatchDbFetch({
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
  return dispatchDbFetch({
    connection,
    method: RequestMethod.POST,
    params,
    pathSuffix: `${database}/reasoning/${transactionId}/explain/inconsistency`,
  });
};

export const schema = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchDbFetch({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.LD_JSON,
    },
    pathSuffix: `${database}/reasoning/schema`,
  });
