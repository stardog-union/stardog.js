import { getFetchDispatcher } from '../request-utils';
import { JsonPrimitive, BaseVirtualGraphOptions, BaseOptions } from '../types';
import { RequestHeader, ContentType, RequestMethod } from '../constants';

export interface MappingsRequestOptions {
  preferUntransformed?: boolean;
  syntax?: string;
}

const dispatchVgFetch = getFetchDispatcher({
  basePath: 'admin/virtual_graphs',
  allowedQueryParams: [],
});

const jsonContentTypeHeaders = {
  [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
};

export const list = ({ connection }: BaseOptions) =>
  dispatchVgFetch({
    connection,
  });

const dispatchAddOrUpdate = (
  {
    connection,
    name,
    mappings,
    options,
  }: BaseVirtualGraphOptions & {
    mappings: string;
    options: { [key: string]: JsonPrimitive };
  },
  method: RequestMethod,
  pathSuffix = ''
) =>
  dispatchVgFetch({
    connection,
    method,
    body: JSON.stringify({
      name,
      mappings,
      options,
    }),
    requestHeaders: jsonContentTypeHeaders,
    pathSuffix,
  });

export const add = (
  vgData: BaseVirtualGraphOptions & {
    mappings: string;
    options: { [key: string]: JsonPrimitive };
  }
) => dispatchAddOrUpdate(vgData, RequestMethod.POST);

export const update = (
  vgData: BaseVirtualGraphOptions & {
    mappings: string;
    options: { [key: string]: JsonPrimitive };
  }
) => dispatchAddOrUpdate(vgData, RequestMethod.PUT, name);

export const remove = ({ connection, name }: BaseVirtualGraphOptions) =>
  dispatchVgFetch({
    connection,
    method: RequestMethod.DELETE,
    pathSuffix: name,
  });

export const available = ({ connection, name }: BaseVirtualGraphOptions) =>
  dispatchVgFetch({
    connection,
    requestHeaders: {
      [RequestHeader.ACCEPT]: ContentType.JSON,
    },
    pathSuffix: `${name}/available`,
  });

export const options = ({ connection, name }: BaseVirtualGraphOptions) =>
  dispatchVgFetch({
    connection,
    pathSuffix: `${name}/options`,
  });

export const mappings = ({
  connection,
  name,
  requestOptions = {},
}: BaseVirtualGraphOptions & { requestOptions?: MappingsRequestOptions }) => {
  let pathSuffix = `${name}/mappings`;

  if (requestOptions.preferUntransformed) {
    // Try to get the mappings string that was last submitted, not the
    // transformed mappings. (If syntax doesn't match, however, you'll still
    // get generated mapptings.)
    const syntax = requestOptions.syntax || 'SMS2';
    pathSuffix = `${name}/mappingsString/${syntax}`;
  }

  return dispatchVgFetch({
    connection,
    pathSuffix,
  });
};
