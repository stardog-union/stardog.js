// Type definitions for stardog.js 0.3.1
// Project: https://github.com/stardog-union/stardog.js
// Definitions by: Stephen Nowell <http://github.com/snowell>, Ty Soehngen <http://github.com/tysoeh>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

import Headers from 'fetch-ponyfill';
import Guid from '@types/node';

declare global {
  
  /** stardog.js: The Stardog JS API*/
  namespace Stardog {

    type ContentType =
        'application/x-turtle' |
        'text/turtle' |
        'application/rdf+xml' |
        'text/plain' |
        'application/x-trig' |
        'text/x-nquads' |
        'application/trix';
    
    type MIMEType =
        'text/plain' |
        'application/json' |
        'text/boolean';

    interface HTTPOptions {
        headers?: Headers;
        method?: string;
        mimeType?: MIMEType;
        contentType?: ContentType;
    }

    interface QueryOptions {
        query: string;
        baseURI?: string;
        limit?: number;
        offset?: number;
        reasoning?: boolean;
    }

    interface HTTPMessage {
        status: string;
        statusText: string;
    }

    interface HTTPBody extends HTTPMessage, result {}

    interface result {
        result: string;
    }

    interface Params {
        [paramName: string]: any;
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
        uri(resource: Array<string>): string;
    }
    
    namespace server {
        /** Shuts down a Stardog server. */
        function shutdown(conn: Connection, params?: Params) : Promise<HTTPMessage>;
    }

    /** Stardog database actions. */
    namespace db {

        interface DatabaseOptions {
            name: string;
            archetypes?: string;
            connection?: timeout;
            creator?: string;
            namespaces?: string[];
            online?: boolean;
            time?: creation;
        }
        interface timeout {
            timeout: number;
        }
        interface creation {
            creation: string;
        }
        /** Creates a new database. */
        function create(conn: Connection, database: string, databaseOptions?: DatabaseOptions, options?: Object, params?: Params): Promise<HTTPMessage>;
        /** Deletes a database. */
        function drop(conn: Connection, database: string, params?: Params) : Promise<HTTPMessage>;
        /** Gets information about a database. */
        function get(conn: Connection, database: string, params?: Params) : Promise<HTTPBody>;
        /** Sets a database offline. */
        function offline(conn: Connection, database: string, params?: Params) : Promise<HTTPBody>;
        /** Sets a database online. */
        function online(conn: Connection, database: string, params?: Params) : Promise<HTTPBody>;
        /** Optimizes a database. */
        function optimize(conn: Connection, database: string, params?: Params) : Promise<HTTPMessage>;
        /** Makes a copy of a database. */
        function copy(conn: Connection, database: string, destination: string, params?: Params) : Promise<HTTPBody>;
        /** Gets a list of all databases on a Stardog server. */
        function list(conn: Connection, params?: Params) : Promise<HTTPBody>;
        /** Gets number of triples in a database. */
        function size(conn: Connection, database: string, databaseOptions?: DatabaseOptions, options?: Object, params?: Params) : Promise<HTTPBody>;
        /** Clears the contents of a database. */
        function clear(conn: Connection, database: string, databaseOptions?: DatabaseOptions, options?: Object, params?: Params) : Promise<HTTPBody>;
        /** Gets a mapping of the namespaces used in a database. */
        function namespaces(conn: Connection, database: string, databaseOptions?: DatabaseOptions, options?: Object, params?: Params) : Promise<HTTPBody>;
        /** Exports the contents of a database. */
        function exportData(conn: Connection, database: string, databaseOptions?: DatabaseOptions, options?: Object, params?: Params) : Promise<HTTPBody>;

        /** Database options. */
        namespace options {
            /** Gets set of options on a database. */
            function get(conn: Connection, database: string, params?: Params) : Promise<HTTPBody>;
            /** Sets options on a database. */
            function set(conn: Connection, database: string, databaseOptions: DatabaseOptions, params?: Params) : Promise<HTTPMessage>;
        }

        interface TransactionOptions extends HTTPOptions {
            encoding: Encoding
        }
        type Encoding =
            'gzip' |
            'compress' |
            'deflate' |
            'identity' |
            'br';
        /** Methods for managing transactions in a database. */
        namespace transaction {
            /** Begins a new transaction. */
            function begin(conn: Connection, database: string, params?: Params) : Promise<HTTPBody>;
            /** Evaluates a SPARQL query within a transaction. */
            function query(conn: Connection, database: string, transactionId: Guid, q: string, params?: Params) : Promise<HTTPBody>;
            /** Adds a set of statements to a transaction request. */
            function add(conn: Connection, database: string, transactionId: Guid, content: string, options: TransactionOptions, params?: Params) : Promise<HTTPBody>;
            /** Performs a rollback in a given transaction. */
            function rollback(conn: Connection, database: string, transactionId: Guid, params?: Params) : Promise<HTTPBody>;
            /** Commits a transaction to the database, removing the transaction and making its changes permanent. */
            function commit(conn: Connection, database: string, transactionId: Guid, params?: Params) : Promise<HTTPBody>;
            /** Removes a set of statements from a transaction request. */
            function remove(conn: Connection, database: string, transactionId: Guid, content: string, options: TransactionOptions, params?: Params) : Promise<HTTPBody>;
        }

        /** Methods for managing integrity constraints in a database. */
        namespace icv {
            /** Gets the set of integrity constraints on a given database. */
            function get(conn: Connection, database: string, options: Object, params?: Params) : Promise<HTTPBody>;
            /** Sets a new set of integrity constraints on a given database. */
            function set(conn: Connection, database: string, icvAxioms: string, options: Object, params?: Params) : Promise<HTTPMessage>;
            /** Removes all integrity constraints from a given database. */
            function clear(conn: Connection, database: string, options: Object, params?: Params) : Promise<HTTPMessage>;
            /** Converts a set of integrity constraints into an equivalent SPARQL query for a given database. */
            function convert(conn: Connection, database: string, icvAxioms: string, options: Object, params?: Params) : Promise<HTTPBody>;
        }
    }

    interface PropertyOptions {
        uri: string,
        property: string
    }
    /** Query actions to perform on a database. */
    namespace query {
        /** Gets the values for a specific property of a URI individual. */
        function property(conn: Connection, database: string, options?: PropertyOptions, params?: Params) : result;
        /** Gets the query plan generated by Stardog for a given SPARQL query. */
        function explain(conn: Connection, database: string, query: string, params?: Params) : Promise<HTTPBody>
        /** Executes a query against a database. */
        function execute(conn: Connection, database: string, query: string, params?: Params) : Promise<HTTPBody>;
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
            shared: boolean
        }
        /** Manages stored queries. */
        namespace stored {
            /** Stores a query in Stardog, either on the system level or for a given database. */
            function create(conn: Connection, storedQuery: StoredQueryOptions, params?: Params) : Promise<HTTPBody> 
            /** Lists all stored queries. */
            function list(conn: Connection, params?: Params) : Promise<HTTPBody>
            /** Removes a given stored query. */
            function remove(conn: Connection, storedQuery: string, params?: Params) : Promise<HTTPBody>
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
        function list(conn: Connection, params?: Params) : Promise<HTTPBody>;
        /** Creates a new user. */
        function create(conn: Connection, user: User, params?: Params) : Promise<HTTPBody>;
        /** Changes a user's password. */
        function changePassword(conn: Connection, username: string, password: string, params?: Params) : Promise<HTTPBody>;
        /** Verifies that a user is enabled. */
        function enabled(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        /** Enables/disables a user. */
        function enable(conn: Connection, username: string, enabled: boolean, params?: Params) : Promise<HTTPMessage>;
        /** Sets roles for a user. */
        function setRoles(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        /** Gets a list of roles assigned to a user. */
        function listRoles(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        /** Creates a new permission for a user over a given <ResourceType>. */
        function assignPermission(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        /** Removes a permission for a user over a given <ResourceType>. */
        function deletePermission(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        /** Gets a list of permissions assigned to user. */
        function permissions(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        /** Gets a list of a user's effective permissions. */
        function effectivePermissions(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        /** Verifies that a user is a superuser. */
        function superUser(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        /** Deletes a user. */
        function remove(conn: Connection, username: string, params?: Params) : Promise<HTTPBody>;
        
        namespace role {
            /** Creates a new role. */
            function create(conn: Connection, role: Role, params?: Params) : Promise<HTTPMessage>;
            /** Lists all existing roles. */
            function list(conn: Connection, params?: Params) : Promise<HTTPBody>;
            /** Deletes an existing role from the system. */
            function remove(conn: Connection, role: Role, params?: Params) : Promise<HTTPMessage>;
            /** Lists all users that have been assigned a given role. */
            function usersWithRole(conn: Connection, role: Role, params?: Params) : Promise<HTTPBody>;
            /** Adds a permission over a given resource to a given role. */
            function assignPermission(conn: Connection, role: Role, permission: Permission, params?: Params) : Promise<HTTPBody>;
            /** Removes a permission over a given resource from a given role. */
            function deletePermission(conn: Connection, role: Role, permission: Permission, params?: Params) : Promise<HTTPMessage>;
            /** Lists all permissions assigned to a given role. */
            function permissions(conn: Connection, role: Role, params?: Params) : Promise<HTTPBody>;
        }
    }
  }
}
