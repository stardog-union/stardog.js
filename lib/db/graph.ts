import * as qs from 'querystring';
import {
  RequestHeader,
  ContentType,
  DEFAULT_GRAPH,
  RequestMethod,
} from '../constants';
import { getFetchDispatcher } from '../request-utils';
import { BaseDatabaseOptionsWithGraphUri } from '../types';

const dispatchFetchWithGraphUri = getFetchDispatcher({
  allowedQueryParams: ['graph-uri', DEFAULT_GRAPH],
});

export const getGraph = ({
  connection,
  database,
  graphUri = null,
  requestHeaders = {},
}: BaseDatabaseOptionsWithGraphUri) => {
  const queryString = qs.stringify(
    graphUri ? { graph: graphUri } : DEFAULT_GRAPH
  );
  return dispatchFetchWithGraphUri({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]:
        requestHeaders[RequestHeader.ACCEPT] || ContentType.LD_JSON,
    },
    pathSuffix: `${database}?${queryString}`,
  });
};

export const deleteGraph = ({
  connection,
  database,
  graphUri = null,
}: BaseDatabaseOptionsWithGraphUri) => {
  const queryString = qs.stringify(
    graphUri ? { graph: graphUri } : DEFAULT_GRAPH
  );
  return dispatchFetchWithGraphUri({
    connection,
    method: RequestMethod.DELETE,
    pathSuffix: `${database}?${queryString}`,
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
  const queryString = qs.stringify(
    graphUri ? { graph: graphUri } : DEFAULT_GRAPH
  );
  return dispatchFetchWithGraphUri({
    connection,
    method: requestMethod,
    body: graphData,
    requestHeaders: {
      [RequestHeader.CONTENT_TYPE]:
        requestHeaders[RequestHeader.CONTENT_TYPE] || ContentType.LD_JSON,
    },
    pathSuffix: `${database}?${queryString}`,
  });
};

export const putGraph = (
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
