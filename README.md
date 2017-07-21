# Stardog.js

Universal Javascript fetch wrapper for communicating with the Stardog HTTP server.

[![npm](https://img.shields.io/npm/v/stardog.svg?style=flat-square)](https://www.npmjs.com/package/stardog)

<a href="http://stardog.com"><img src="http://stardog.com/img/stardog.png" style="margin: 0 auto; display: block; width: 250px"/></a>

## What is it?

This framework wraps all the functionality of a client for the Stardog DBMS, and provides access to a full set of functions such as executing SPARQL queries, administrative tasks on Stardog, and the use of the Reasoning API.

All the implementation uses the HTTP protocol, since most of Stardog functionality is available using this protocol. For more information, go to the Stardog's [HTTP Programming](http://www.stardog.com/docs/#_network_programming) documentation.

This is a universal library and as such can be used in both the browser and Node.js.

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

In order to contribute changes, all test cases must pass. With the Stardog server running, execute the following command to run all test cases in `test/spec`:

```bash
npm test
```

### Contributing

Fork, clone and develop, write or amend tests, and then open a PR. All PRs go against "master". This project uses [prettier](https://github.com/prettier/prettier) on file commit, so don't worry about style as it'll just get rewritten when you commit your changes.

## Version details

The current version of stardog.js has been tested against version 5.0.0 of Stardog. You are encouraged to use this library if you are using version 5 or greater of Stardog. However, there is very little code that is version specific in stardog.js. It is essentially just a convenience wrapper around `fetch`. It is very likely that many of the exposed methods will work on older versions of Stardog, but this has not been tested.

If you are using a really old version of Stardog (<= 3.0.0) you should stick with the legacy version of the library which is version 0.3.1.

### Discontinued Versions

All versions of stardog.js prior to v1.0.0 have been discontinued and will not receive updates of any kind. If you are using a legacy version of stardog.js you can find the original documentation [here](http://stardog-union.github.io/stardog.js/docs/stardog.html). The most recent legacy version is 0.3.1.

## Quick Example
```js
const { Connection, query } = require('stardog');

const conn = new Connection({
  username: 'admin',
  password: 'admin',
  endpoint: 'http://localhost:5820',
});

query.execute(conn, 'select distinct ?s where { ?s ?p ?o }', {
  limit: 10,
  offset: 0
}).then(({ result }) => {
  console.log(result.results.bindings);
});
```
## API

## Reference

## HTTP

### Message

Object with the following values:
- status (`string`)
- statusText (`string`)

### Body

Object with the following values:
- status (`string`)
- statusText (`string`)
- result (`object | string | boolean | null`)

### ConnectionOptions

Object with the following values:
- endpoint (`string`)
- username (`string`)
- password (`string`)

## Class Connection

Constructed with:
- options (`Reference.ConnectionOptions`)
### config

Method takes the following params:
- options (`Reference.ConnectionOptions`)

### headers

Method takes the following params:

### uri

Method takes the following params:
- resource (`string[]`)

## server

### shutdown

Shuts down a Stardog server. 

Expects the following parameters:
- conn (`Connection`)
- params (`Object`)

## db

### create

Creates a new database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- databaseOptions (`Object`)
- options (`{ files: string[] }`)
- params (`Object`)

### drop

Deletes a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### get

Gets information about a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### offline

Sets a database offline. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### online

Sets a database online. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### optimize

Optimizes a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### copy

Makes a copy of a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- destination (`string`)
- params (`Object`)

### list

Gets a list of all databases on a Stardog server. 

Expects the following parameters:
- conn (`Connection`)
- params (`Object`)

### size

Gets number of triples in a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### clear

Clears the contents of a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- transactionId (`string`)
- params (`Object`)

### namespaces

Gets a mapping of the namespaces used in a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### exportData

Exports the contents of a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- options (`{ mimeType: Reference.HTTP.AcceptMimeTypes }`)
- params (`{ graphUri: string }`)

## options

### get

Gets set of options on a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### set

Sets options on a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- databaseOptions (`Object`)
- params (`Object`)

## transaction

### TransactionResponse

Object with the following values:
- transactionId (`string`)

### TransactionOptions

Object with the following values:
- contentType (`Reference.HTTP.ContentMimeTypes`)
- encoding (`Encodings`)

### begin

Begins a new transaction. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- params (`Object`)

### query

Evaluates a SPARQL query within a transaction. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- transactionId (`string`)
- query (`string`)
- params (`Object`)

### add

Adds a set of statements to a transaction request. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- transactionId (`string`)
- content (`string`)
- options (`TransactionOptions`)
- params (`Object`)

### rollback

Performs a rollback in a given transaction. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- transactionId (`string`)
- params (`Object`)

### commit

Commits a transaction to the database, removing the transaction and making its changes permanent. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- transactionId (`string`)
- params (`Object`)

### remove

Removes a set of statements from a transaction request. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- transactionId (`string`)
- content (`string`)
- options (`TransactionOptions`)
- params (`Object`)

## icv

### get

Gets the set of integrity constraints on a given database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- options (`Object`)
- params (`Object`)

### set

Sets a new set of integrity constraints on a given database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- icvAxioms (`string`)
- options (`{ contentType: Reference.HTTP.ContentMimeTypes }`)
- params (`Object`)

### clear

Removes all integrity constraints from a given database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- options (`Object`)
- params (`Object`)

### convert

Converts a set of integrity constraints into an equivalent SPARQL query for a given database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- icvAxioms (`string`)
- options (`{ contentType: Reference.HTTP.ContentMimeTypes }`)
- params (`{ graphUri: string }`)

## query

### PropertyOptions

Object with the following values:
- uri (`string`)
- property (`string`)

### property

Gets the values for a specific property of a URI individual. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- config (`PropertyOptions`)
- params (`Object`)

### explain

Gets the query plan generated by Stardog for a given SPARQL query. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- query (`string`)
- params (`Object`)

### execute

Executes a query against a database. 

Expects the following parameters:
- conn (`Connection`)
- database (`string`)
- query (`string`)
- params (`Object`)

### list

Gets a list of actively running queries. 

Expects the following parameters:
- conn (`Connection`)

### kill

Kills an actively running query. 

Expects the following parameters:
- conn (`Connection`)
- queryId (`string`)

### get

Gets information about an actively running query. 

Expects the following parameters:
- conn (`Connection`)
- queryId (`string`)

### StoredQueryOptions

Object with the following values:
- name (`string`)
- database (`string`)
- query (`string`)
- shared (`boolean`)

## stored

### create

Stores a query in Stardog, either on the system level or for a given database. 

Expects the following parameters:
- conn (`Connection`)
- config (`StoredQueryOptions`)
- params (`Object`)

### list

Lists all stored queries. 

Expects the following parameters:
- conn (`Connection`)
- params (`Object`)

### remove

Removes a given stored query. 

Expects the following parameters:
- conn (`Connection`)
- storedQuery (`string`)
- params (`Object`)

## user

### User

Object with the following values:
- username (`string`)
- password (`string`)
- superuser (`boolean`)

### list

Gets a list of users. 

Expects the following parameters:
- conn (`Connection`)
- params (`Object`)

### create

Creates a new user. 

Expects the following parameters:
- conn (`Connection`)
- user (`User`)
- params (`Object`)

### changePassword

Changes a user's password. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- password (`string`)
- params (`Object`)

### enabled

Verifies that a user is enabled. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### enable

Enables/disables a user. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- enabled (`boolean`)
- params (`Object`)

### setRoles

Sets roles for a user. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### listRoles

Gets a list of roles assigned to a user. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### assignPermission

Creates a new permission for a user over a given <ResourceType>. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### deletePermission

Removes a permission for a user over a given <ResourceType>. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### permissions

Gets a list of permissions assigned to user. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### effectivePermissions

Gets a list of a user's effective permissions. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### superUser

Verifies that a user is a superuser. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### remove

Deletes a user. 

Expects the following parameters:
- conn (`Connection`)
- username (`string`)
- params (`Object`)

### Role

Object with the following values:
- rolename (`string`)

### Permission

Object with the following values:
- action (`Action`)
- resourceType (`ResourceType`)
- resources (`string[]`)

## role

### create

Creates a new role. 

Expects the following parameters:
- conn (`Connection`)
- role (`Role`)
- params (`Object`)

### list

Lists all existing roles. 

Expects the following parameters:
- conn (`Connection`)
- params (`Object`)

### remove

Deletes an existing role from the system. 

Expects the following parameters:
- conn (`Connection`)
- role (`Role`)
- params (`Object`)

### usersWithRole

Lists all users that have been assigned a given role. 

Expects the following parameters:
- conn (`Connection`)
- role (`Role`)
- params (`Object`)

### assignPermission

Adds a permission over a given resource to a given role. 

Expects the following parameters:
- conn (`Connection`)
- role (`Role`)
- permission (`Permission`)
- params (`Object`)

### deletePermission

Removes a permission over a given resource from a given role. 

Expects the following parameters:
- conn (`Connection`)
- role (`Role`)
- permission (`Permission`)
- params (`Object`)

### permissions

Lists all permissions assigned to a given role. 

Expects the following parameters:
- conn (`Connection`)
- role (`Role`)
- params (`Object`)

