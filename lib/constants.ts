export const enum ContentType {
  ALL = '*/*',
  FORM_URLENCODED = 'application/x-www-form-urlencoded',
  GRAPHQL = 'application/graphql',
  JSON = 'application/json',
  LD_JSON = 'application/ld+json',
  MULTIPART_FORM_DATA = 'multipart/form-data',
  SPARQL_RESULTS_JSON = 'application/sparql-results+json',
  TEXT_PLAIN = 'text/plain',
  TEXT_TURTLE = 'text/turtle',
  TEXT_BOOLEAN = 'text/boolean',
}

export const enum RequestHeader {
  ACCEPT = 'Accept',
  AUTHORIZATION = 'Authorization',
  CONTENT_TYPE = 'Content-Type',
  CONTENT_ENCODING = 'Content-Encoding',
}

export const enum RequestMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
}

export const enum ResponseStatus {
  OK = 200,
}

export const enum QueryType {
  SELECT = 'select',
  ASK = 'ask',
  CONSTRUCT = 'construct',
  DESCRIBE = 'describe',
  UPDATE = 'update',
  PATHS = 'paths',
}

export const DEFAULT_GRAPH = 'default';
export const ALL_GRAPHS = 'tag:stardog:api:context:all';
