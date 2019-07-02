import * as qs from 'querystring';
import { mimeType } from '../query/utils';
import { BaseDatabaseOptions, JsonValue } from '../types';
import { RequestHeader, RequestMethod, ContentType } from '../constants';
import {
  getFetchDispatcher,
  dispatchGenericFetch,
  GenericFetchParams,
} from '../request-utils';

export const executeQuery = ({
  connection,
  database,
  query,
  requestHeaders = {
    [RequestHeader.ACCEPT]: mimeType(query),
  },
  params = {},
}: BaseDatabaseOptions & {
  requestHeaders?: BaseDatabaseOptions['requestHeaders'] & {
    [RequestHeader.ACCEPT]: ReturnType<typeof mimeType> | string;
  };
  query: string;
  params?: JsonValue;
}) => {
  const dispatchFetch = getFetchDispatcher({
    allowedQueryParams: Object.keys(params),
  });

  return dispatchFetch({
    connection,
    method: RequestMethod.POST,
    body: qs.stringify({ query }),
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.CONTENT_TYPE]: ContentType.FORM_URLENCODED,
    },
    params: params as any,
    pathSuffix: `${database}/vcs/query`,
  });
};

const postAsPlainText = ({
  requestHeaders = {},
  ...args
}: GenericFetchParams) =>
  dispatchGenericFetch({
    ...args,
    method: RequestMethod.POST,
    requestHeaders: {
      ...requestHeaders,
      [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_PLAIN,
    },
  });

export const commit = ({
  connection,
  database,
  transactionId,
  commitMsg,
}: BaseDatabaseOptions & { transactionId: string; commitMsg: string }) =>
  postAsPlainText({
    connection,
    body: commitMsg,
    pathSuffix: `${database}/vcs/${transactionId}/commit_msg`,
  });

export const createTag = ({
  connection,
  database,
  revisionId,
  tagName,
}: BaseDatabaseOptions & { revisionId: string; tagName: string }) =>
  postAsPlainText({
    connection,
    body: `"tag:stardog:api:versioning:version:${revisionId}", "${tagName}"`,
    pathSuffix: `${database}/vcs/tags/create`,
  });

export const deleteTag = ({
  connection,
  database,
  tagName,
}: BaseDatabaseOptions & { tagName: string }) =>
  postAsPlainText({
    connection,
    body: tagName,
    pathSuffix: `${database}/vcs/tags/delete`,
  });

export const revert = ({
  connection,
  database,
  fromRevisionId,
  toRevisionId,
  logMsg,
}: BaseDatabaseOptions & {
  fromRevisionId: string;
  toRevisionId: string;
  logMsg: string;
}) =>
  postAsPlainText({
    connection,
    body: `"tag:stardog:api:versioning:version:${toRevisionId}", "tag:stardog:api:versioning:version:${fromRevisionId}", "${logMsg}"`,
    pathSuffix: `${database}/vcs/revert`,
  });
