import { BaseDatabaseOptions } from 'types';
import { RequestHeader, ContentType, RequestMethod } from '../constants';
import { dispatchGenericFetch } from 'requestUtils';

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
  const formData = new FormData();
  formData.append('upload', fileContents, fileName);
  return dispatchGenericFetch({
    connection,
    method: RequestMethod.POST,
    body: formData,
    pathSuffix: `${database}/docs`,
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
