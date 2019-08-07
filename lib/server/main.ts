import { getFetchDispatcher } from '../request-utils';
import { BaseOptions, JsonValue } from '../types';
import { RequestHeader, ContentType } from '../constants';

const dispatchAdminFetch = getFetchDispatcher({
  basePath: 'admin',
});

const jsonAcceptHeaders = {
  [RequestHeader.ACCEPT]: ContentType.JSON,
};

export namespace server {
  export const shutdown = ({ connection }: BaseOptions) =>
    dispatchAdminFetch({
      connection,
      requestHeaders: jsonAcceptHeaders,
      pathSuffix: 'shutdown',
    }); // TODO: httpMessage?

  export const status = ({
    connection,
    params,
  }: BaseOptions & { params?: JsonValue }) =>
    dispatchAdminFetch({
      connection,
      requestHeaders: jsonAcceptHeaders,
      pathSuffix: 'status',
      params: params as any,
    });
}
