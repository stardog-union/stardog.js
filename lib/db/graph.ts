import {
  RequestHeader,
  ContentType,
  DEFAULT_GRAPH,
  RequestMethod,
} from '../constants';
import { getFetchDispatcher } from 'requestUtils';
import { BaseDatabaseOptionsWithGraphUri } from 'types';

const dispatchFetchWithGraphUri = getFetchDispatcher({
  allowedQueryParams: ['graph-uri', DEFAULT_GRAPH],
});

export const getGraph = ({
  connection,
  database,
  graphUri = null,
  requestHeaders = {},
}: BaseDatabaseOptionsWithGraphUri) => {
  const params = graphUri ? { 'graph-uri': graphUri } : { [DEFAULT_GRAPH]: '' };
  return dispatchFetchWithGraphUri({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]:
        requestHeaders[RequestHeader.ACCEPT] || ContentType.LD_JSON,
    },
    params,
    pathSuffix: database,
  });
};

export const deleteGraph = ({
  connection,
  database,
  graphUri = null,
}: BaseDatabaseOptionsWithGraphUri) => {
  const params = graphUri ? { 'graph-uri': graphUri } : { [DEFAULT_GRAPH]: '' };
  return dispatchFetchWithGraphUri({
    connection,
    method: RequestMethod.DELETE,
    params,
    pathSuffix: database,
  });
};

const submitJson = ({
  connection,
  database,
  graphData,
  requestMethod,
  graphUri = null,
  requestHeaders = {},
}: BaseDatabaseOptionsWithGraphUri & {
  graphData: string;
  requestMethod: RequestMethod;
}) => {
  const params = graphUri ? { 'graph-uri': graphUri } : { [DEFAULT_GRAPH]: '' };
  return dispatchFetchWithGraphUri({
    connection,
    method: requestMethod,
    body: graphData,
    requestHeaders: {
      [RequestHeader.CONTENT_TYPE]:
        requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.LD_JSON,
    },
    params,
    pathSuffix: database,
  });
};

export const setGraph = (
  putData: BaseDatabaseOptionsWithGraphUri & { graphData: string }
) =>
  submitJson({
    ...putData,
    requestMethod: RequestMethod.PUT,
  });

export const appendToGraph = (
  postData: BaseDatabaseOptionsWithGraphUri & { graphData: string }
) =>
  submitJson({
    ...postData,
    requestMethod: RequestMethod.POST,
  });
