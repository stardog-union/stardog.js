# Stardog.js - Change Log

## v0.3.1

*__REMOVED__: `migrateDB` is no longer part of the Stardog API
*__ADDED:__: support for Stardog 4.0-RC1, tests were verified

## v0.3.0

*__ADDED:__ `exportDB` call for exporting the contents of a Database.
*__MODIFIED:__ small changes due to recent security updates for stardog 3.1

## v0.2.0

*__MODIFIED:__ Changes for stardog 3.0
*__MODIFIED:__ Reasoning is now enabled/disabled with a boolean value, reasoning levels are no longer used

## v0.1.6

*__FIXED:__ Added specific mimetype for accept header on `addInTransaction` call

## v0.1.5

*__MODIFIED:__ `getNamespaces` from stardog now returns a proper JSON Array

## v0.1.4

*__ADDED:__ Query Management API tests
*__MODIFIED:__ Reasoning level in queries now is sent via a query URL parameter (...?reasoning=<level>)

## v0.1.3

*__FIX:__ AMD importing in the browser, removing `stardog` module name declaration to avoid dependency problems

## v0.1.2
---

* __ADDED:__ Query Management API
* __ADDED:__ `getNamespaces` call to retrieve the DB namespaces
* __ADDED:__ `options.reasoning` parameter for `query` and `queryGraph` calls to let user specify reasoning profile by query
* __ADDED:__ Support for running test cases in windows

## v0.1.1
---

* __MODIFIED:__ Changed testing framework from Jasmine to Mocha
* __FIXED:__ JS Style check with JS Hint 

## v0.1.0
---

* __ADDED:__ Support for creating new empty DB via createDB function
* __MODIFIED:__ Changes supporting new default Stardog server port (test cases & default)
* __MODIFIED:__ Changes to the way reasoning is activated in the request via a URL querystring parameter instead of custom header
* __FIXED:__ Bug when setting endpoint URL with multiple trailing slash characters ('/')

## v0.0.5
---

* __ADDED:__ AMD support for stardog.js in the browser
* __ADDED:__ bower package description - now stardog.js is also available in bower as a client library for the browser
* __ADDED:__ test cases for the stardog.js browser version
* __ADDED:__ proxy utility for stardog usign nodejs - thanks to @laczoka (https://gist.github.com/laczoka/5065270)
* __MODIFIED:__ stardog.js API calls - changed parameters to options hash in most of the calls - see annotated code

## v0.0.4
---

* __ADDED:__ support for Stardog 1.2
* __MODIFIED:__ function `Connection.createUser` now requires a password for the creation of the user in Stardog, see [Stardog 1.2 HTTP docs](http://stardog.com/docs/network/)
* __ADDED:__ annotated source documentation


## v0.0.3
---

* __ADDED:__ limited browser support. Stardog does not support CORS yet, but stardog.js can be used in the browser through a proxy to Stardog. Thanks to @laczoka.
* __ADDED:__ better error handling. Errors from the server are now propagated to the client code.
* __FIXED:__ issue for using endpoint URLs without trailing slash (`/`)


## v0.0.2
---
* __ADDED:__ support for reasoning in the Connection object. Function `Connection.setReasoning` accepts any of the valid Stardog reasoning levels, see [Stardog Reasoning](http://stardog.com/docs/owl2/#reasoning)

## v0.0.1
---
* __ADDED:__ support for quering Stardog using SPARQL queries via the `Connection.query` function.
* __ADDED:__ All basic Stardog HTTP Administration protocol calls, see [Stardog 1.2 HTTP docs](http://stardog.com/docs/network/)
* __ADDED:__ test cases for all of the Stardog HTTP Administration protocol calls
