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

### Releasing

If you have publishing rights, BE SURE TO RUN `npm version (major|minor|patch)` IMMEDIATELY BEFORE PUBLISHING. This will ensure that the build is up-to-date and will also (1) bump the version number in package.json accordingly, (2) create a git tag matching the version number, and (3) automatically update the README and the CHANGELOG using our type declarations and data from the stardog.js GitHub repo. For this process to work correctly, you will need to have generated a GitHub OAuth token and assigned it to the `MDCHANGELOG_TOKEN` environment variable (because this process uses [mdchangelog](https://www.npmjs.com/package/mdchangelog)). In order to ensure that this process is followed, there will be a very annoying alert triggered whenever you publish; if you're all set, just ignore the alert.

After releasing, be sure to push to master, including the tags (so that the release is reflected on GitHub).

## Version details

The current version of stardog.js has been tested against version 5.2.0 of Stardog. You are encouraged to use this library if you are using version 5 or greater of Stardog. However, there is very little code that is version specific in stardog.js. It is essentially just a convenience wrapper around `fetch`. It is very likely that many of the exposed methods will work on older versions of Stardog, but this has not been tested.

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

query.execute(conn, 'myDatabaseName', 'select distinct ?s where { ?s ?p ?o }', 'application/sparql-results+json', {
  limit: 10,
  offset: 0,
}).then(({ body }) => {
  console.log(body.results.bindings);
});
```

<!--- API Goes Here --->
# API

## <a name="http">HTTP</a>

#### <a name="rdfmimetype">RdfMimeType</a>

One of the following values:

`'application/ld+json'
            | 'text/turtle'
            | 'application/rdf+xml'
            | 'application/n-triples'
            | 'application/n-quads'
            | 'application/trig'`
#### <a name="sparqlmimetype">SparqlMimeType</a>

One of the following values:

`'application/sparql-results+json'
            | 'application/sparql-results+xml'`
#### <a name="acceptmimetype">AcceptMimeType</a>

One of the following values:

`RdfMimeType
          | SparqlMimeType
          | 'text/plain'
          | 'text/boolean'
          | 'application/json'
          | '*/*'`
#### <a name="body">Body</a>

Object with the following values:

- status (`number`)
- statusText (`string`)
- result (`object | string | boolean | null`)
- ok (`boolean`)
- headers (`Headers`)
- body (`any`)

#### <a name="connectionoptions">ConnectionOptions</a>

Object with the following values:

- endpoint (`string`)
- username (`string`)
- password (`string`)
- meta (`ConnectionMeta`)

#### <a name="requestconstructor">RequestConstructor</a>

One of the following values:

`{
      new (input: string | Request, init?: RequestInit): Request;
    }`
#### <a name="requestcreator">RequestCreator</a>

One of the following values:

`({ uri, Request }: { uri: string; Request: Constructor }) => ReturnType`
#### <a name="connectionmeta">ConnectionMeta</a>

Object with the following values:

- createRequest (`RequestCreator<RequestConstructor | typeof NodeFetchRequest, string | (Request | NodeFetchRequest)>`)
- createHeaders (`(defaults: { headers: Headers; }) => Headers`)

## <a name="connection">Connection</a> (Class)

Constructed with:
- options ([`ConnectionOptions`](#connectionoptions))
### <a name="config">Connection.config(options, meta)</a>

Takes the following params:
- options ([`ConnectionOptions`](#connectionoptions))
- meta ([`ConnectionMeta`](#connectionmeta))

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

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="db">db</a>

#### <a name="create">`db.create(conn, database, databaseOptions, options, params)`</a>

Creates a new database.

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- databaseOptions (`object`)

- options (`{ files: { filename: string}[] }`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="drop">`db.drop(conn, database, params)`</a>

Deletes a database.

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="get">`db.get(conn, database, params)`</a>

Gets an RDF representation of a database. See: https://www.w3.org/TR/sparql11-http-rdf-update/#http-get

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="offline">`db.offline(conn, database, params)`</a>

Sets a database offline. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="online">`db.online(conn, database, params)`</a>

Sets a database online. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="optimize">`db.optimize(conn, database, params)`</a>

Optimizes a database.

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="copy">`db.copy(conn, database, destination, params)`</a>

Makes a copy of a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- destination (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="list">`db.list(conn, params)`</a>

Gets a list of all databases on a Stardog server. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="size">`db.size(conn, database, params)`</a>

Gets number of triples in a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="clear">`db.clear(conn, database, transactionId, params)`</a>

Clears the contents of a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="add">`db.add(conn, database, transactionId, content, options, params)`</a>

Adds data within a transaction. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- content (`string`)

- options ([`TransactionOptions`](#transactionoptions))

- params (`object`)

Returns [`Promise<transaction.TransactionResponse>`](#transactionresponse)

#### <a name="remove">`db.remove(conn, database, transactionId, content, options, params)`</a>

Removes data within a transaction.

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- content (`string`)

- options ([`TransactionOptions`](#transactionoptions))

- params (`object`)

Returns [`Promise<transaction.TransactionResponse>`](#transactionresponse)

#### <a name="namespaces">`db.namespaces(conn, database, params)`</a>

Gets a mapping of the namespaces used in a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="exportdata">`db.exportData(conn, database, options, params)`</a>

Exports the contents of a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- options ({ mimeType: [`RdfMimeType`](#rdfmimetype) })

- params (`{ graphUri: string }`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="options">options</a>

#### <a name="get">`db.options.get(conn, database, params)`</a>

Gets set of options on a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="set">`db.options.set(conn, database, databaseOptions, params)`</a>

Sets options on a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- databaseOptions (`object`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="graph">graph</a>

#### <a name="doget">`db.graph.doGet(conn, database, graphUri, accept, params)`</a>

Retrieves the specified named graph

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- graphUri (`string`)

- accept ([`RdfMimeType`](#rdfmimetype))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="doput">`db.graph.doPut(conn, database, graphData, graphUri, contentType, params)`</a>

Stores the given RDF data in the specified named graph

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- graphData (`string`)

- graphUri (`string`)

- contentType ([`RdfMimeType`](#rdfmimetype))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="dodelete">`db.graph.doDelete(conn, database, graphUri, params)`</a>

Deletes the specified named graph

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- graphUri (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="dopost">`db.graph.doPost(conn, database, graphUri, options, params)`</a>

Merges the given RDF data into the specified named graph

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- graphUri (`string`)

- options ({ contentType: [`RdfMimeType`](#rdfmimetype) })

- params (`object`)

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

- contentType (`HTTP.RdfMimeType`)
- encoding (`Encodings`)

#### <a name="begin">`db.transaction.begin(conn, database, params)`</a>

Begins a new transaction. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

#### <a name="rollback">`db.transaction.rollback(conn, database, transactionId, params)`</a>

Rolls back a transaction, removing the transaction and undoing all changes

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- params (`object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

#### <a name="commit">`db.transaction.commit(conn, database, transactionId, params)`</a>

Commits a transaction to the database, removing the transaction and making its changes permanent. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- params (`object`)

Returns [`Promise<TransactionResponse>`](#transactionresponse)

## <a name="icv">icv</a>

#### <a name="get">`db.icv.get(conn, database, params)`</a>

Gets the set of integrity constraints on a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="add">`db.icv.add(conn, database, icvAxioms, options, params)`</a>

Adds integrity constraints to a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- icvAxioms (`string`)

- options ({ contentType: [`RdfMimeType`](#rdfmimetype) })

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`db.icv.remove(conn, database, icvAxioms, options, params)`</a>

Removes integrity constraints from a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- icvAxioms (`string`)

- options ({ contentType: [`RdfMimeType`](#rdfmimetype) })

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="clear">`db.icv.clear(conn, database, params)`</a>

Removes all integrity constraints from a given database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="convert">`db.icv.convert(conn, database, icvAxioms, options, params)`</a>

Converts a set of integrity constraints into an equivalent SPARQL query for a given database.

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- icvAxioms (`string`)

- options ({ contentType: [`RdfMimeType`](#rdfmimetype) })

- params (`{ graphUri: string }`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="validate">`db.icv.validate(conn, database, constraints, options, params)`</a>

Checks constraints to see if they are valid

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- constraints (`string`)

- options ({ contentType: [`RdfMimeType`](#rdfmimetype) })

- params (`{ graphUri: string }`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="validateintx">`db.icv.validateInTx(conn, database, constraints, transactionId, options, params)`</a>

Checks constraints to see if they are valid within a transaction

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- constraints (`string`)

- transactionId (`string`)

- options ({ contentType: [`RdfMimeType`](#rdfmimetype) })

- params (`{ graphUri: string }`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="violations">`db.icv.violations(conn, database, constraints, options, params)`</a>

Accepts integrity constraints as RDF and returns the violation explanations, if any, as RDF.

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- constraints (`string`)

- options ({ contentType: [`RdfMimeType`](#rdfmimetype) })

- params (`{ graphUri: string }`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="violationsintx">`db.icv.violationsInTx(conn, database, constraints, options, params)`</a>

Accepts integrity constraints as RDF and returns the violation explanations, if any, as RDF.

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- constraints (`string`)

- options ({ contentType: [`RdfMimeType`](#rdfmimetype) })

- params (`{ graphUri: string }`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="reasoning">reasoning</a>

#### <a name="consistency">`db.reasoning.consistency(conn, database, options, params)`</a>

Returns if the database is consistent

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- options (`{ namedGraph: string }`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="explaininference">`db.reasoning.explainInference(conn, database, inference, config, params)`</a>

Provides an explanation for an inference

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- inference (`string`)

- config (`{ contentType: string }`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="explaininconsistency">`db.reasoning.explainInconsistency(conn, database, options, params)`</a>

Provides the reason why a database is inconsistent, as reported by db.reasoning.consistency

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- options (`{ namedGraph: string }`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="explaininferenceintransaction">`db.reasoning.explainInferenceInTransaction(conn, database, transactionId, inference, config, params)`</a>

Provides an explanation for an inference within a transaction

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- inference (`string`)

- config ([`TransactionOptions`](#transactionoptions))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="explaininconsistencyintransaction">`db.reasoning.explainInconsistencyInTransaction(conn, database, transactionId, options, params)`</a>

Provides the reason why a database is inconsistent, as reported by db.reasoning.consistency

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- options (`{ namedGraph: string }`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="schema">`db.reasoning.schema(conn, database, params)`</a>

Gets the reasoning schema of the database

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="versioning">versioning</a>

#### <a name="query">`db.versioning.query(conn, database, query, accept, params)`</a>

Executes a SPARQL query over the versioning history

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- query (`string`)

- accept ([`SparqlMimeType`](#sparqlmimetype))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="commit">`db.versioning.commit(conn, database, transactionId, commitMsg, params)`</a>

Commits a transaction into versioning

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- commitMsg (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="createtag">`db.versioning.createTag(conn, database, revisionId, tagLogMsg, params)`</a>

Creates a new tag

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- revisionId (`string`)

- tagLogMsg (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="deletetag">`db.versioning.deleteTag(conn, database, revisionId, params)`</a>

Deletes a tag

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- revisionId (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="revert">`db.versioning.revert(conn, database, fromRevisionId, toRevisionId, logMsg, params)`</a>

Reverts to a previous commit

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- fromRevisionId (`string`)

- toRevisionId (`string`)

- logMsg (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="docs">docs</a>

#### <a name="size">`db.docs.size(conn, database, params)`</a>

Retrieves the size of the document store

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="clear">`db.docs.clear(conn, database, params)`</a>

Clears the document store

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="add">`db.docs.add(conn, database, fileName, fileContents, params)`</a>

Adds a document to the document store

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- fileName (`string`)

- fileContents (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`db.docs.remove(conn, database, fileName, params)`</a>

Removes a document from the document store

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- fileName (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="get">`db.docs.get(conn, database, fileName, params)`</a>

Retrieves a document from the document store

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- fileName (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="query">query</a>

#### <a name="querytype">QueryType</a>

One of the following values:

`'select' | 'ask' | 'construct' | 'describe' | 'update' | 'paths' | null`
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

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="explain">`query.explain(conn, database, query, params)`</a>

Gets the query plan generated by Stardog for a given SPARQL query. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- query (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="execute">`query.execute(conn, database, query, accept, params)`</a>

Executes a query against a database. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- query (`string`)

- accept ([`RdfMimeType`](#rdfmimetype))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="executeintransaction">`query.executeInTransaction(conn, database, transactionId, query, options, params)`</a>

Executes a query against a database within a transaction. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- transactionId (`string`)

- query (`string`)

- options ({ accept: [`RdfMimeType`](#rdfmimetype) })

- params (`object`)

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

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="list">`query.stored.list(conn, params)`</a>

Lists all stored queries. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`query.stored.remove(conn, storedQuery, params)`</a>

Removes a given stored query.

Expects the following parameters:

- conn ([`Connection`](#connection))

- storedQuery (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="graphql">graphql</a>

#### <a name="execute">`query.graphql.execute(conn, database, query, variables, params)`</a>

Executes a GraphQL query

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- query (`string`)

- variables (`object`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="listschemas">`query.graphql.listSchemas(conn, database, params)`</a>

Retrieves a list of GraphQL schemas in the database

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="addschema">`query.graphql.addSchema(conn, database, name, schema, params)`</a>

Adds a GraphQL schema to the database

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- name (`string`)

- schema (`object`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="getschema">`query.graphql.getSchema(conn, database, name, params)`</a>

Retrieves a GraphQL schema from the database

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- name (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="removeschema">`query.graphql.removeSchema(conn, database, name, params)`</a>

Removes a GraphQL schemafrom  the database

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- name (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="clearschemas">`query.graphql.clearSchemas(conn, database, params)`</a>

Clears all GraphQL schemas in the database

Expects the following parameters:

- conn ([`Connection`](#connection))

- database (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="utils">utils</a>

#### <a name="querytype">`query.utils.queryType(query)`</a>

Returns the QueryType (as a string or null) for the given query.

Expects the following parameters:

- query (`string`)

Returns [`QueryType`](#querytyp)

#### <a name="mimetype">`query.utils.mimeType(query)`</a>

Returns the default HTTP `Accept` MIME type for the given query.

Expects the following parameters:

- query (`string`)

Returns [`HTTP.AcceptMimeType`](#acceptmimetyp)

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

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="get">`user.get(conn, username, params)`</a>

Gets all information for a given user.

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="create">`user.create(conn, user, params)`</a>

Creates a new user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- user ([`User`](#user))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="changepassword">`user.changePassword(conn, username, password, params)`</a>

Changes a user's password. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- password (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="valid">`user.valid(conn, params)`</a>

Verifies that a Connection's credentials are valid.

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="enabled">`user.enabled(conn, username, params)`</a>

Verifies that a user is enabled.

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="enable">`user.enable(conn, username, enabled, params)`</a>

Enables/disables a user.

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- enabled (`boolean`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="setroles">`user.setRoles(conn, username, roles, params)`</a>

Sets roles for a user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- roles (`string[]`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="listroles">`user.listRoles(conn, username, params)`</a>

Gets a list of roles assigned to a user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="assignpermission">`user.assignPermission(conn, username, permission, params)`</a>

Creates a new permission for a user over a given resource. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- permission ([`Permission`](#permission))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="deletepermission">`user.deletePermission(conn, username, permission, params)`</a>

Removes a permission for a user over a given resource. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- permission ([`Permission`](#permission))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="permissions">`user.permissions(conn, username, params)`</a>

Gets a list of permissions assigned to user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="effectivepermissions">`user.effectivePermissions(conn, username, params)`</a>

Gets a list of a user's effective permissions. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="superuser">`user.superUser(conn, username, params)`</a>

Specifies whether a user is a superuser. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`user.remove(conn, username, params)`</a>

Deletes a user. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- username (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

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

- role (`{ rolename: string }`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="list">`user.role.list(conn, params)`</a>

Lists all existing roles. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`user.role.remove(conn, role, params)`</a>

Deletes an existing role from the system. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="userswithrole">`user.role.usersWithRole(conn, role, params)`</a>

Lists all users that have been assigned a given role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="assignpermission">`user.role.assignPermission(conn, role, permission, params)`</a>

Adds a permission over a given resource to a given role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role (`string`)

- permission ([`Permission`](#permission))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="deletepermission">`user.role.deletePermission(conn, role, permission, params)`</a>

Removes a permission over a given resource from a given role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role (`string`)

- permission ([`Permission`](#permission))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="permissions">`user.role.permissions(conn, role, params)`</a>

Lists all permissions assigned to a given role. 

Expects the following parameters:

- conn ([`Connection`](#connection))

- role (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="virtualgraphs">virtualGraphs</a>

#### <a name="options">Options</a>

Object with the following values:

- jdbc.username (`string`)
- jdbc.password (`string`)
- jdbc.driver (`string`)
- jdbc.url (`string`)
- namespaces (`string`)

#### <a name="list">`virtualGraphs.list(conn, params)`</a>

Retrieve a list of virtual graphs

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="add">`virtualGraphs.add(conn, name, mappings, options, params)`</a>

Add a virtual graph to the system

Expects the following parameters:

- conn ([`Connection`](#connection))

- name (`string`)

- mappings (`string`)

- options ([`Options`](#options))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="update">`virtualGraphs.update(conn, name, mappings, options, params)`</a>

Update a virtual graph in the system

Expects the following parameters:

- conn ([`Connection`](#connection))

- name (`string`)

- mappings (`string`)

- options ([`Options`](#options))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`virtualGraphs.remove(conn, name, params)`</a>

Remove a virtual graph from the system

Expects the following parameters:

- conn ([`Connection`](#connection))

- name (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="available">`virtualGraphs.available(conn, name, params)`</a>

Determine if the named virtual graph is available

Expects the following parameters:

- conn ([`Connection`](#connection))

- name (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="options">`virtualGraphs.options(conn, name, params)`</a>

Retrieve a virtual graph's options

Expects the following parameters:

- conn ([`Connection`](#connection))

- name (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="mappings">`virtualGraphs.mappings(conn, name, params)`</a>

Retrieve a virtual graph's mappings

Expects the following parameters:

- conn ([`Connection`](#connection))

- name (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

## <a name="storedfunctions">storedFunctions</a>

#### <a name="add">`storedFunctions.add(conn, functions, params)`</a>

Adds one or more stored functions to the server

Expects the following parameters:

- conn ([`Connection`](#connection))

- functions (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="get">`storedFunctions.get(conn, name, params)`</a>

Retrieves the specified function definition

Expects the following parameters:

- conn ([`Connection`](#connection))

- name (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="remove">`storedFunctions.remove(conn, name, params)`</a>

Removes a stored function from the server

Expects the following parameters:

- conn ([`Connection`](#connection))

- name (`string`)

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="clear">`storedFunctions.clear(conn, params)`</a>

Removes all stored functions from the server

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

#### <a name="getall">`storedFunctions.getAll(conn, params)`</a>

Retrieves an export of all stored functions on the server

Expects the following parameters:

- conn ([`Connection`](#connection))

- params (`object`)

Returns [`Promise<HTTP.Body>`](#body)

