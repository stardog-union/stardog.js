const { Headers, Request } = require('./fetch');
const base64 = require('isomorphic-base64');

class Connection {
  constructor(options = {}, meta) {
    this.config(options, meta);
  }

  // The (optional) `meta` argument is useful if the user wants to override the
  // ordinary creation of fetch requests or headers for a connection. Fetch
  // request creation can be overriden by providing a `createRequest` method on
  // `meta`, and header creation can be overriden with `createHeaders`.
  config(options, meta) {
    const config = Object.assign({}, this, options, { meta });

    // If it ends with / slice it off
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
      'Authorization',
      `Basic ${base64.btoa(`${this.username}:${this.password}`)}`
    );
    headers.set('Accept', '*/*');

    if (this.meta && this.meta.createHeaders) {
      return this.meta.createHeaders({ headers });
    }

    return headers;
  }

  uri(...resource) {
    return `${this.endpoint}/${resource.join('/')}`;
  }

  request(...resource) {
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

module.exports = Connection;
