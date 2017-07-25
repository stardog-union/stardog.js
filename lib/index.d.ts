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
            'text/boolean';

        export interface Body {
            status: string;
            statusText: string;
            result: object | string | boolean | null;
            ok: boolean;
            headers: Headers;
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
        function shutdown(conn: Connection, params?: Object): Promise<HTTP.Body>;
    }

    /** Stardog database actions. */
    export namespace db {
        /**
         * Creates a new database.
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database to create
         * @param databaseOptions an object specifying the various metadata options for this database. @see {@link https://github.com/stardog-union/stardog.js/blob/master/lib/db/dbopts.js} @see {@link https://www.stardog.com/docs/#_database_admin}
         * @param options an object specifying a list of RDF files to bulk load into the database at creation time
         * @param params additional parameters if needed
         */
        function create(conn: Connection, database: string, databaseOptions?: Object, options?: { files: string[] }, params?: Object): Promise<HTTP.Body>;

        /**
         * Deletes a database.
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database to delete
         * @param params additional parameters if needed
         */
        function drop(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;
        
        /** 
         * Gets an RDF representation of a database. @see {@link https://www.w3.org/TR/sparql11-http-rdf-update/#http-get}
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database
         * @param params additional parameters if needed
         */
        function get(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Sets a database offline. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database to offline
         * @param params additional parameters if needed
         */
        function offline(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Sets a database online. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database to online
         * @param params additional parameters if needed
         */
        function online(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Optimizes a database.
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database to optimize
         * @param params additional parameters if needed
         */
        function optimize(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Makes a copy of a database. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database to copy
         * @param destination the name of the new copy of the database
         * @param params additional parameters if needed
         */
        function copy(conn: Connection, database: string, destination: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Gets a list of all databases on a Stardog server. 
         * 
         * @param conn the Stardog server connection
         * @param params additional parameters if needed
         */
        function list(conn: Connection, params?: Object): Promise<HTTP.Body>;

        /** 
         * Gets number of triples in a database. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database
         * @param params additional parameters if needed
         */
        function size(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Clears the contents of a database. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database to clear
         * @param params additional parameters if needed
         */
        function clear(conn: Connection, database: string, transactionId: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Gets a mapping of the namespaces used in a database. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database
         * @param params additional parameters if needed
         */
        function namespaces(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Exports the contents of a database. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database to clear
         * @param options an object specifying the desired HTTP MIME type. Default: text/turtle
         * @param params an object specifying the URI of a named graph to export. Default: ALL
         */
        function exportData(conn: Connection, database: string, options?: { mimeType: HTTP.AcceptMimeTypes }, params?: { graphUri: string }): Promise<HTTP.Body>;

        /** Database options. */
        namespace options {
            /** Gets set of options on a database. */
            function get(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;
            /** Sets options on a database. */
            function set(conn: Connection, database: string, databaseOptions: Object, params?: Object): Promise<HTTP.Body>;
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
             * @param conn the Stardog server connection
             * @param database the name of the database on which to open the transaction
             * @param params additional parameters if needed
             */
            function begin(conn: Connection, database: string, params?: Object): Promise<TransactionResponse>;

            /** 
             * Evaluates a SPARQL query within a transaction. 
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database to query
             * @param transactionId the UUID of the transaction as returned by {@link #begin}
             * @param params additional parameters if needed
             */
            function query(conn: Connection, database: string, transactionId: string, query: string, params?: Object): Promise<TransactionResponse>;

            /** 
             * Adds data within a transaction. 
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database to which to add data
             * @param transactionId the UUID of the transaction as returned by {@link #begin}
             * @param content a block of RDF data to add
             * @param options an object specifying the contentType of the RDF data (e.g., text/turtle)
             * @param params additional parameters if needed
             */
            function add(conn: Connection, database: string, transactionId: string, content: string, options: TransactionOptions, params?: Object): Promise<TransactionResponse>;

            /** 
             * Rolls back a transaction, removing the transaction and undoing all changes
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database
             * @param transactionId the UUID of the transaction to roll back as returned by {@link #begin}
             * @param params additional parameters if needed
             */
            function rollback(conn: Connection, database: string, transactionId: string, params?: Object): Promise<TransactionResponse>;

            /** 
             * Commits a transaction to the database, removing the transaction and making its changes permanent. 
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database
             * @param transactionId the UUID of the transaction to commit as returned by {@link #begin}
             * @param params additional parameters if needed
             */
            function commit(conn: Connection, database: string, transactionId: string, params?: Object): Promise<TransactionResponse>;
            
            /** 
             * Removes data within a transaction.
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database from which to remove data
             * @param transactionId the UUID of the transaction as returned by {@link #begin}
             * @param content a block of RDF data to remove
             * @param options an object specifying the contentType of the RDF data. Default: text/turtle
             * @param params additional parameters if needed
             */
            function remove(conn: Connection, database: string, transactionId: string, content: string, options: TransactionOptions, params?: Object): Promise<TransactionResponse>;
        }

        /** Methods for managing integrity constraints in a database. */
        namespace icv {
            /** 
             * Gets the set of integrity constraints on a given database. 
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database
             * @param params additional parameters if needed
             */
            function get(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;

            /** 
             * Sets the integrity constraints on a given database. 
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database
             * @param icvAxioms an RDF block containing the axioms to be added
             * @param options an object specifying the contentType of the RDF data. Default: text/turtle
             * @param params additional parameters if needed
             */
            function set(conn: Connection, database: string, icvAxioms: string, options?: { contentType: HTTP.ContentMimeTypes }, params?: Object): Promise<HTTP.Body>;

            /** 
             * Removes all integrity constraints from a given database. 
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database
             * @param params additional parameters if needed
             */
            function clear(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;

            /** 
             * Converts a set of integrity constraints into an equivalent SPARQL query for a given database.
             * 
             * @param conn the Stardog server connection
             * @param database the name of the database
             * @param icvAxioms an RDF block containing the axioms to be added
             * @param options an object specifying the contentType of the RDF data. Default: text/turtle
             * @param params additional parameters if needed
             */
            function convert(conn: Connection, database: string, icvAxioms: string, options: { contentType: HTTP.ContentMimeTypes }, params?: { graphUri: string }): Promise<HTTP.Body>;
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
         * @param conn the Stardog server connection
         * @param database the name of the database
         * @param config an object specifying the URI and property to retrieve
         * @param params additional parameters if needed
         */
        function property(conn: Connection, database: string, config: PropertyOptions, params?: Object): Promise<HTTP.Body>;

        /** 
         * Gets the query plan generated by Stardog for a given SPARQL query. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database
         * @param query the SPARQL query to be explained
         * @param params additional parameters if needed
         */
        function explain(conn: Connection, database: string, query: string, params?: Object): Promise<HTTP.Body>

        /** 
         * Executes a query against a database. 
         * 
         * @param conn the Stardog server connection
         * @param database the name of the database
         * @param query the SPARQL query to be executed
         * @param params additional parameters if needed
         */
        function execute(conn: Connection, database: string, query: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Gets a list of actively running queries. 
         * 
         * @param conn the Stardog server connection
         */
        function list(conn: Connection): Promise<HTTP.Body>;

        /** 
         * Kills an actively running query. 
         * 
         * @param conn the Stardog server connection
         * @param queryId the ID of the query to be killed
         */
        function kill(conn: Connection, queryId: string): Promise<HTTP.Body>;

        /** 
         * Gets information about an actively running query. 
         * 
         * @param conn the Stardog server connection
         * @param queryId the ID of the query
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
             * @param conn the Stardog server connection
             * @param config an object specifying the options to set on the new query
             * @param params additional parameters if needed
             */
            function create(conn: Connection, config: StoredQueryOptions, params?: Object): Promise<HTTP.Body>

            /** 
             * Lists all stored queries. 
             * 
             * @param conn the Stardog server connection
             * @param params additional parameters if needed
             */
            function list(conn: Connection, params?: Object): Promise<HTTP.Body>

            /** 
             * Removes a given stored query.
             * 
             * @param conn the Stardog server connection
             * @param storedQuery the name of the stored query to be removed
             * @param params additional parameters if needed
             */
            function remove(conn: Connection, storedQuery: string, params?: Object): Promise<HTTP.Body>
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
         * @param conn the Stardog server connection
         * @param params additional parameters if needed
         */
        function list(conn: Connection, params?: Object): Promise<HTTP.Body>;

        /** 
         * Creates a new user. 
         * 
         * @param conn the Stardog server connection
         * @param user an object specifying the details of the new user
         * @param params additional parameters if needed
         */
        function create(conn: Connection, user: User, params?: Object): Promise<HTTP.Body>;

        /** 
         * Changes a user's password. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param password the new password for the user
         * @param params additional parameters if needed
         */
        function changePassword(conn: Connection, username: string, password: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Verifies that a user is enabled.
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param params additional parameters if needed
         */
        function enabled(conn: Connection, username: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Enables/disables a user.
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param enabled a boolean representing the desired status of the user
         * @param params additional parameters if needed
         */
        function enable(conn: Connection, username: string, enabled: boolean, params?: Object): Promise<HTTP.Body>;

        /** 
         * Sets roles for a user. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param roles the new list of roles for the user
         * @param params additional parameters if needed
         */
        function setRoles(conn: Connection, username: string, roles: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Gets a list of roles assigned to a user. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param params additional parameters if needed
         */
        function listRoles(conn: Connection, username: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Creates a new permission for a user over a given {@link #ResourceType}. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param permission the permission to be added
         * @param params additional parameters if needed
         */
        function assignPermission(conn: Connection, username: string, permission: Permission, params?: Object): Promise<HTTP.Body>;

        /** 
         * Removes a permission for a user over a given {@link #ResourceType}. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param permission the permission to be removed
         * @param params additional parameters if needed
         */
        function deletePermission(conn: Connection, username: string, permission: Permission, params?: Object): Promise<HTTP.Body>;

        /** 
         * Gets a list of permissions assigned to user. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param params additional parameters if needed
         */
        function permissions(conn: Connection, username: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Gets a list of a user's effective permissions. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param params additional parameters if needed
         */
        function effectivePermissions(conn: Connection, username: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Specifies whether a user is a superuser. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user
         * @param params additional parameters if needed
         */
        function superUser(conn: Connection, username: string, params?: Object): Promise<HTTP.Body>;

        /** 
         * Deletes a user. 
         * 
         * @param conn the Stardog server connection
         * @param username the username of the user to be deleted
         * @param params additional parameters if needed
         */
        function remove(conn: Connection, username: string, params?: Object): Promise<HTTP.Body>;

        interface Role {
            rolename: string;
        }

        interface Permission {
            action: Action,
            resourceType: ResourceType,
            resources: string[],
        }

        namespace role {
            /** 
             * Creates a new role. 
             * 
             * @param conn the Stardog server connection
             * @param role the role to be created
             * @param params additional parameters if needed
             */
            function create(conn: Connection, role: Role, params?: Object): Promise<HTTP.Body>;

            /** 
             * Lists all existing roles. 
             * 
             * @param conn the Stardog server connection
             * @param params additional parameters if needed
             */
            function list(conn: Connection, params?: Object): Promise<HTTP.Body>;

            /** 
             * Deletes an existing role from the system. 
             * 
             * @param conn the Stardog server connection
             * @param role the role to be deleted
             * @param params additional parameters if needed
             */
            function remove(conn: Connection, role: Role, params?: Object): Promise<HTTP.Body>;

            /** 
             * Lists all users that have been assigned a given role. 
             * 
             * @param conn the Stardog server connection
             * @param role the role to be queried
             * @param params additional parameters if needed
             */
            function usersWithRole(conn: Connection, role: Role, params?: Object): Promise<HTTP.Body>;

            /** 
             * Adds a permission over a given resource to a given role. 
             * 
             * @param conn the Stardog server connection
             * @param role the role to be given the permission
             * @param permission the permission to be added
             * @param params additional parameters if needed
             */
            function assignPermission(conn: Connection, role: Role, permission: Permission, params?: Object): Promise<HTTP.Body>;

            /** 
             * Removes a permission over a given resource from a given role. 
             * 
             * @param conn the Stardog server connection
             * @param role the role from which to remove the permission
             * @param permission the permission to be removed
             * @param params additional parameters if needed
             */
            function deletePermission(conn: Connection, role: Role, permission: Permission, params?: Object): Promise<HTTP.Body>;

            /** 
             * Lists all permissions assigned to a given role. 
             * 
             * @param conn the Stardog server connection
             * @param role the role to be queried
             * @param params additional parameters if needed
             */
            function permissions(conn: Connection, role: Role, params?: Object): Promise<HTTP.Body>;
        }
    }
}

// No idea why I need this, but this is what removes the extra level of nesting
export = Stardog;
