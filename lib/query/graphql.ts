import { BaseDatabaseOptions, JsonValue } from '../types';
import { dispatchGenericFetch } from '../request-utils';
import { RequestMethod, RequestHeader, ContentType } from '../constants';

export namespace query.graphql {
  export const execute = ({
    connection,
    database,
    query,
    variables = {},
  }: BaseDatabaseOptions & {
    query: string;
    variables?: JsonValue;
  }) =>
    dispatchGenericFetch({
      connection,
      method: RequestMethod.POST,
      body: JSON.stringify({ query, variables }),
      requestHeaders: {
        [RequestHeader.CONTENT_TYPE]: ContentType.JSON,
      },
      pathSuffix: `${database}/graphql`,
    });

  export const listSchemas = ({ connection, database }: BaseDatabaseOptions) =>
    dispatchGenericFetch({
      connection,
      pathSuffix: `${database}/graphql/schemas`,
    });

  export const addSchema = ({
    connection,
    database,
    name,
    schema,
  }: BaseDatabaseOptions & { name: string; schema: string }) =>
    dispatchGenericFetch({
      connection,
      method: RequestMethod.PUT,
      body: schema,
      requestHeaders: {
        [RequestHeader.CONTENT_TYPE]: ContentType.GRAPHQL,
      },
      pathSuffix: `${database}/graphql/schemas/${name}`,
    });

  export const getSchema = ({
    connection,
    database,
    name,
  }: BaseDatabaseOptions & { name: string }) =>
    dispatchGenericFetch({
      connection,
      pathSuffix: `${database}/graphql/schemas/${name}`,
    });

  export const removeSchema = ({
    connection,
    database,
    name,
  }: BaseDatabaseOptions & { name: string }) =>
    dispatchGenericFetch({
      connection,
      method: RequestMethod.DELETE,
      pathSuffix: `${database}/graphql/schemas/${name}`,
    });

  export const clearSchemas = ({ connection, database }: BaseDatabaseOptions) =>
    dispatchGenericFetch({
      connection,
      method: RequestMethod.DELETE,
      pathSuffix: `${database}/graphql/schemas`,
    });
}
