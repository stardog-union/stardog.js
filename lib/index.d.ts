// TypeScript Version: 2.1

import Headers from 'fetch-ponyfill';
  
declare const db: stardog.db;
declare const query: stardog.query;
declare const server: stardog.server;
declare const user: stardog.user;

    
interface ConnectionOptions {
    endpoint: string;
    username: string;
    password: string;
}

/** Describes the connection to a running Stardog server. */
declare class Connection {
    constructor(ConnectionOptions);

    config(options: ConnectionOptions): void;
    headers(): Headers;
    uri(...resource: string[]): string;
}

/** stardog.js: The Stardog JS API*/
declare namespace stardog {

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

    type Encodings =
        'gzip' |
        'compress' |
        'deflate' |
        'identity' |
        'br';

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

    interface HTTPMessage {
        status: string;
        statusText: string;
    }

    interface HTTPBody {
        status: string;
        statusText: string;
        result: Object | string | boolean | null;
    }

    interface TransactionResponse extends HTTPBody {
        transactionId: string
    }

    interface TransactionOptions {
        contentType: ContentMimeTypes,
        encoding: Encodings
    }

    interface PropertyOptions {
        uri: string,
        property: string
    }

    interface StoredQueryOptions {
        name: string,
        database: string,
        query: string,
        /** Defaults to false. */
        shared: boolean
    }

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
    
    interface server {
        /** Shuts down a Stardog server. */
        shutdown(conn: Connection, params?: Object) : Promise<HTTPMessage>;
    }

    /** Stardog database actions. */
    interface db {
        /** Creates a new database. */
        create(conn: Connection, database: string, databaseOptions?: Object, options?: { files: string[] }, params?: Object): Promise<HTTPMessage>;
        /** Deletes a database. */
        drop(conn: Connection, database: string, params?: Object) : Promise<HTTPMessage>;
        /** Gets information about a database. */
        get(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Sets a database offline. */
        offline(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Sets a database online. */
        online(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Optimizes a database. */
        optimize(conn: Connection, database: string, params?: Object) : Promise<HTTPMessage>;
        /** Makes a copy of a database. */
        copy(conn: Connection, database: string, destination: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of all databases on a Stardog server. */
        list(conn: Connection, params?: Object) : Promise<HTTPBody>;
        /** Gets number of triples in a database. */
        size(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Clears the contents of a database. */
        clear(conn: Connection, database: string, transactionId: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a mapping of the namespaces used in a database. */
        namespaces(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
        /** Exports the contents of a database. */
        exportData(conn: Connection, database: string, options?: { mimeType: AcceptMimeTypes }, params?: { graphUri: string }) : Promise<HTTPBody>;

        /** Database options. */
        options: {
            /** Gets set of options on a database. */
            get(conn: Connection, database: string, params?: Object) : Promise<HTTPBody>;
            /** Sets options on a database. */
            set(conn: Connection, database: string, databaseOptions: Object, params?: Object) : Promise<HTTPMessage>;
        }

        /** Methods for managing transactions in a database. */
        transaction: {
            /** Begins a new transaction. */
            begin(conn: Connection, database: string, params?: Object) : Promise<TransactionResponse>;
            /** Evaluates a SPARQL query within a transaction. */
            query(conn: Connection, database: string, transactionId: string, query: string, params?: Object) : Promise<TransactionResponse>;
            /** Adds a set of statements to a transaction request. */
            add(conn: Connection, database: string, transactionId: string, content: string, options: TransactionOptions, params?: Object) : Promise<TransactionResponse>;
            /** Performs a rollback in a given transaction. */
            rollback(conn: Connection, database: string, transactionId: string, params?: Object) : Promise<TransactionResponse>;
            /** Commits a transaction to the database, removing the transaction and making its changes permanent. */
            commit(conn: Connection, database: string, transactionId: string, params?: Object) : Promise<TransactionResponse>;
            /** Removes a set of statements from a transaction request. */
            remove(conn: Connection, database: string, transactionId: string, content: string, options: TransactionOptions, params?: Object) : Promise<TransactionResponse>;
        }

        /** Methods for managing integrity constraints in a database. */
        icv: {
            /** Gets the set of integrity constraints on a given database. */
            get(conn: Connection, database: string, options: Object, params?: Object) : Promise<HTTPBody>;
            /** Sets a new set of integrity constraints on a given database. */
            set(conn: Connection, database: string, icvAxioms: string, options?: { contentType: ContentMimeTypes }, params?: Object) : Promise<HTTPMessage>;
            /** Removes all integrity constraints from a given database. */
            clear(conn: Connection, database: string, options: Object, params?: Object) : Promise<HTTPMessage>;
            /** Converts a set of integrity constraints into an equivalent SPARQL query for a given database. */
            convert(conn: Connection, database: string, icvAxioms: string, options: { contentType: ContentMimeTypes }, params?: { graphUri: string }) : Promise<HTTPBody>;
        }
    }

    /** Query actions to perform on a database. */
    interface query {
        /** Gets the values for a specific property of a URI individual. */
        property(conn: Connection, database: string, config: PropertyOptions, params?: Object) : Promise<HTTPBody>;
        /** Gets the query plan generated by Stardog for a given SPARQL query. */
        explain(conn: Connection, database: string, query: string, params?: Object) : Promise<HTTPBody>
        /** Executes a query against a database. */
        execute(conn: Connection, database: string, query: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of actively running queries. */
        list(conn: Connection) : Promise<HTTPBody>;
        /** Kills an actively running query. */
        kill(conn: Connection, queryId: string) : Promise<HTTPMessage>;
        /** Gets information about an actively running query. */
        get(conn: Connection, queryId: string) : Promise<HTTPBody>;

        /** Manages stored queries. */
        stored: {
            /** Stores a query in Stardog, either on the system level or for a given database. */
            create(conn: Connection, config: StoredQueryOptions, params?: Object) : Promise<HTTPBody> 
            /** Lists all stored queries. */
            list(conn: Connection, params?: Object) : Promise<HTTPBody>
            /** Removes a given stored query. */
            remove(conn: Connection, storedQuery: string, params?: Object) : Promise<HTTPBody>
        }
    }

    /** Administrative actions for managing users, roles, and their permissions. */
    interface user {
        /** Gets a list of users. */
        list(conn: Connection, params?: Object) : Promise<HTTPBody>;
        /** Creates a new user. */
        create(conn: Connection, user: User, params?: Object) : Promise<HTTPBody>;
        /** Changes a user's password. */
        changePassword(conn: Connection, username: string, password: string, params?: Object) : Promise<HTTPBody>;
        /** Verifies that a user is enabled. */
        enabled(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Enables/disables a user. */
        enable(conn: Connection, username: string, enabled: boolean, params?: Object) : Promise<HTTPMessage>;
        /** Sets roles for a user. */
        setRoles(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of roles assigned to a user. */
        listRoles(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Creates a new permission for a user over a given <ResourceType>. */
        assignPermission(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Removes a permission for a user over a given <ResourceType>. */
        deletePermission(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of permissions assigned to user. */
        permissions(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Gets a list of a user's effective permissions. */
        effectivePermissions(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Verifies that a user is a superuser. */
        superUser(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        /** Deletes a user. */
        remove(conn: Connection, username: string, params?: Object) : Promise<HTTPBody>;
        
        role: {
            /** Creates a new role. */
            create(conn: Connection, role: Role, params?: Object) : Promise<HTTPMessage>;
            /** Lists all existing roles. */
            list(conn: Connection, params?: Object) : Promise<HTTPBody>;
            /** Deletes an existing role from the system. */
            remove(conn: Connection, role: Role, params?: Object) : Promise<HTTPMessage>;
            /** Lists all users that have been assigned a given role. */
            usersWithRole(conn: Connection, role: Role, params?: Object) : Promise<HTTPBody>;
            /** Adds a permission over a given resource to a given role. */
            assignPermission(conn: Connection, role: Role, permission: Permission, params?: Object) : Promise<HTTPBody>;
            /** Removes a permission over a given resource from a given role. */
            deletePermission(conn: Connection, role: Role, permission: Permission, params?: Object) : Promise<HTTPMessage>;
            /** Lists all permissions assigned to a given role. */
            permissions(conn: Connection, role: Role, params?: Object) : Promise<HTTPBody>;
        }
    }
}
