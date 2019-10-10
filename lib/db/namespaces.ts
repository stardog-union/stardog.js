/**
 * @module stardogjs.db.namespaces
 */
import FormData from 'form-data';
import { BaseDatabaseOptions } from '../types';
import { RequestHeader, ContentType, RequestMethod } from '../constants';
import { dispatchGenericFetch } from '../request-utils';

export const get = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchGenericFetch({
    connection,
    pathSuffix: `${database}/namespaces`,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
  }).then((res) => {
    const resClone = res.clone();
    resClone.json = () =>
      res
        .json()
        .then((json: { namespaces: { prefix: string; name: string }[] }) =>
          json.namespaces.reduce(
            (memo, { prefix, name }) => ({
              ...memo,
              [prefix]: name,
            }),
            {} as { [prefix: string]: string }
          )
        );
    return resClone;
  });

export const add = ({
  connection,
  database,
  fileOrContents,
  options = {},
}: BaseDatabaseOptions & {
  fileOrContents: object | string;
  options?: { contentType?: ContentType };
}) => {
  let requestHeaders: Partial<Record<RequestHeader, any>> = {
    [RequestHeader.ACCEPT]: ContentType.JSON,
  };
  let body: string | FormData;

  if (typeof fileOrContents === 'string') {
    requestHeaders[RequestHeader.CONTENT_TYPE] =
      options.contentType || ContentType.TEXT_TURTLE;
    body = fileOrContents;
  } else {
    body = new FormData();
    body.append('upload', fileOrContents as any);
    requestHeaders = {
      ...requestHeaders,
      ...body.getHeaders(),
    };
  }

  return dispatchGenericFetch({
    body: body as any,
    connection,
    method: RequestMethod.POST,
    pathSuffix: `${database}/namespaces`,
    requestHeaders,
  });
};
