/**
 * @module stardogjs.db.docs
 */
import FormData from 'form-data';
import { BaseDatabaseOptions } from '../types';
import { RequestHeader, ContentType, RequestMethod } from '../constants';
import { dispatchGenericFetch } from '../request-utils';

interface BaseDatabaseOptionsWithFileName extends BaseDatabaseOptions {
  fileName: string;
}

export const size = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchGenericFetch({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.TEXT_PLAIN,
    },
    pathSuffix: `${database}/docs/size`,
  });

export const clear = ({ connection, database }: BaseDatabaseOptions) =>
  dispatchGenericFetch({
    connection,
    method: RequestMethod.DELETE,
    pathSuffix: `${database}/docs`,
  });

export const add = ({
  connection,
  database,
  fileName,
  fileContents,
}: BaseDatabaseOptionsWithFileName & {
  fileContents: string;
}) => {
  // @ts-ignore: form-data types are wrong; options argument should be optional
  const formData = new FormData();
  formData.append('upload', fileContents, fileName);

  return dispatchGenericFetch({
    connection,
    method: RequestMethod.POST,
    body: formData as any, // form-data doesn't implement all `FormData` methods
    pathSuffix: `${database}/docs`,
    requestHeaders: formData.getHeaders(), // node-fetch 2+ apparently doesn't copy over formData headers automatically: https://github.com/bitinn/node-fetch/issues/368
  });
};

export const remove = async ({
  connection,
  database,
  fileName,
}: BaseDatabaseOptionsWithFileName) =>
  dispatchGenericFetch({
    connection,
    method: RequestMethod.DELETE,
    pathSuffix: `${database}/docs/${fileName}`,
  });

export const get = async ({
  connection,
  database,
  fileName,
}: BaseDatabaseOptionsWithFileName) =>
  dispatchGenericFetch({
    connection,
    pathSuffix: `${database}/docs/${fileName}`,
  });
