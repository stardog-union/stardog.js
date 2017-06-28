const { fetch, Headers } = require('fetch-ponyfill')();
const base64 = require('isomorphic-base64');
const qs = require('querystring');
const _ = require('lodash');
const flat = require('flat');
// TODO: what to do about native FormData in the browser? Might need two index files and do DI
const FormData = require('form-data');
const pkg = require('../package.json');
const DB_OPTIONS = require('./dbopts');

const DEFAULTS = {
  reasoning: false,
};

const Stardog = {
  version: pkg.version,
};

const uri = (...args) => args.join('/');
const HTTPMessage = res => ({
  status: res.status,
  statusText: res.statusText,
});
const ResponseBody = res => {
  const contentType = res.headers.get('content-type');
  // TODO:
  // I'll need to look at this again because the response isn't always application/json
  if (contentType && contentType.indexOf('json') > -1) {
    return res.json().then(result => {
      return {
        result,
        status: res.status,
        statusText: res.statusText,
      };
    });
  } else {
    return res.text().then(result => {
      return {
        result,
        status: res.status,
        statusText: res.statusText,
      };
    });
  }
};

const AuthorizationHeaders = (username, password) => {
  const headers = new Headers();
  headers.append(
    'Authorization',
    'Basic ' + base64.btoa(username + ':' + password)
  );
  headers.append('Accept', '*/*');
  return headers;
};

class Connection {
  constructor(options = {}) {
    this.config(options);
  }

  config(options) {
    const config = Object.assign({}, DEFAULTS, this, options);

    // If it ends with / slice it off
    if (
      config.endpoint &&
      config.endpoint.lastIndexOf('/') === config.endpoint.length - 1
    ) {
      config.endpoint = config.endpoint.slice(0, -1);
    }

    this.endpoint = config.endpoint;
    this.reasoning = config.reasoning;
    this.username = config.username;
    this.password = config.password;
    this.database = config.database;
  }

  createDB(database, databaseOptions, options, params) {
    const headers = AuthorizationHeaders(this.username, this.password);
    const dbOptions = flat(databaseOptions);

    const body = new FormData();
    body.append(
      'root',
      JSON.stringify({
        dbname: database,
        options: dbOptions,
        files: options.files,
      })
    );

    return fetch(uri(this.endpoint, 'admin/databases'), {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
    }).then(HTTPMessage);
  }

  dropDB(database, params) {
    const headers = AuthorizationHeaders(this.username, this.password);
    return fetch(uri(this.endpoint, 'admin', 'databases', database), {
      method: 'DELETE',
      headers,
    }).then(HTTPMessage);
  }

  getDB(database, params) {
    const headers = AuthorizationHeaders(this.username, this.password);
    return fetch(uri(this.endpoint, database), {
      headers,
    }).then(ResponseBody);
  }

  getDBOptions(database, params) {
    const headers = AuthorizationHeaders(this.username, this.password);
    headers.append('Content-Type', 'application/json');
    return fetch(
      uri(this.endpoint, 'admin', 'databases', database, 'options'),
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(flat(DB_OPTIONS)),
      }
    )
      .then(ResponseBody)
      .then(res => {
        if (res.status === 200) {
          return Object.assign({}, res, {
            result: flat.unflatten(res.result),
          });
        }
        return res;
      });
  }

  offlineDB(database, params) {
    const headers = AuthorizationHeaders(this.username, this.password);
    headers.append('Accept', 'application/json');
    return fetch(
      uri(this.endpoint, 'admin', 'databases', database, 'offline'),
      {
        method: 'PUT',
        headers,
      }
    ).then(ResponseBody);
  }

  onlineDB(database, params) {
    const headers = AuthorizationHeaders(this.username, this.password);
    headers.append('Accept', 'application/json');
    return fetch(uri(this.endpoint, 'admin', 'databases', database, 'online'), {
      method: 'PUT',
      headers,
    }).then(ResponseBody);
  }

  copyDB(database, destination, params) {
    const headers = AuthorizationHeaders(this.username, this.password);
    headers.append('Accept', 'application/json');
    const resource = `${uri(
      this.endpoint,
      'admin',
      'databases',
      database,
      'copy'
    )}?${qs.stringify({ to: destination })}`;
    return fetch(resource, {
      method: 'PUT',
      headers,
    }).then(ResponseBody);
  }

  listDBs(params) {
    const headers = AuthorizationHeaders(this.username, this.password);
    headers.append('Accept', 'application/json');
    return fetch(uri(this.endpoint, 'admin', 'databases'), {
      headers,
    }).then(ResponseBody);
  }

  getProperty(options, params) {
    return this.query(
      {
        database: options.database,
        query: `select * where {
        ${options.uri} ${options.property} ?val
        }
    `,
      },
      params
    ).then(res => {
      const values = _.get(res, 'result.results.bindings', []);
      if (values.length > 0) {
        return Object.assign({}, res, {
          result: values[0].val.value,
        });
      }
    });
  }

  query(options, params) {
    // Merge optoins with this, so you can overwrite specific options on a per call basis
    const config = Object.assign({}, this, options);
    const queryParams = ['baseURI', 'limit', 'offset', 'reasoning'];

    const headers = AuthorizationHeaders(this.username, this.password);
    headers.append('Accept', 'application/sparql-results+json');
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = {
      query: options.query,
    };

    const database = options.database || this.database;

    Object.keys(config)
      // If it's a supported query param and it has a value, include it
      .filter(v => queryParams.indexOf(v) > -1 && config[v] != null)
      .reduce((memo, key) => {
        memo[key] = config[key];
        return memo;
      }, body);

    return fetch(uri(this.endpoint, database, 'query'), {
      method: 'POST',
      body: qs.stringify(body),
      credentials: 'include',
      headers,
    }).then(ResponseBody);
  }
}

Stardog.Connection = Connection;

module.exports = Stardog;
