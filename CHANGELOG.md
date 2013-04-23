# Stardog.js - Change Log

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
