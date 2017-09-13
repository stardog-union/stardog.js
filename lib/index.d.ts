// TypeScript Version: 2.1

/** stardog.js: The Stardog JS API*/

import Headers from 'fetch-ponyfill';

declare namespace Stardog {
    namespace HTTP {
        export type ContentMimeTypes =
            'application/x-turtle' |
            'text/turtle' |
            'application/rdf+xml' |
            'text/plain' |
            'application/x-trig' |
            'text/x-nquads' |
            'application/trix';

        export type AcceptMimeTypes =
            'text/plain' |
            'application/json' |
            'text/boolean' | 
            'text/turtle';

        export interface Body {
            status: string;
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
        password: string;
    }

    /** Current version of stardog.js. Maps to package.json */
    export const version: string;

    /** Describes the connection to a running Stardog server. */
    export class Connection {
        constructor(options: ConnectionOptions);

        config(options: ConnectionOptions): void;
        headers(): Headers;
        uri(...resource: string[]): string;
    }

    /** Stardog HTTP server actions. */
    export namespace server {
        /** Shuts down a Stardog server. */
        function shutdown(conn: Connection, params?: object): Promise<HTTP.Body>;
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
         * Makes a copy of a database. 
         * 
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to copy
         * @param {string} destination the name of the new copy of the database
         * @param {object} params additional parameters if needed
         */
        function copy(conn: Connection, database: string, destination: string, params?: object): Promise<HTTP.Body>;

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
         * Gets a mapping of the namespaces used in a database. 
         * 
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {object} params additional parameters if needed
         */
        function namespaces(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

        /** 
         * Exports the contents of a database. 
         * 
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database to clear
         * @param {object} options an object specifying the desired HTTP MIME type. Default: text/turtle
         * @param {object} params an object specifying the URI of a named graph to export. Default: ALL
         */
        function exportData(conn: Connection, database: string, options?: { mimeType: HTTP.AcceptMimeTypes }, params?: { graphUri: string }): Promise<HTTP.Body>;

        /** Database options. */
        namespace options {
            /** Gets set of options on a database. */
            function get(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;
            /** Sets options on a database. */
            function set(conn: Connection, database: string, databaseOptions: object, params?: object): Promise<HTTP.Body>;
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
                contentType: HTTP.ContentMimeTypes,
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
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} icvAxioms an RDF block containing the axioms to be added
             * @param {object} options an object specifying the contentType of the icvAxioms parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function add(conn: Connection, database: string, icvAxioms: string, options?: { contentType: HTTP.ContentMimeTypes }, params?: object): Promise<HTTP.Body>;

            /** 
             * Removes integrity constraints from a given database. 
             * 
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} icvAxioms an RDF block containing the axioms to be removed
             * @param {object} options an object specifying the contentType of the icvAxioms parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function remove(conn: Connection, database: string, icvAxioms: string, options?: { contentType: HTTP.ContentMimeTypes }, params?: object): Promise<HTTP.Body>;

            /** 
             * Removes all integrity constraints from a given database. 
             * 
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {object} params additional parameters if needed
             */
            function clear(conn: Connection, database: string, params?: object): Promise<HTTP.Body>;

            /** 
             * Converts a set of integrity constraints into an equivalent SPARQL query for a given database.
             * 
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} icvAxioms an RDF block containing the axioms to be added
             * @param {object} options an object specifying the contentType of the icvAxioms parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function convert(conn: Connection, database: string, icvAxioms: string, options: { contentType: HTTP.ContentMimeTypes }, params?: { graphUri: string }): Promise<HTTP.Body>;

            /**
             * Checks constraints to see if they are valid
             * 
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} constraints an RDF block containing the constraints to be validated
             * @param {object} options an object specifying the contentType of the constraints parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function validate(conn: Connection, database: string, constraints: string, options: { contentType: HTTP.ContentMimeTypes }, params?: { graphUri: string }): Promise<HTTP.Body>;

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
            function validateInTx(conn: Connection, database: string, constraints: string, transactionId: string, options: { contentType: HTTP.ContentMimeTypes }, params?: { graphUri: string }): Promise<HTTP.Body>;

            /**
             * Accepts integrity constraints as RDF and returns the violation explanations, if any, as RDF.
             * 
             * @param {Connection} conn the Stardog server connection
             * @param {string} database the name of the database
             * @param {string} constraints an RDF block containing the constraints to be validated
             * @param {object} options an object specifying the contentType of the constraints parameter. Default: text/turtle
             * @param {object} params additional parameters if needed
             */
            function violations(conn: Connection, database: string, constraints: string, options: { contentType: HTTP.ContentMimeTypes }, params?: { graphUri: string }): Promise<HTTP.Body>;

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
            function violationsInTx(conn: Connection, database: string, constraints: string, options?: { contentType: HTTP.ContentMimeTypes }, params?: { graphUri: string }): Promise<HTTP.Body>;
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
    }

    /** Query actions to perform on a database. */
    export namespace query {

        interface PropertyOptions {
            uri: string,
            property: string
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
         * @param {object} params additional parameters if needed
         */
        function explain(conn: Connection, database: string, query: string, params?: object): Promise<HTTP.Body>

        /** 
         * Executes a query against a database. 
         * 
         * @param {Connection} conn the Stardog server connection
         * @param {string} database the name of the database
         * @param {string} query the SPARQL query to be executed
         * @param {object} options additional options to customize query
         * @param {object} params additional parameters if needed
         */
        function execute(conn: Connection, database: string, query: string, options?: { accept: HTTP.AcceptMimeTypes }, params?: object): Promise<HTTP.Body>;

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
        function executeInTransaction(conn: Connection, database: string, transactionId: string, query: string, options?: { accept: HTTP.AcceptMimeTypes }, params?: object): Promise<HTTP.Body>;

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
            shared: boolean
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
             * Removes a given stored query.
             * 
             * @param {Connection} conn the Stardog server connection
             * @param {string} storedQuery the name of the stored query to be removed
             * @param {object} params additional parameters if needed
             */
            function remove(conn: Connection, storedQuery: string, params?: object): Promise<HTTP.Body>
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
            function create(conn: Connection, role: { rolename: string }, params?: object): Promise<HTTP.Body>;

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
}

// No idea why I need this, but this is what removes the extra level of nesting
export = Stardog;
