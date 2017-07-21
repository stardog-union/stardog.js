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

        interface ConnectionOptions {
            endpoint: string;
            username: string;
            password: string;
        }
    }

    /** Current version of stardog.js. Maps to package.json */
    export const version: string;

    /** Describes the connection to a running Stardog server. */
    export class Connection {
        constructor(options: Reference.ConnectionOptions);

        config(options: Reference.ConnectionOptions): void;
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
        /** Creates a new database. */
        function create(conn: Connection, database: string, databaseOptions?: Object, options?: { files: string[] }, params?: Object): Promise<HTTP.Body>;
        /** Deletes a database. */
        function drop(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;
        /** Gets information about a database. */
        function get(conn: Connection, database: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Sets a database offline. */
        function offline(conn: Connection, database: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Sets a database online. */
        function online(conn: Connection, database: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Optimizes a database. */
        function optimize(conn: Connection, database: string, params?: Object): Promise<HTTP.Body>;
        /** Makes a copy of a database. */
        function copy(conn: Connection, database: string, destination: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Gets a list of all databases on a Stardog server. */
        function list(conn: Connection, params?: Object): Promise<Reference.HTTP.Body>;
        /** Gets number of triples in a database. */
        function size(conn: Connection, database: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Clears the contents of a database. */
        function clear(conn: Connection, database: string, transactionId: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Gets a mapping of the namespaces used in a database. */
        function namespaces(conn: Connection, database: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Exports the contents of a database. */
        function exportData(conn: Connection, database: string, options?: { mimeType: Reference.HTTP.AcceptMimeTypes }, params?: { graphUri: string }): Promise<Reference.HTTP.Body>;

        /** Database options. */
        namespace options {
            /** Gets set of options on a database. */
            function get(conn: Connection, database: string, params?: Object): Promise<Reference.HTTP.Body>;
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

            interface TransactionResponse extends Reference.HTTP.Body {
                transactionId: string
            }

            interface TransactionOptions {
                contentType: Reference.HTTP.ContentMimeTypes,
                encoding: Encodings
            }


            /** Begins a new transaction. */
            function begin(conn: Connection, database: string, params?: Object): Promise<TransactionResponse>;
            /** Evaluates a SPARQL query within a transaction. */
            function query(conn: Connection, database: string, transactionId: string, query: string, params?: Object): Promise<TransactionResponse>;
            /** Adds a set of statements to a transaction request. */
            function add(conn: Connection, database: string, transactionId: string, content: string, options: TransactionOptions, params?: Object): Promise<TransactionResponse>;
            /** Performs a rollback in a given transaction. */
            function rollback(conn: Connection, database: string, transactionId: string, params?: Object): Promise<TransactionResponse>;
            /** Commits a transaction to the database, removing the transaction and making its changes permanent. */
            function commit(conn: Connection, database: string, transactionId: string, params?: Object): Promise<TransactionResponse>;
            /** Removes a set of statements from a transaction request. */
            function remove(conn: Connection, database: string, transactionId: string, content: string, options: TransactionOptions, params?: Object): Promise<TransactionResponse>;
        }

        /** Methods for managing integrity constraints in a database. */
        namespace icv {
            /** Gets the set of integrity constraints on a given database. */
            function get(conn: Connection, database: string, options: Object, params?: Object): Promise<Reference.HTTP.Body>;
            /** Sets a new set of integrity constraints on a given database. */
            function set(conn: Connection, database: string, icvAxioms: string, options?: { contentType: HTTP.ContentMimeTypes }, params?: Object): Promise<HTTP.Body>;
            /** Removes all integrity constraints from a given database. */
            function clear(conn: Connection, database: string, options: Object, params?: Object): Promise<HTTP.Body>;
            /** Converts a set of integrity constraints into an equivalent SPARQL query for a given database. */
            function convert(conn: Connection, database: string, icvAxioms: string, options: { contentType: Reference.HTTP.ContentMimeTypes }, params?: { graphUri: string }): Promise<Reference.HTTP.Body>;
        }
    }

    /** Query actions to perform on a database. */
    export namespace query {

        interface PropertyOptions {
            uri: string,
            property: string
        }

        /** Gets the values for a specific property of a URI individual. */
        function property(conn: Connection, database: string, config: PropertyOptions, params?: Object): Promise<Reference.HTTP.Body>;
        /** Gets the query plan generated by Stardog for a given SPARQL query. */
        function explain(conn: Connection, database: string, query: string, params?: Object): Promise<Reference.HTTP.Body>
        /** Executes a query against a database. */
        function execute(conn: Connection, database: string, query: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Gets a list of actively running queries. */
        function list(conn: Connection): Promise<Reference.HTTP.Body>;
        /** Kills an actively running query. */
        function kill(conn: Connection, queryId: string): Promise<HTTP.Body>;
        /** Gets information about an actively running query. */
        function get(conn: Connection, queryId: string): Promise<Reference.HTTP.Body>;

        interface StoredQueryOptions {
            name: string,
            database: string,
            query: string,
            /** Defaults to false. */
            shared: boolean
        }

        /** Manages stored queries. */
        namespace stored {
            /** Stores a query in Stardog, either on the system level or for a given database. */
            function create(conn: Connection, config: StoredQueryOptions, params?: Object): Promise<Reference.HTTP.Body>
            /** Lists all stored queries. */
            function list(conn: Connection, params?: Object): Promise<Reference.HTTP.Body>
            /** Removes a given stored query. */
            function remove(conn: Connection, storedQuery: string, params?: Object): Promise<Reference.HTTP.Body>
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

        /** Gets a list of users. */
        function list(conn: Connection, params?: Object): Promise<Reference.HTTP.Body>;
        /** Creates a new user. */
        function create(conn: Connection, user: User, params?: Object): Promise<Reference.HTTP.Body>;
        /** Changes a user's password. */
        function changePassword(conn: Connection, username: string, password: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Verifies that a user is enabled. */
        function enabled(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Enables/disables a user. */
        function enable(conn: Connection, username: string, enabled: boolean, params?: Object): Promise<HTTP.Body>;
        /** Sets roles for a user. */
        function setRoles(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Gets a list of roles assigned to a user. */
        function listRoles(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Creates a new permission for a user over a given <ResourceType>. */
        function assignPermission(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Removes a permission for a user over a given <ResourceType>. */
        function deletePermission(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Gets a list of permissions assigned to user. */
        function permissions(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Gets a list of a user's effective permissions. */
        function effectivePermissions(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Verifies that a user is a superuser. */
        function superUser(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;
        /** Deletes a user. */
        function remove(conn: Connection, username: string, params?: Object): Promise<Reference.HTTP.Body>;

        interface Role {
            rolename: string;
        }

        interface Permission {
            action: Action,
            resourceType: ResourceType,
            resources: string[],
        }

        namespace role {
            /** Creates a new role. */
            function create(conn: Connection, role: Role, params?: Object): Promise<HTTP.Body>;
            /** Lists all existing roles. */
            function list(conn: Connection, params?: Object): Promise<Reference.HTTP.Body>;
            /** Deletes an existing role from the system. */
            function remove(conn: Connection, role: Role, params?: Object): Promise<HTTP.Body>;
            /** Lists all users that have been assigned a given role. */
            function usersWithRole(conn: Connection, role: Role, params?: Object): Promise<Reference.HTTP.Body>;
            /** Adds a permission over a given resource to a given role. */
            function assignPermission(conn: Connection, role: Role, permission: Permission, params?: Object): Promise<Reference.HTTP.Body>;
            /** Removes a permission over a given resource from a given role. */
            function deletePermission(conn: Connection, role: Role, permission: Permission, params?: Object): Promise<HTTP.Body>;
            /** Lists all permissions assigned to a given role. */
            function permissions(conn: Connection, role: Role, params?: Object): Promise<Reference.HTTP.Body>;
        }
    }
}

// No idea why I need this, but this is what removes the extra level of nesting
export = Stardog;
