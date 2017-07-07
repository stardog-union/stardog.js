# Stardog.js

Universal Javascript fetch wrapper for communicating with the Stardog HTTP server.

[![npm](https://img.shields.io/npm/v/stardog.svg?style=flat-square)](https://www.npmjs.com/package/stardog)

<a href="http://stardog.com"><img src="http://stardog.com/img/stardog.png" style="margin: 0 auto; display: block; width: 250px"/></a>

## What is it?

This framework wraps all the functionality of a client for the Stardog DBMS, and provides access to a full set of functions such as executing SPARQL queries, administrative tasks on Stardog, and the use of the Reasoning API.

All the implementation uses the HTTP protocol, since most of Stardog functionality is available using this protocol. For more information, go to the Stardog's [HTTP Programming](http://www.stardog.com/docs/#_network_programming) documentation.

This is a universal library and as such can be used in both the browser and Node.

## Installation

To install stardog.js run:

```bash
npm install stardog
```

## Development

To get started, just clone the project. You'll need a local copy of Stardog to be able to run the tests. For more information on starting the Stardog DB service and how it works, go to [Stardog's documentation](http://docs.stardog.com), where you'll find everything you need to get up and running with Stardog.

Go to [http://stardog.com](http://stardog.com), download and install the database and load the data provided in `data/` using the script in the repository.

1. Start the Stardog server
```bash
stardog-admin server start
```
2. Install `stardog.js` dependencies:
```bash
npm install
```

### Running Tests

Run all the test cases in `test/spec`, all test cases must pass. With the Stardog server running, execute the following commands:

```bash
npm test
```

### Contributing

Fork, clone, dev, write or amend tests and PR. All PRs go against "master". This project uses [prettier](https://github.com/prettier/prettier) on file commit, so don't worry about style as it'll just get rewritten when you commit your changes.

## Version details

The current version of stardog.js has been tested against version 5.0.0 of Stardog. You are encouraged to use this library if you are using version 5 or greater of Stardog. However, there is very little code that is version specific in stardog.js. It is essentially just a convenience wrapper around `fetch`. It is very likely that many of the exposed methods will work on older versions of Stardog, but this has not been tested.

If you are using a really old version of stardog (<= 3.0.0) you should stick with the legacy version of the library which is version 0.3.1.

### Discontinued Versions

All versions prior to v1.0.0 have been discontinued and will not receive updates of any kind. If you are using a legacy version of stardog.js you can find the original documentation [here](http://stardog-union.github.io/stardog.js/docs/stardog.html). The most recent legacy version is 0.3.1.

## Quick Example
```js
const { Connection, query } = require('stardog');

const conn = new Connection({
  username: 'admin',
  password: 'admin',
  endpoint: 'http://localhost:5820',
  database: 'myDB'
});

query.execute(conn, 'select distinct ?s where { ?s ?p ?o }', {
  limit: 10,
  offset: 0
}).then(({ result }) => {
  console.log(result.results.bindings);
});
```
