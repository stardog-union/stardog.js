// TypeScript Version: 2.1

/** stardog.js: The Stardog JS API*/

import {
    Headers,
    Request,
    RequestInit
} from 'node-fetch';

declare namespace Stardog {
    namespace HTTP {
        export type RdfMimeType = 'application/ld+json'
            | 'text/turtle'
            | 'application/rdf+xml'
            | 'application/n-triples'
            | 'application/n-quads'
            | 'application/trig';

        export type SparqlMimeType = 'application/sparql-results+json'
            | 'application/sparql-results+xml';

        export type AcceptMimeType = RdfMimeType
            | SparqlMimeType
            | 'text/plain'
            | 'text/boolean'
            | 'application/json'
            | '*/*';

        export type ExplainAcceptMimeType = 'text/plain'
            | 'application/json';

        export interface Body {
            status: number;
            statusText: string;
            result: object | string | boolean | null;
            ok: boolean;
            headers: Headers;
            body: any;
        }
    }

    interface ConnectionOptions {
        endpoint: string;
        username: string;
        password?: string;
        token?: string;
        meta?: ConnectionMeta;
    }

    // Kind of a hack, but necessary to get around the way TS libs define the `Request` object.
    type RequestConstructor = {
      new (input: string | Request, init?: RequestInit): Request;
    };

    type RequestCreator<Constructor, ReturnType> = ({ uri, Request }: { uri: string; Request: Constructor }) => ReturnType;

    /** Optional meta-configuration for a Connection */
    interface ConnectionMeta {
        /**
         * Sometimes you might need to override stardog.js's default `fetch`
         * behavior, which, among other things, disallows fetching via HTTPS
         * from servers with self-signed certificates in Node. Defininig this
         * method allows you to provide a custom Request (or URI) to stardog.js
         * whenever a fetch call is about to occur using your Connection object
         * (e.g., you can provide a Request object with an HTTPS agent that
         * allows self-signed certificates). The defined method will be called
         * with an object containing both the full URI that is about to be
         * fetched and a constructor for Request objects (as a convenience,
         * since the Request constructor will differ depending on whether the
         * environment is browser-like or Node-like). You can use this URI and
         * constructor to construct and return the thing that you would like
         * stardog.js to pass as the first argument to the corresponding
         * `fetch` call (either a string URI or a Request object). For example,
         * you could return a Request object that is initialized with the
         * same URI passed from stardog.js, but that has a custom `agent`
         * attached:
         *
         * ```
         *  {
         *    createRequest: ({ uri, Request }) => new Request(uri, {
         *      agent: new http.Agent(. . .),
         *    }),
         *  }
         * ```
         *
         * @param {Object} requestData
         * @param {string} requestData.uri the full URI about to be fetched; includes all URI parts (protocol, hostname, path, query string, etc.)
         * @param {RequestConstructor} requestData.Request a request constructor, conforming either to the browser's Request spec or to `node-fetch`'s Request, depending on environment
         * @returns {string | Request} a string URI or a Request object
         */
        createRequest?: RequestCreator<RequestConstructor, string | Request>;

        /**
         * Pass this method on `ConnectionMeta` if you need to override or add
         * headers for a connection. The method will receive an object with the
         * default stardog.js connection headers.
         */
        createHeaders?: (defaults: { headers: Headers; }) => Headers;
    }

    /** Current version of stardog.js. Maps to package.json */
    export const version: string;

    /** Describes the connection to a running Stardog server. */
    export class Connection {
        constructor(options: ConnectionOptions, meta?: ConnectionMeta);

        config(options: ConnectionOptions, meta?: ConnectionMeta): void;
        headers(): Headers;
        uri(...resource: string[]): string;
    }

    /** Stardog HTTP server actions. */
    export namespace server {
        /** Shuts down a Stardog server. */
        function shutdown(conn: Connection, params?: object): Promise<HTTP.Body>;

        /**
         * Retrieves general status information about a Stardog server. By
         * default, also includes status information about all databases on
         * that server. If `params.databases` is `false`, however, then the
         * information about databases is omitted.
         */
        function status(conn: Connection, params?: { databases?: boolean; }): Promise<HTTP.Body>;
    }

    /** Stardog database actions. */
    export namespace db {
        /**
         * Creates a new database.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to create
         * @param {object} databaseOptions an object specifying the various metadata options for this database. See: https://github.com/stardog-union/stardog.js/blob/master/lib/db/dbopts.js
         * @param {object} options an object specifying a list of RDF files to bulk load into the database at creation time
         * @param {object} params additional parameters if needed
         */
        function create(conn: Connection, database: string, databaseOptions?: object, options?: { files: { filename: string}[] }, params?: object): Promise<HTTP.Body>;

        /**
         * Deletes a database.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to delete
         * @param {object} params additional parameters if needed
         */
        function drop(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

        /**
         * Gets an RDF representation of a database. See: https://www.w3.org/TR/sparql11-http-rdf-update/#http-get
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {object} params additional parameters if needed
         */
        function get(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

        /**
         * Sets a database offline.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to offline
         * @param {object} params additional parameters if needed
         */
        function offline(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

        /**
         * Sets a database online.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to online
         * @param {object} params additional parameters if needed
         */
        function online(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

        /**
         * Optimizes a database.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to optimize
         * @param {object} params additional parameters if needed
         */
        function optimize(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

        /**
         * Gets a list of all databases on a Stardog server.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {object} params additional parameters if needed
         */
        function list(conn: Connection, params?: object): Promise<HTTP.Body>;

        /**
         * Gets number of triples in a database.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {object} params additional parameters if needed
         */
        function size(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

        /**
         * Gets the model for a database.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {object} options additional options if needed
         * @param {object} params additional parameters if needed
         */
        function model(conn: Connection, database: string, options?: object, params?: object): Promise<HTTP.Body>;

        /**
         * Clears the contents of a database.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to clear
         * @param {object} params additional parameters if needed
         */
        function clear(conn: Connection, database: string, transactionId: string, params?: object): Promise<HTTP.Body>;

        /**
         * Adds data within a transaction.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to which to add data
         * @param {string} transactionId the UUID of the transaction as returned by db.transaction.begin
         * @param {string} content a block of RDF data to add
         * @param {object} options an object specifying the contentType of the RDF data (e.g., text/turtle)
         * @param {object} params additional parameters if needed
         */
        function add(conn: Connection, database: string, transactionId: string, content: string, options: transaction.TransactionOptions, params?: object): Promise<transaction.TransactionResponse>;

        /**
         * Removes data within a transaction.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database from which to remove data
         * @param {string} transactionId the UUID of the transaction as returned by db.transaction.begin
         * @param {string} content a block of RDF data to remove
         * @param {object} options an object specifying the contentType of the RDF data. Default: text/turtle
         * @param {object} params additional parameters if needed
         */
        function remove(conn: Connection, database: string, transactionId: string, content: string, options: transaction.TransactionOptions, params?: object): Promise<transaction.TransactionResponse>;

        /**
         * Exports the contents of a database.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to clear
         * @param {object} options an object specifying the desired HTTP MIME type. Default: application/ld+json
         * @param {object} params an object specifying the URI of a named graph to export. Default: ALL
         */
        function exportData(conn: Connection, database: string, options?: { mimetype: HTTP.RdfMimeType }, params?: { graphUri: string }): Promise<HTTP.Body>;

        /** Database options. */
        namespace options {
            /** Gets all available database options with their default values. */
            function getAvailable(conn: Connection): Promise<HTTP.Body>;
            /** Gets set of options on a database. */
            function get(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;
            /** Gets all options on a database. */
            function getAll(conn: Connection, database: string): Promise<HTTP.Body>;
            /** Sets options on a database. */
            function set(conn: Connection, database: string, databaseOptions: object, params?: object): Promise<HTTP.Body>;
        }

        /** Wrapper methods for using the SPARQL Graph Store Protocol. See https://www.w3.org/TR/sparql11-http-rdf-update */
        namespace graph {

            /**
             * Retrieves the specified named graph
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} graphUri the URI of the graph to retrieve, or null for the default graph
             * @param {HTTP.RdfMimeType} accept The desired HTTP MIME type. Default: application/ld+json
             * @param {object} params additional parameters if needed
             */
            function doGet(conn: Connection, database: string, graphUri?: string, accept?: HTTP.RdfMimeType, params?: object): Promise<HTTP.Body>;

            /**
             * Stores the given RDF data in the specified named graph
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} graphData the RDF data to be stored
             * @param {string} graphUri the URI of the graph to retrieve, or null for the default graph
             * @param {HTTP.RdfMimeType} contentType The HTTP MIME type of graphData. Default: application/ld+json
             * @param {object} params additional parameters if needed
             */
            function doPut(conn: Connection, database: string, graphData: string, graphUri?: string, contentType?: HTTP.RdfMimeType, params?: object): Promise<HTTP.Body>;

            /**
             * Deletes the specified named graph
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} graphUri the URI of the graph to retrieve, or null for the default graph
             * @param {object} params additional parameters if needed
             */
            function doDelete(conn: Connection, database: string, graphUri?: string, params?: object): Promise<HTTP.Body>;

            /**
             * Merges the given RDF data into the specified named graph
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} graphData the RDF data to be stored
             * @param {string} graphUri the URI of the graph to retrieve, or null for the default graph
             * @param {HTTP.RdfMimeType} contentType The HTTP MIME type of graphData. Default: application/ld+json
             * @param {object} params additional parameters if needed
             */
            function doPost(conn: Connection, database: string, graphUri?: string, options?: { contentType: HTTP.RdfMimeType }, params?: object): Promise<HTTP.Body>;
        }

        /** Methods for managing transactions in a database. */
        namespace transaction {

            type Encodings =
                'gzip' |
                'compress' |
                'deflate' |
                'identity' |
                'br';

            interface TransactionResponse extends HTTP.Body {
                transactionId: string
            }

            interface TransactionOptions {
                contentType: HTTP.RdfMimeType,
                encoding: Encodings
            }

            /**
             * Begins a new transaction.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database on which to open the transaction
             * @param {object} params additional parameters if needed
             */
            function begin(conn: Connection, database: string, params?: object): Promise<TransactionResponse>;

            /**
             * Rolls back a transaction, removing the transaction and undoing all changes
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} transactionId the UUID of the transaction to roll back as returned by db.transaction.begin
             * @param {object} params additional parameters if needed
             */
            function rollback(conn: Connection, database: string, transactionId: string, params?: object): Promise<TransactionResponse>;

            /**
             * Commits a transaction to the database, removing the transaction and making its changes permanent.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} transactionId the UUID of the transaction to commit as returned by db.transaction.begin
             * @param {object} params additional parameters if needed
             */
            function commit(conn: Connection, database: string, transactionId: string, params?: object): Promise<TransactionResponse>;
        }

        /** Methods for managing integrity constraints in a database. */
        namespace icv {
            /**
             * Gets the set of integrity constraints on a given database.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {object} params additional parameters if needed
             */
            function get(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

            /**
             * Adds integrity constraints to a given database.
             *
             * DEPRECATED: Support for storing ICV constraints in the system database is deprecated in Stardog 7.5.0
             * and removed in Stardog 8.0.0; instead, SHACL constraints can be managed using `db.add`.
             *
             * @deprecated Support for storing ICV constraints in the system database is deprecated in Stardog 7.5.0
             * and removed in Stardog 8.0.0; instead, SHACL constraints can be managed using {@link db.add}.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} icvAxioms an RDF block containing the axioms to be added
             * @param {object} options an object specifying the contentType of the icvAxioms parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function add(conn: Connection, database: string, icvAxioms: string, options?: { contentType: HTTP.RdfMimeType }, params?: object): Promise<HTTP.Body>;

            /**
             * Removes integrity constraints from a given database.
             *
             * DEPRECATED: Support for storing ICV constraints in the system database is deprecated in Stardog 7.5.0
             * and removed in Stardog 8.0.0; instead, SHACL constraints can be managed using `db.remove`.
             *
             * @deprecated Support for storing ICV constraints in the system database is deprecated in Stardog 7.5.0
             * and removed in Stardog 8.0.0; instead, SHACL constraints can be managed using {@link db.remove}.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} icvAxioms an RDF block containing the axioms to be removed
             * @param {object} options an object specifying the contentType of the icvAxioms parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function remove(conn: Connection, database: string, icvAxioms: string, options?: { contentType: HTTP.RdfMimeType }, params?: object): Promise<HTTP.Body>;

            /**
             * Removes all integrity constraints from a given database.
             *
             * DEPRECATED: Support for storing ICV constraints in the system database is deprecated in Stardog 7.5.0
             * and removed in Stardog 8.0.0.
             *
             * @deprecated Support for storing ICV constraints in the system database is deprecated in Stardog 7.5.0
             * and removed in Stardog 8.0.0
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {object} params additional parameters if needed
             */
            function clear(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

            /**
             * Converts a set of integrity constraints into an equivalent SPARQL query for a given database.
             *
             * DEPRECATED: Support for storing ICV constraints in the system database is deprecated in Stardog 7.5.0
             * and removed in Stardog 8.0.0.
             *
             * @deprecated Support for storing ICV constraints in the system database is deprecated in Stardog 7.5.0
             * and removed in Stardog 8.0.0
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} icvAxioms an RDF block containing the axioms to be added
             * @param {object} options an object specifying the contentType of the icvAxioms parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function convert(conn: Connection, database: string, icvAxioms: string, options: { contentType: HTTP.RdfMimeType }, params?: { graphUri: string }): Promise<HTTP.Body>;

            /**
             * Checks constraints to see if they are valid
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} constraints an RDF block containing the constraints to be validated
             * @param {object} options an object specifying the contentType of the constraints parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function validate(conn: Connection, database: string, constraints: string, options: { contentType: HTTP.RdfMimeType }, params?: { graphUri: string }): Promise<HTTP.Body>;

            /**
             * Checks constraints to see if they are valid within a transaction
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} transactionId the UUID of the transaction as returned by db.transaction.begin
             * @param {string} constraints an RDF block containing the constraints to be validated
             * @param {object} options an object specifying the contentType of the constraints parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function validateInTx(conn: Connection, database: string, transactionId: string, constraints: string, options: { contentType: HTTP.RdfMimeType }, params?: { graphUri: string }): Promise<HTTP.Body>;

            /**
             * Accepts integrity constraints as RDF and returns the violation explanations, if any, as RDF.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} constraints an RDF block containing the constraints to be validated
             * @param {object} options an object specifying the contentType of the constraints parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function violations(conn: Connection, database: string, constraints: string, options: { contentType: HTTP.RdfMimeType }, params?: { graphUri: string }): Promise<HTTP.Body>;

            /**
             * Accepts integrity constraints as RDF and returns the violation explanations, if any, as RDF.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} transactionId the UUID of the transaction as returned by db.transaction.begin
             * @param {string} constraints an RDF block containing the constraints to be validated
             * @param {object} options an object specifying the contentType of the constraints parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function violationsInTx(conn: Connection, database: string, transactionId: string, constraints: string, options?: { contentType: HTTP.RdfMimeType }, params?: { graphUri: string }): Promise<HTTP.Body>;

            /**
             * Accepts integrity constraints as RDF and returns a validation report.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} constraints an RDF block containing the constraints to be validated
             * @param {object} options an object specifying the contentType of the constraints parameter (default: text/turtle) and/or the accept type for the results (default: application/ld+json)
             * @param {object} params additional parameters if needed
             */
            function report(conn: Connection, database: string, constraints: string, options?: { contentType?: HTTP.RdfMimeType, accept?: HTTP.AcceptMimeType }, params?: { graphUri: string }): Promise<HTTP.Body>;

            /**
             * Accepts integrity constraints as RDF and returns a validation report.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} transactionId the UUID of the transaction as returned by db.transaction.begin
             * @param {string} constraints an RDF block containing the constraints to be validated
             * @param {object} options an object specifying the contentType of the constraints parameter (default: text/turtle) and/or the accept type for the results (default: application/ld+json)
             * @param {object} params additional parameters if needed
             */
            function reportInTx(conn: Connection, database: string, transactionId: string, constraints: string, options?: { contentType?: HTTP.RdfMimeType, accept?: HTTP.AcceptMimeType }, params?: { graphUri: string }): Promise<HTTP.Body>;
        }

        /** Commands that use the reasoning capabilities of a database */
        namespace reasoning {
            /**
             * Returns if the database is consistent
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {object} options an object optionally specifying the URI of a graph to evaluate
             * @param {object} params additional parameters if needed
             */
            function consistency(conn:Connection, database: string, options?: { namedGraph: string }, params?: object): Promise<HTTP.Body>;
            /**
             * Provides an explanation for an inference
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} inference RDF representing the inference to be explained
             * @param {config} options an object specifying the contentType of the RDF data (e.g., text/turtle)
             * @param {object} params additional parameters if needed
             */
            function explainInference(conn: Connection, database: string, inference: string, config: { contentType: string }, params?: object): Promise<HTTP.Body>;

            /**
             * Provides the reason why a database is inconsistent, as reported by db.reasoning.consistency
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {object} options an object optionally specifying the URI of a graph to evaluate
             * @param {object} params additional parameters if needed
             */
            function explainInconsistency(conn: Connection, database: string, options?: { namedGraph: string }, params?: object): Promise<HTTP.Body>;

            /**
             * Provides an explanation for an inference within a transaction
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} transactionId the UUID of the transaction as returned by db.transaction.begin
             * @param {string} inference RDF representing the inference to be explained
             * @param {transaction.TransactionOptions} config an object specifying the contentType of the RDF data (e.g., text/turtle)
             * @param {object} params additional parameters if needed
             */
            function explainInferenceInTransaction(conn: Connection, database: string, transactionId: string, inference: string, config: transaction.TransactionOptions, params?: object): Promise<HTTP.Body>;

            /**
             * Provides the reason why a database is inconsistent, as reported by db.reasoning.consistency
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} transactionId the UUID of the transaction as returned by db.transaction.begin
             * @param {object} options an object optionally specifying the URI of a graph to evaluate
             * @param {object} params additional parameters if needed
             */
            function explainInconsistencyInTransaction(conn: Connection, database: string, transactionId: string, options?: { namedGraph: string }, params?: object): Promise<HTTP.Body>;

            /**
             * Gets the reasoning schema of the database
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {object} params additional parameters if needed
             */
            function schema(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;
        }

        /** Commands that interact with the BITES (document store) API */
        namespace docs {

            /**
             * Retrieves the size of the document store
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {object} params additional parameters if needed
             */
            function size(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

            /**
             * Clears the document store
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {object} params additional parameters if needed
             */
            function clear(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

            /**
             * Adds a document to the document store
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} fileName the name of the file to add
             * @param {string} fileContents the contents of the file to add
             * @param {object} params additional parameters if needed
             */
            function add(conn: Connection, database: string, fileName: string, fileContents: string, params?: object): Promise<HTTP.Body>;

            /**
             * Removes a document from the document store
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} fileName the name of the file
             * @param {object} params additional parameters if needed
             */
            function remove(conn: Connection, database: string, fileName: string, params?: object): Promise<HTTP.Body>;

            /**
             * Retrieves a document from the document store
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} fileName the name of the file
             * @param {object} params additional parameters if needed
             */
            function get(conn: Connection, database: string, fileName: string, params?: object): Promise<HTTP.Body>;
        }

        namespace namespaces {
          /**
           * Gets a mapping of the namespaces used in a database.
           *
           * @param {Connection} conn the Stardog server connection
           * @param {string} database the name of the database
           */
          function get(conn: Connection, database: string): Promise<HTTP.Body>;

          /**
           * Extracts namespaces from an RDF file or RDF string and adds new
           * and updates existing namespaces in the database.
           *
           * @param {Connection} conn the Stardog server connection
           * @param {string} database the name of the database
           * @param {object|string} fileOrContents an RDF file or RDF string
           * @param {object} options an object specifying the contentType of
           *  the RDF string; used only if `fileOrContents` is a string and
           *  defaults to 'text/turtle'
           */
          function add(conn: Connection, database: string, fileOrContents: object | string, options?: { contentType?: HTTP.RdfMimeType }): Promise<HTTP.Body>;
        }
    }

    /** Query actions to perform on a database. */
    export namespace query {

        export type QueryType = 'select' | 'ask' | 'construct' | 'describe' | 'update' | 'paths' | null;

        interface PropertyOptions {
            uri: string,
            property: string
        }

        interface AdditionalHandlers {
            /**
             * Specify this method if you wish to act on the HTTP response
             * immediately, before any further stardog.js processing.
             * NOTE: The stardog.js processing will continue, unless
             * `onResponseStart` explicitly returns `false`.
             *
             * @param {Response} res HTTP response object.
             */
            onResponseStart: (res: Response) => boolean | void;
        }

        /**
         * Gets the values for a specific property of a URI individual.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {PropertyOptions} config an object specifying the URI and property to retrieve
         * @param {object} params additional parameters if needed
         */
        function property(conn: Connection, database: string, config: PropertyOptions, params?: object): Promise<HTTP.Body>;

        /**
         * Gets the query plan generated by Stardog for a given SPARQL query.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {string} query the SPARQL query to be explained
         * @param {HTTP.ExplainAcceptMimeType} accept The desired HTTP MIME type of the results
         * @param {object} params additional parameters if needed
         */
        function explain(conn: Connection, database: string, query: string, accept?: HTTP.ExplainAcceptMimeType, params?: object): Promise<HTTP.Body>

        /**
         * Executes a query against a database.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {string} query the SPARQL query to be executed
         * @param {HTTP.AcceptMimeType} accept The desired HTTP MIME type of the results
         * @param {object} params additional parameters if needed
         * @param {object} additionalHandlers additional response handlers (currently only `onResponseStart`)
         */
        function execute(conn: Connection, database: string, query: string, accept?: HTTP.AcceptMimeType, params?: object, additionalHandlers?: AdditionalHandlers): Promise<HTTP.Body>;

        /**
         * Executes a query against a database within a transaction.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {string} transactionId the UUID of the transaction as returned by db.transaction.begin
         * @param {string} query the SPARQL query to be executed
         * @param {object} options additional options to customize query
         * @param {object} params additional parameters if needed
         */
        function executeInTransaction(conn: Connection, database: string, transactionId: string, query: string, options?: { accept: HTTP.RdfMimeType }, params?: object): Promise<HTTP.Body>;

        /**
         * Gets a list of actively running queries.
         *
         * @param {Connection} conn the Stardog server connection
         */
        function list(conn: Connection): Promise<HTTP.Body>;

        /**
         * Kills an actively running query.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} queryId the ID of the query to be killed
         */
        function kill(conn: Connection, queryId: string): Promise<HTTP.Body>;

        /**
         * Gets information about an actively running query.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} queryId the ID of the query
         */
        function get(conn: Connection, queryId: string): Promise<HTTP.Body>;

        interface StoredQueryOptions {
            name: string,
            database: string,
            query: string,
            /** Defaults to false. */
            shared: boolean,
            /** Attributes introduced in Stardog version 6.2.2, which are optional in versions >= 6.2.2 and ignored in earlier versions. */
            reasoning?: boolean,
            description?: boolean,
        }

        /** Manages stored queries. */
        namespace stored {
            /**
             * Stores a query in Stardog, either on the system level or for a given database.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {StoredQueryOptions} config an object specifying the options to set on the new query
             * @param {object} params additional parameters if needed
             */
            function create(conn: Connection, config: StoredQueryOptions, params?: object): Promise<HTTP.Body>

            /**
             * Lists all stored queries.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {object} params additional parameters if needed
             */
            function list(conn: Connection, params?: object): Promise<HTTP.Body>

            /**
                * Updates a given stored query and creates it if the name does not refer to an existing stored query.
                *
                * @param {Connection} conn the Stardog server connection
                * @param {StoredQueryOptions} config an object specifying the options to set on the updated query
                * @param {object} params additional parameters if needed
                * @param {boolean} useUpdateMethod whether to use Stardog's HTTP PUT method, added in version 6.2.0. Default: true
                */
            function update(conn: Connection, config: StoredQueryOptions, params?: object, useUpdateMethod?: boolean): Promise<HTTP.Body>

            /**
             * Removes a given stored query.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} storedQuery the name of the stored query to be removed
             * @param {object} params additional parameters if needed
             */
            function remove(conn: Connection, storedQuery: string, params?: object): Promise<HTTP.Body>

            /**
            * Renames a given stored query.
            *
            * @param {Connection} conn the Stardog server connection
            * @param {string} name the current name of the existing stored query
            * @param {string} newName the new name of the stored query
            */
            function rename(conn: Connection, name: string, newName: string): Promise<HTTP.Body>
        }

        /** GraphQL queries and schema management */
        namespace graphql {

            /**
             * Executes a GraphQL query
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the database name
             * @param {string} query the query to run
             * @param {object} variables Variable definitions for the query
             * @param {object} params additional parameters if needed
             * @param {object} additionalHandlers additional response handlers (currently only `onResponseStart`)
             */
            function execute(conn: Connection, database: string, query: string, variables?: object, params?: object, additionalHandlers?: AdditionalHandlers): Promise<HTTP.Body>

            /**
             * Retrieves a list of GraphQL schemas in the database
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the database name
             * @param {object} params additional parameters if needed
             */
            function listSchemas(conn: Connection, database: string, params?: object): Promise<HTTP.Body>

            /**
             * Adds a GraphQL schema to the database
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the database name
             * @param {string} name the name of the schema
             * @param {object} schema an object representing the schema
             * @param {object} params additional parameters if needed
             */
            function addSchema(conn: Connection, database: string, name: string, schema: object, params?: object): Promise<HTTP.Body>

            /**
             * Updates (or adds if non-existent) a GraphQL schema to the database
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the database name
             * @param {string} name the name of the schema
             * @param {object} schema an object representing the schema
             * @param {object} params additional parameters if needed
             */
            function updateSchema(conn: Connection, database: string, name: string, schema: object, params?: object): Promise<HTTP.Body>

            /**
             * Retrieves a GraphQL schema from the database
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the database name
             * @param {string} name the name of the schema
             * @param {object} params additional parameters if needed
             */
            function getSchema(conn: Connection, database: string, name: string, params?: object): Promise<HTTP.Body>

            /**
             * Removes a GraphQL schemafrom  the database
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the database name
             * @param {string} name the name of the schema
             * @param {object} params additional parameters if needed
             */
            function removeSchema(conn: Connection, database: string, name: string, params?: object): Promise<HTTP.Body>

            /**
             * Clears all GraphQL schemas in the database
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the database name
             * @param {object} params additional parameters if needed
             */
            function clearSchemas(conn: Connection, database: string, params?: object): Promise<HTTP.Body>
        }

        namespace utils {
            /**
             * Returns the QueryType (as a string or null) for the given query.
             *
             * @param {string} query the query for which to get the QueryType
             */
            function queryType(query: string): QueryType;

            /**
             * Returns the default HTTP `Accept` MIME type for the given query.
             *
             * @param {string} query the query for which to get the AcceptMimeType
             */
            function mimeType(query: string): HTTP.AcceptMimeType;
        }
    }

    /** Administrative actions for managing users, roles, and their permissions. */
    export namespace user {

        interface User {
            username: string;
            password: string;
            superuser?: boolean;
        }

        type Action =
            'CREATE' |
            'DELETE' |
            'READ' |
            'WRITE' |
            'GRANT' |
            'REVOKE' |
            'EXECUTE';

        type ResourceType =
            'db' |
            'user' |
            'role' |
            'admin' |
            'metadata' |
            'named-graph' |
            'icv-constraints';

        /**
         * Gets a list of users.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {object} params additional parameters if needed
         */
        function list(conn: Connection, params?: object): Promise<HTTP.Body>;

        /**
         * Gets all information for a given user.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {username} string the username of the user
         * @param {object} params additional parameters if needed
         */
        function get(conn: Connection, username: string, params?: object): Promise<HTTP.Body>;

        /**
         * Creates a new user.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {User} user an object specifying the details of the new user
         * @param {object} params additional parameters if needed
         */
        function create(conn: Connection, user: User, params?: object): Promise<HTTP.Body>;

        /**
         * Changes a user's password.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {string} password the new password for the user
         * @param {object} params additional parameters if needed
         */
        function changePassword(conn: Connection, username: string, password: string, params?: object): Promise<HTTP.Body>;

        /**
         * Verifies that a Connection's credentials are valid.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {object} params additional parameters if needed
         */
        function valid(conn: Connection, params?: object): Promise<HTTP.Body>;

        /**
         * Verifies that a user is enabled.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {object} params additional parameters if needed
         */
        function enabled(conn: Connection, username: string, params?: object): Promise<HTTP.Body>;

        /**
         * Enables/disables a user.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {boolean} enabled a boolean representing the desired status of the user
         * @param {object} params additional parameters if needed
         */
        function enable(conn: Connection, username: string, enabled: boolean, params?: object): Promise<HTTP.Body>;

        /**
         * Sets roles for a user.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {string[]} roles the new list of roles for the user
         * @param {object} params additional parameters if needed
         */
        function setRoles(conn: Connection, username: string, roles: string[], params?: object): Promise<HTTP.Body>;

        /**
         * Gets a list of roles assigned to a user.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {object} params additional parameters if needed
         */
        function listRoles(conn: Connection, username: string, params?: object): Promise<HTTP.Body>;

        /**
         * Creates a new permission for a user over a given resource.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {Permission} permission the permission to be added
         * @param {object} params additional parameters if needed
         */
        function assignPermission(conn: Connection, username: string, permission: Permission, params?: object): Promise<HTTP.Body>;

        /**
         * Removes a permission for a user over a given resource.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {Permission} permission the permission to be removed
         * @param {object} params additional parameters if needed
         */
        function deletePermission(conn: Connection, username: string, permission: Permission, params?: object): Promise<HTTP.Body>;

        /**
         * Gets a list of permissions assigned to user.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {object} params additional parameters if needed
         */
        function permissions(conn: Connection, username: string, params?: object): Promise<HTTP.Body>;

        /**
         * Gets a list of a user's effective permissions.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {object} params additional parameters if needed
         */
        function effectivePermissions(conn: Connection, username: string, params?: object): Promise<HTTP.Body>;

        /**
         * Specifies whether a user is a superuser.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user
         * @param {object} params additional parameters if needed
         */
        function superUser(conn: Connection, username: string, params?: object): Promise<HTTP.Body>;

        /**
         * Deletes a user.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} username the username of the user to be deleted
         * @param {object} params additional parameters if needed
         */
        function remove(conn: Connection, username: string, params?: object): Promise<HTTP.Body>;

        /**
         * Returns a token for the user if the connection is valid.
         *
         * @param {Connection} conn the Stardog server connection
         */
        function token(conn: Connection): Promise<HTTP.Body>;

        /**
         * Returns the username for the given connection.
         *
         * @param {Connection} conn the Stardog server connection
         */
        function whoAmI(conn: Connection): Promise<HTTP.Body>;

        interface Permission {
            action: Action,
            resourceType: ResourceType,
            resources: string[],
        }

        namespace role {
            /**
             * Creates a new role.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {object} role the role to be created
             * @param {object} params additional parameters if needed
             */
            function create(conn: Connection, role: { name: string }, params?: object): Promise<HTTP.Body>;

            /**
             * Lists all existing roles.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {object} params additional parameters if needed
             */
            function list(conn: Connection, params?: object): Promise<HTTP.Body>;

            /**
             * Deletes an existing role from the system.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} role the role to be deleted
             * @param {object} params additional parameters if needed
             */
            function remove(conn: Connection, role: string, params?: object): Promise<HTTP.Body>;

            /**
             * Lists all users that have been assigned a given role.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} role the role to be queried
             * @param {object} params additional parameters if needed
             */
            function usersWithRole(conn: Connection, role: string, params?: object): Promise<HTTP.Body>;

            /**
             * Adds a permission over a given resource to a given role.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} role the role to be given the permission
             * @param {Permission} permission the permission to be added
             * @param {object} params additional parameters if needed
             */
            function assignPermission(conn: Connection, role: string, permission: Permission, params?: object): Promise<HTTP.Body>;

            /**
             * Removes a permission over a given resource from a given role.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} role the role from which to remove the permission
             * @param {Permission} permission the permission to be removed
             * @param {object} params additional parameters if needed
             */
            function deletePermission(conn: Connection, role: string, permission: Permission, params?: object): Promise<HTTP.Body>;

            /**
             * Lists all permissions assigned to a given role.
             *
             * @param {Connection} conn the Stardog server connection
             * @param {string} role the role to be queried
             * @param {object} params additional parameters if needed
             */
            function permissions(conn: Connection, role: string, params?: object): Promise<HTTP.Body>;
        }
    }

    export namespace virtualGraphs {

        interface SharedOptions {
          base?: string;
          'mappings.syntax': string;
          'percent.encode'?: boolean;
          'optimize.import'?: boolean;
          'query.translation'?: 'DEFAULT' | 'LEGACY';
        }

        interface RdbmsOptions extends SharedOptions {
          'jdbc.url'?: string;
          'jdbc.username'?: string;
          'jdbc.password'?: string;
          'jdbc.driver'?: string;
          'parser.sql.quoting'?: 'NATIVE' | 'ANSI';
          'sql.functions'?: string;
          'sql.schemas'?: string;
          'default.mappings.include.tables'?: string;
          'default.mappings.exclude.tables'?: string;
        }

        interface MongoOptions extends SharedOptions {
          'mongodb.uri'?: string;
        }

        interface CsvOptions extends SharedOptions {
          'csv.separator'?: string;
          'csv.quote'?: string;
          'csv.escape'?: string;
          'csv.header'?: boolean;
          'csv.skip.empty'?: boolean;
        }

        type AllVgOptions = SharedOptions & RdbmsOptions & MongoOptions & CsvOptions;

        interface MappingsRequestOptions {
          preferUntransformed?: boolean;
          syntax?: string;
        }

        interface VgMeta {
          db?: string;
          dataSource?: string;
        }

        /**
         * Retrieve a list of virtual graphs
         *
         * @param {Connection} conn the Stardog server connection
         */
        function list(conn: Connection): Promise<HTTP.Body>;

        /**
         * Retrieve a list of virtual graphs info
         *
         * @param {Connection} conn the Stardog server connection
         */
        function listInfo(conn: Connection): Promise<HTTP.Body>;

        /**
         * Add a virtual graph to the system
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the graph name
         * @param {string} mappings an RDF block specifying the mappings
         * @param {Options} options the JDBC (and other) options for the graph
         * @param {VgMeta} meta database name, data source, and other graph specifications
         */
        function add<T extends AllVgOptions>(conn: Connection, name: string, mappings: string, options: T, meta?: VgMeta): Promise<HTTP.Body>;

        /**
         * Update a virtual graph in the system
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the graph name
         * @param {string} mappings an RDF block specifying the mappings
         * @param {Options} options the JDBC (and other) options for the graph
         * @param {VgMeta} meta database name, data source, and other graph specifications
         */
        function update<T extends AllVgOptions>(conn: Connection, name: string, mappings: string, options: T, meta?: VgMeta): Promise<HTTP.Body>;

        /**
         * Remove a virtual graph from the system
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the graph name
         */
        function remove(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Bring a virtual graph online
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the graph name
         */
        function online(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Determine if the named virtual graph is available
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the graph name
         */
        function available(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Retrieve a virtual graph's options
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the graph name
         */
        function options(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Retrieve a virtual graph's mappings
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the graph name
         * @param {MappingsRequestOptions} requestOptions options for the mapping
         */
        function mappings(conn: Connection, name: string, requestOptions?: MappingsRequestOptions): Promise<HTTP.Body>;

        /**
         * Import a JSON or CSV file into a database via `virtual import`.
         *
         * @param {Connection} conn the Stardog server connection
         * @param {object} file the file or its contents
         * @param {string} fileType the file type ('DELIMITED' or 'JSON')
         * @param {string} database the name of the database target
         * @param {object} importOptions additional import data (mappings, properties, namedGraph)
         */
        function importFile(conn: Connection, file: object, fileType: string, database: string, importOptions?: {
          mappings?: string,
          properties?: string,
          namedGraph?: string,
        }): Promise<HTTP.Body>;
    }

    /** Actions to work with server-wide stored functions */
    export namespace storedFunctions {
        /**
         * Adds one or more stored functions to the server
         *
         * @param {Connection} conn the Stardog server connection
         * @param {String} functions one or more stored function definitions
         * @param {object} params additional parameters if needed
         */
        function add(conn: Connection, functions: string, params?: object): Promise<HTTP.Body>

        /**
         * Retrieves the specified function definition
         *
         * @param {Connection} conn the Stardog server connection
         * @param {String} name the name of the function
         * @param {object} params additional parameters if needed
         */
        function get(conn: Connection, name: string, params?: object): Promise<HTTP.Body>

        /**
         * Removes a stored function from the server
         *
         * @param {Connection} conn the Stardog server connection
         * @param {String} name the name of the function
         * @param {object} params additional parameters if needed
         */
        function remove(conn: Connection, name: string, params?: object): Promise<HTTP.Body>

        /**
         * Removes all stored functions from the server
         *
         * @param {Connection} conn the Stardog server connection
         * @param {object} params additional parameters if needed
         */
        function clear(conn: Connection, params?: object): Promise<HTTP.Body>

        /**
         * Retrieves an export of all stored functions on the server
         *
         * @param {Connection} conn the Stardog server connection
         * @param {object} params additional parameters if needed
         */
        function getAll(conn: Connection, params?: object): Promise<HTTP.Body>
    }

    /** Stardog HTTP cluster actions. */
    export namespace cluster {
        /**
         * Retrieves basic information about a Stardog cluster.
         *
         * @param {Connection} conn the Stardog server connection
         */
        function info(conn: Connection): Promise<HTTP.Body>;

        /**
         * Retrieves detailed status information about a Stardog cluster.
         *
         * @param {Connection} conn the Stardog server connection
         */
        function status(conn: Connection): Promise<HTTP.Body>;
    }

    export namespace dataSources {
        /**
         * Retrieve a list of data sources
         *
         * @param {Connection} conn the Stardog server connection
         */
        function list(conn: Connection): Promise<HTTP.Body>;

        /**
         * Retrieve a list of data sources info
         *
         * @param {Connection} conn the Stardog server connection
         */
        function listInfo(conn: Connection): Promise<HTTP.Body>;

        /**
         * Retrieve the named data source info
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         */
        function info(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Add a data source to the system
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         * @param {Options} options the JDBC (and other) options for the data source
         */
        function add<T>(conn: Connection, name: string, options: T): Promise<HTTP.Body>;

        /**
         * Update the named data source in the system
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         * @param {Options} options the JDBC (and other) options for the data source
         * @param {object} requestOptions additional options for the request
         */
        function update<T>(conn: Connection, name: string, options: T, requestOptions?: { force: boolean }): Promise<HTTP.Body>;

        /**
         * Remove the named data source from the system
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         * @param {object} params the query string parameters
         */
        function remove(conn: Connection, name: string, params?: object): Promise<HTTP.Body>;

        /**
         * Change a private data source to a shared one
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         */
        function share(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Bring the named data source online
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         */
        function online(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Determine if the named data source is available
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         */
        function available(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Retrieve the named data source options
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         */
        function options(conn: Connection, name: string): Promise<HTTP.Body>;

        /**
         * Retrieve the named data source metadata
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         * @param {object} options additional options if needed
         */
        function getMetadata(conn: Connection, name: string, options: object): Promise<HTTP.Body>;

        /**
         * Update the named data source metadata
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         * @param {Metadata} metadata the data source metadata
         * @param {object} options additional options if needed
         */
        function updateMetadata<T>(conn: Connection, name: string, metadata: T, options: object): Promise<HTTP.Body>;

        /**
         * Query data source
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         * @param {string} dataSourceQuery the data source query
         */
        function query(conn: Connection, name: string, dataSourceQuery: string): Promise<HTTP.Body>;

        /**
         * Refresh table row-count estimates
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         * @param {string} tableName optional data source table name
         */
        function refreshCounts(conn: Connection, name: string, tableName?: string): Promise<HTTP.Body>;

        /**
         * Refresh metadata
         *
         * @param {Connection} conn the Stardog server connection
         * @param {string} name the data source name
         * @param {string} tableName optional data source table name
         */
        function refreshMetadata(conn: Connection, name: string, tableName?: string): Promise<HTTP.Body>;
    }
}

// No idea why I need this, but this is what removes the extra level of nesting
export = Stardog;
