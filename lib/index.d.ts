// TypeScript Version: 2.1

import Headers from 'fetch-ponyfill';

declare global {
  
  /** stardog.js: The Stardog JS API*/
  namespace Stardog {

    type ContentMimeTypes =
        'application/x-turtle' |
        'text/turtle' |
        'application/rdf+xml' |
        'text/plain' |
        'application/x-trig' |
        'text/x-nquads' |
        'application/trix';
        
    type AcceptMimeTypes =
        'text/plain' |
        'application/json' |
        'text/boolean';

    interface HTTPMessage {
        status: string;
        statusText: string;
    }

    interface HTTPBody {
        status: string;
        statusText: string;
        result: Object | string | boolean | null;
    }
    
    interface ConnectionOptions {
        endpoint: string;
        username: string;
        password: string;
    }

    /** Describes the connection to a running Stardog server. */
    class Connection {
        constructor(ConnectionOptions);

        config(options: ConnectionOptions): void;
        headers(): Headers;
        uri(...resource: string[]): string;
    }
    
    namespace server {
        /** Shuts down a Stardog server. */
        function shutdown(conn: Connection, params?: Object) : Promise<HTTPMessage>;
    }

    /** Stardog database actions. */
    namespace db {

        /** Creates a new database. */
        function create(conn: Connection, database: string, databaseOptions?: Object, options?: { files: string[] }, params?: Object): Promise<HTTPMessage>;
        /** Deletes a database. */
        function drop(conn: Connection, database: string, params?: Object) : Promise<HTTPMessage>;
        /** Gets information about a database. */
        function get(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Sets a database offline. */
        function offline(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Sets a database online. */
        function online(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Optimizes a database. */
        function optimize(conn: Connection, database: string, params?: Object) : Promise<HTTPMessage>;
        /** Makes a copy of a database. */
        function copy(conn: Connection, database: string, destination: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of all databases on a Stardog server. */
        function list(conn: Connection, params?: Object) : Promise<HTTPBody>;
        /** Gets number of triples in a database. */
        function size(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Clears the contents of a database. */
        function clear(conn: Connection, database: string, transactionId: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a mapping of the namespaces used in a database. */
        function namespaces(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Exports the contents of a database. */
        function exportData(conn: Connection, database: string, options?: { mimeType: AcceptMimeTypes }, params?: { graphUri: string }) : Promise<HTTPBody>;

        /** Database options. */
        namespace options {
            /** Gets set of options on a database. */
            function get(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
            /** Sets options on a database. */
            function set(conn: Connection, database: string, databaseOptions: Object, params?: Object) : Promise<HTTPMessage>;
        }

        interface TransactionResponse extends HTTPBody {
            transactionId: string
        }
        interface TransactionOptions {
            contentType: ContentMimeTypes,
            encoding: Encodings
        }
        type Encodings =
            'gzip' |
            'compress' |
            'deflate' |
            'identity' |
            'br';
        /** Methods for managing transactions in a database. */
        namespace transaction {
            /** Begins a new transaction. */
            function begin(conn: Connection, database: string, params?: Object) : Promise<TransactionResponse>;
            /** Evaluates a SPARQL query within a transaction. */
            function query(conn: Connection, database: string, transactionId: string, query: string, params?: Object) : Promise<TransactionResponse>;
            /** Adds a set of statements to a transaction request. */
            function add(conn: Connection, database: string, transactionId: string, content: string, options: TransactionOptions, params?: Object) : Promise<TransactionResponse>;
            /** Performs a rollback in a given transaction. */
            function rollback(conn: Connection, database: string, transactionId: string, params?: Object) : Promise<TransactionResponse>;
            /** Commits a transaction to the database, removing the transaction and making its changes permanent. */
            function commit(conn: Connection, database: string, transactionId: string, params?: Object) : Promise<TransactionResponse>;
            /** Removes a set of statements from a transaction request. */
            function remove(conn: Connection, database: string, transactionId: string, content: string, options: TransactionOptions, params?: Object) : Promise<TransactionResponse>;
        }

        /** Methods for managing integrity constraints in a database. */
        namespace icv {
            /** Gets the set of integrity constraints on a given database. */
            function get(conn: Connection, database: string, options: Object, params?: Object) : Promise<HTTPBody>;
            /** Sets a new set of integrity constraints on a given database. */
            function set(conn: Connection, database: string, icvAxioms: string, options?: { contentType: ContentMimeTypes }, params?: Object) : Promise<HTTPMessage>;
            /** Removes all integrity constraints from a given database. */
            function clear(conn: Connection, database: string, options: Object, params?: Object) : Promise<HTTPMessage>;
            /** Converts a set of integrity constraints into an equivalent SPARQL query for a given database. */
            function convert(conn: Connection, database: string, icvAxioms: string, options: { contentType: ContentMimeTypes }, params?: { graphUri: string }) : Promise<HTTPBody>;
        }
    }

    interface PropertyOptions {
        uri: string,
        property: string
    }
    /** Query actions to perform on a database. */
    namespace query {
        /** Gets the values for a specific property of a URI individual. */
        function property(conn: Connection, database: string, config: PropertyOptions, params?: Object) : Promise<HTTPBody>;
        /** Gets the query plan generated by Stardog for a given SPARQL query. */
        function explain(conn: Connection, database: string, query: string, params?: Object) : Promise<HTTPBody>
        /** Executes a query against a database. */
        function execute(conn: Connection, database: string, query: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of actively running queries. */
        function list(conn: Connection) : Promise<HTTPBody>;
        /** Kills an actively running query. */
        function kill(conn: Connection, queryId: string) : Promise<HTTPMessage>;
        /** Gets information about an actively running query. */
        function get(conn: Connection, queryId: string) : Promise<HTTPBody>;

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
            function create(conn: Connection, config: StoredQueryOptions, params?: Object) : Promise<HTTPBody> 
            /** Lists all stored queries. */
            function list(conn: Connection, params?: Object) : Promise<HTTPBody>
            /** Removes a given stored query. */
            function remove(conn: Connection, storedQuery: string, params?: Object) : Promise<HTTPBody>
        }
    }

    /** Administrative actions for managing users, roles, and their permissions. */
    namespace user {

        interface User {
            username: string;
            password: string;
            superuser?: boolean;
        }

        interface Role {
            rolename: string;
        }

        interface Permission {
            action: Action,
            resourceType: ResourceType,
            resources: string[],
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
        function list(conn: Connection, params?: Object) : Promise<HTTPBody>;
        /** Creates a new user. */
        function create(conn: Connection, user: User, params?: Object) : Promise<HTTPBody>;
        /** Changes a user's password. */
        function changePassword(conn: Connection, username: string, password: string, params?: Object) : Promise<HTTPBody>;
        /** Verifies that a user is enabled. */
        function enabled(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Enables/disables a user. */
        function enable(conn: Connection, username: string, enabled: boolean, params?: Object) : Promise<HTTPMessage>;
        /** Sets roles for a user. */
        function setRoles(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of roles assigned to a user. */
        function listRoles(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Creates a new permission for a user over a given <ResourceType>. */
        function assignPermission(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Removes a permission for a user over a given <ResourceType>. */
        function deletePermission(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of permissions assigned to user. */
        function permissions(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of a user's effective permissions. */
        function effectivePermissions(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Verifies that a user is a superuser. */
        function superUser(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Deletes a user. */
        function remove(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        
        namespace role {
            /** Creates a new role. */
            function create(conn: Connection, role: Role, params?: Object) : Promise<HTTPMessage>;
            /** Lists all existing roles. */
            function list(conn: Connection, params?: Object) : Promise<HTTPBody>;
            /** Deletes an existing role from the system. */
            function remove(conn: Connection, role: Role, params?: Object) : Promise<HTTPMessage>;
            /** Lists all users that have been assigned a given role. */
            function usersWithRole(conn: Connection, role: Role, params?: Object) : Promise<HTTPBody>;
            /** Adds a permission over a given resource to a given role. */
            function assignPermission(conn: Connection, role: Role, permission: Permission, params?: Object) : Promise<HTTPBody>;
            /** Removes a permission over a given resource from a given role. */
            function deletePermission(conn: Connection, role: Role, permission: Permission, params?: Object) : Promise<HTTPMessage>;
            /** Lists all permissions assigned to a given role. */
            function permissions(conn: Connection, role: Role, params?: Object) : Promise<HTTPBody>;
        }
    }
  }
}
