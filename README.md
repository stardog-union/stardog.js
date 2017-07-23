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

<!--- API Goes Here --->
# API

## <a name="http">HTTP</a>

#### <a name="contentmimetypes">ContentMimeTypes</a>

One of the following values:

`'application/x-turtle' |
            'text/turtle' |
            'application/rdf+xml' |
            'text/plain' |
            'application/x-trig' |
            'text/x-nquads' |
            'application/trix'`
#### <a name="acceptmimetypes">AcceptMimeTypes</a>

One of the following values:

`'text/plain' |
            'application/json' |
            'text/boolean'`
#### <a name="body">Body</a>

Object with the following values:

- status (`string`)
- statusText (`string`)
- result (`object | string | boolean | null`)
- ok (`boolean`)
- headers (`Headers`)

#### <a name="connectionoptions">ConnectionOptions</a>

Object with the following values:

- endpoint (`string`)
- username (`string`)
- password (`string`)

## <a name="connection">Connection</a> (Class)

Constructed with:
- options ([`ConnectionOptions`](#connectionoptions))
### <a name="config">Connection.config(options)</a>

Takes the following params:
- options ([`ConnectionOptions`](#connectionoptions))

Returns [`void`](#void)
### <a name="headers">Connection.headers()</a>

Returns [`Headers`](#headers)
### <a name="uri">Connection.uri(resource)</a>

Takes the following params:
- resource (`string[]`)

Returns `string`
## <a name="server">server</a>

#### <a name="shutdown">`server.shutdown(conn, params)`</a>

Shuts down a Stardog server. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="db">db</a>

#### <a name="create">`db.create(conn, database, databaseOptions, options, params)`</a>

Creates a new database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- databaseOptions (`Object`)

- options (`{ files: string[] }`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="drop">`db.drop(conn, database, params)`</a>

Deletes a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="get">`db.get(conn, database, params)`</a>

Gets information about a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="offline">`db.offline(conn, database, params)`</a>

Sets a database offline. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="online">`db.online(conn, database, params)`</a>

Sets a database online. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="optimize">`db.optimize(conn, database, params)`</a>

Optimizes a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="copy">`db.copy(conn, database, destination, params)`</a>

Makes a copy of a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- destination (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="list">`db.list(conn, params)`</a>

Gets a list of all databases on a Stardog server. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="size">`db.size(conn, database, params)`</a>

Gets number of triples in a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="clear">`db.clear(conn, database, transactionId, params)`</a>

Clears the contents of a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="namespaces">`db.namespaces(conn, database, params)`</a>

Gets a mapping of the namespaces used in a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="exportdata">`db.exportData(conn, database, options, params)`</a>

Exports the contents of a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- options ({ mimeType: [`AcceptMimeTypes`](#acceptmimetypes) })

- params (`{ graphUri: string }`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="options">options</a>

#### <a name="get">`db.options.get(conn, database, params)`</a>

Gets set of options on a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="set">`db.options.set(conn, database, databaseOptions, params)`</a>

Sets options on a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- databaseOptions (`Object`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="transaction">transaction</a>

#### <a name="encodings">Encodings</a>

One of the following values:

`'gzip' |
                'compress' |
                'deflate' |
                'identity' |
                'br'`
#### <a name="transactionresponse">TransactionResponse</a> extends [HTTP.Body](#body)

Object with the following values:

- transactionId (`string`)

#### <a name="transactionoptions">TransactionOptions</a>

Object with the following values:

- contentType (`HTTP.ContentMimeTypes`)
- encoding (`Encodings`)

#### <a name="begin">`db.transaction.begin(conn, database, params)`</a>

Begins a new transaction. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`Object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

#### <a name="query">`db.transaction.query(conn, database, transactionId, query, params)`</a>

Evaluates a SPARQL query within a transaction. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- query (`string`)

- params (`Object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

#### <a name="add">`db.transaction.add(conn, database, transactionId, content, options, params)`</a>

Adds a set of statements to a transaction request. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- content (`string`)

- options ([`TransactionOptions`](#transactionoptions))

- params (`Object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

#### <a name="rollback">`db.transaction.rollback(conn, database, transactionId, params)`</a>

Performs a rollback in a given transaction. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- params (`Object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

#### <a name="commit">`db.transaction.commit(conn, database, transactionId, params)`</a>

Commits a transaction to the database, removing the transaction and making its changes permanent. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- params (`Object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

#### <a name="remove">`db.transaction.remove(conn, database, transactionId, content, options, params)`</a>

Removes a set of statements from a transaction request. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- content (`string`)

- options ([`TransactionOptions`](#transactionoptions))

- params (`Object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

## <a name="icv">icv</a>

#### <a name="get">`db.icv.get(conn, database, options, params)`</a>

Gets the set of integrity constraints on a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- options (`Object`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="set">`db.icv.set(conn, database, icvAxioms, options, params)`</a>

Sets a new set of integrity constraints on a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- icvAxioms (`string`)

- options ({ contentType: [`ContentMimeTypes`](#contentmimetypes) })

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="clear">`db.icv.clear(conn, database, options, params)`</a>

Removes all integrity constraints from a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- options (`Object`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="convert">`db.icv.convert(conn, database, icvAxioms, options, params)`</a>

Converts a set of integrity constraints into an equivalent SPARQL query for a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- icvAxioms (`string`)

- options ({ contentType: [`ContentMimeTypes`](#contentmimetypes) })

- params (`{ graphUri: string }`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="query">query</a>

#### <a name="propertyoptions">PropertyOptions</a>

Object with the following values:

- uri (`string`)
- property (`string`)

#### <a name="property">`query.property(conn, database, config, params)`</a>

Gets the values for a specific property of a URI individual. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- config ([`PropertyOptions`](#propertyoptions))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="explain">`query.explain(conn, database, query, params)`</a>

Gets the query plan generated by Stardog for a given SPARQL query. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- query (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="execute">`query.execute(conn, database, query, params)`</a>

Executes a query against a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- query (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="list">`query.list(conn)`</a>

Gets a list of actively running queries. 

Expects the following parameters:

- conn ([`Connection`](#connection))

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="kill">`query.kill(conn, queryId)`</a>

Kills an actively running query. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- queryId (`string`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="get">`query.get(conn, queryId)`</a>

Gets information about an actively running query. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- queryId (`string`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="storedqueryoptions">StoredQueryOptions</a>

Object with the following values:

- name (`string`)
- database (`string`)
- query (`string`)
- shared (`boolean`)

## <a name="stored">stored</a>

#### <a name="create">`query.stored.create(conn, config, params)`</a>

Stores a query in Stardog, either on the system level or for a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- config ([`StoredQueryOptions`](#storedqueryoptions))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="list">`query.stored.list(conn, params)`</a>

Lists all stored queries. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`query.stored.remove(conn, storedQuery, params)`</a>

Removes a given stored query. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- storedQuery (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="user">user</a>

#### <a name="user">User</a>

Object with the following values:

- username (`string`)
- password (`string`)
- superuser (`boolean`)

#### <a name="action">Action</a>

One of the following values:

`'CREATE' |
            'DELETE' |
            'READ' |
            'WRITE' |
            'GRANT' |
            'REVOKE' |
            'EXECUTE'`
#### <a name="resourcetype">ResourceType</a>

One of the following values:

`'db' |
            'user' |
            'role' |
            'admin' |
            'metadata' |
            'named-graph' |
            'icv-constraints'`
#### <a name="list">`user.list(conn, params)`</a>

Gets a list of users. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="create">`user.create(conn, user, params)`</a>

Creates a new user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- user ([`User`](#user))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="changepassword">`user.changePassword(conn, username, password, params)`</a>

Changes a user's password. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- password (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="enabled">`user.enabled(conn, username, params)`</a>

Verifies that a user is enabled. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="enable">`user.enable(conn, username, enabled, params)`</a>

Enables/disables a user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- enabled (`boolean`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="setroles">`user.setRoles(conn, username, params)`</a>

Sets roles for a user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="listroles">`user.listRoles(conn, username, params)`</a>

Gets a list of roles assigned to a user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="assignpermission">`user.assignPermission(conn, username, params)`</a>

Creates a new permission for a user over a given <ResourceType>. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="deletepermission">`user.deletePermission(conn, username, params)`</a>

Removes a permission for a user over a given <ResourceType>. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="permissions">`user.permissions(conn, username, params)`</a>

Gets a list of permissions assigned to user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="effectivepermissions">`user.effectivePermissions(conn, username, params)`</a>

Gets a list of a user's effective permissions. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="superuser">`user.superUser(conn, username, params)`</a>

Verifies that a user is a superuser. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`user.remove(conn, username, params)`</a>

Deletes a user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="role">Role</a>

Object with the following values:

- rolename (`string`)

#### <a name="permission">Permission</a>

Object with the following values:

- action (`Action`)
- resourceType (`ResourceType`)
- resources (`string[]`)

## <a name="role">role</a>

#### <a name="create">`user.role.create(conn, role, params)`</a>

Creates a new role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role ([`Role`](#role))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="list">`user.role.list(conn, params)`</a>

Lists all existing roles. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`user.role.remove(conn, role, params)`</a>

Deletes an existing role from the system. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role ([`Role`](#role))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="userswithrole">`user.role.usersWithRole(conn, role, params)`</a>

Lists all users that have been assigned a given role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role ([`Role`](#role))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="assignpermission">`user.role.assignPermission(conn, role, permission, params)`</a>

Adds a permission over a given resource to a given role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role ([`Role`](#role))

- permission ([`Permission`](#permission))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="deletepermission">`user.role.deletePermission(conn, role, permission, params)`</a>

Removes a permission over a given resource from a given role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role ([`Role`](#role))

- permission ([`Permission`](#permission))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="permissions">`user.role.permissions(conn, role, params)`</a>

Lists all permissions assigned to a given role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role ([`Role`](#role))

- params (`Object`)

Returns [`Promise<HTTP.Body>`](#body)

