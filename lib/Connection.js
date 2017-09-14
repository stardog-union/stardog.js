const { Headers } = require('./fetch');
const base64 = require('isomorphic-base64');

class Connection {
  constructor(options = {}) {
    this.config(options);
  }

  config(options) {
    const config = Object.assign({}, this, options);

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
  }

  headers() {
    const headers = new Headers();
    headers.set(
      'Authorization',
      `Basic ${base64.btoa(`${this.username}:${this.password}`)}`
    );
    headers.set('Accept', '*/*');
    return headers;
  }

  uri(...resource) {
    return `${this.endpoint}/${resource.join('/')}`;
  }
}

module.exports = Connection;
