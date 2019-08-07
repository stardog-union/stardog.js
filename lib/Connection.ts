import { Headers, Request } from './fetch';
import { RequestHeader, ContentType } from './constants';

export interface ConnectionMeta {
  createHeaders?(headersHolder: { headers: Headers }): Headers;
  createRequest?(requestData: {
    uri: string;
    Request: typeof Request;
  }): string | Request;
}

export interface ConnectionConfig {
  endpoint: string;
  username: string;
  password: string;
  meta?: ConnectionMeta;
}

export class Connection {
  endpoint: string;
  username: string;
  password: string;
  meta?: ConnectionMeta;

  constructor(options: Partial<ConnectionConfig> = {}) {
    this.configure(options);
  }

  configure(options: Partial<ConnectionConfig>) {
    const config = {
      ...this,
      ...options,
    } as ConnectionConfig;

    // If the endpoint ends with '/', slice it off.
    if (
      config.endpoint &&
      config.endpoint.lastIndexOf('/') === config.endpoint.length - 1
    ) {
      config.endpoint = config.endpoint.slice(0, -1);
    }

    this.endpoint = config.endpoint;
    this.username = config.username;
    this.password = config.password;
    this.meta = config.meta;
  }

  headers() {
    const headers = new Headers();
    headers.set(
      RequestHeader.AUTHORIZATION,
      `Basic ${btoa(`${this.username}:${this.password}`)}`
    );
    headers.set(RequestHeader.ACCEPT, ContentType.ALL);

    if (this.meta && this.meta.createHeaders) {
      return this.meta.createHeaders({ headers });
    }

    return headers;
  }

  uri(...resource: string[]) {
    return `${this.endpoint}/${resource.filter(Boolean).join('/')}`;
  }

  request(...resource: string[]) {
    if (!this.meta || !this.meta.createRequest) {
      // We *could* just return a new Request from this method at all times (in
      // this case, just `new Request(this.uri(...resource))`), but,
      // unfortunately, `new Request` throws an error in Firefox if the URI
      // string includes credentials, which would plausibly count as a breaking
      // change to stardog.js. Something to consider for later, though.
      return this.uri(...resource);
    }

    return this.meta.createRequest({
      uri: this.uri(...resource),
      // The Request constructor is passed here as a convenience, since it will
      // vary based on whether this library is being used in Node-like or
      // browser-like environments.
      Request,
    });
  }
}
