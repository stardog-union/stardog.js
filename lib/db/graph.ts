import qs from 'querystring';
import { BaseDatabaseOptions } from 'types';
import {
  RequestHeader,
  ContentType,
  DEFAULT_GRAPH,
  RequestMethod,
} from '../constants';

export interface BaseDatabaseOptionsWithGraphUri extends BaseDatabaseOptions {
  graphUri?: string;
}

export const doGet = ({
  connection,
  database,
  graphUri = null,
  requestHeaders = {},
}: BaseDatabaseOptionsWithGraphUri) => {
  const headers = connection.headers();
  headers.set(
    RequestHeader.ACCEPT,
    requestHeaders.accept || ContentType.LD_JSON
  );
  const resource = `${database}?${
    graphUri ? qs.stringify({ graph: graphUri }) : DEFAULT_GRAPH
  }`;

  return fetch(connection.request(resource), {
    headers,
  });
};

export const doDelete = ({
  connection,
  database,
  graphUri = null,
}: BaseDatabaseOptionsWithGraphUri) => {
  const headers = connection.headers();
  const resource = `${database}?${
    graphUri ? qs.stringify({ graph: graphUri }) : DEFAULT_GRAPH
  }`;

  return fetch(connection.request(resource), {
    headers,
    method: RequestMethod.DELETE,
  });
};

const submit = ({
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
  const headers = connection.headers();
  headers.set(
    RequestHeader.CONTENT_TYPE,
    requestHeaders.contentType || ContentType.LD_JSON
  );
  const resource = `${database}?${
    graphUri ? qs.stringify({ graph: graphUri }) : DEFAULT_GRAPH
  }`;

  return fetch(connection.request(resource), {
    headers,
    method: requestMethod,
    body: graphData,
  });
};

export const doPut = (
  putData: BaseDatabaseOptionsWithGraphUri & { graphData: string }
) =>
  submit({
    ...putData,
    requestMethod: RequestMethod.PUT,
  });

export const doPost = (
  postData: BaseDatabaseOptionsWithGraphUri & { graphData: string }
) =>
  submit({
    ...postData,
    requestMethod: RequestMethod.POST,
  });
