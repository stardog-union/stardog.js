//     Stardog.js 0.3.0
//
// Copyright 2015 Clark & Parsia, LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function(factory) {

    "use strict";
    // ## Initial Setup
    // -------------
    //
    // Save a reference to the global object ('window' in the browser, 'global'
    // on the server).
    var root = this;

    // Export the Underscore object for **Node.js**, with
    // backward compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== "undefined" && typeof module !== "undefined" && module.exports) {
        exports = module.exports = factory(root);
    }
    else if (typeof define === "function" && define.amd) {
        // load Stardog via AMD
        define(function() {
            // Export to global for backward compatibility
            root.Stardog = factory(root);
            return root.Stardog;
        });
    }
    else {
        // Browser global
        root.Stardog = factory(root);
    }
}).call(this, function(root) {

    "use strict";

    // Create top-level namespace
    var Stardog = {};

    // Current version of the library. Keep in sync with 'package.json'
    Stardog.VERSION = "0.3.0";

    // Verify the environment of the library
    var isNode = (typeof exports !== "undefined" && typeof module !== "undefined" && module.exports);

    if (isNode) {
        // Require request, if we're on the server, and it's not already present
        var rest = root.rest;
        if (!rest && (typeof require !== "undefined")) rest = require("restler");

        // Require querystring, if we're on the server, and it's not already present
        var qs = root.qs;
        if (!qs && (typeof require !== "undefined")) qs = require("querystring");
    }

    var _ = root._;
    if (!_ && (typeof require !== "undefined")) _ = require("lodash");

    // For AJAX's purposes, jQuery owns the `$` variable.
    // jQuery is only required when using the library in the browser.


    // ---------------------------------

    // ## Stardog Connection
    //
    // Defines the HTTP connection to Stardog as well as all the API calls
    // available to this protocol. The API calls defined in this element are
    // referenced in [Stardog HTTP Programming documentation](http://docs.stardog.com/http/).
    var Connection = Stardog.Connection = function ()   {
        // By default (for testing)
        this.endpoint = "http://localhost:5820/nodeDB/";
        this.reasoning = false;
    };

    // Set the Stardog HTTP endpoint, usually running in port `5820`.
    Connection.prototype.setEndpoint = function (url) {
        var i = url.length -1;

        // find last index of not / char
        for (; i >= 0; i -= 1) {
            if (url[i] != "/")
                break;
        }

        this.endpoint = url.substring(0, i+1) + "/";
    };

    // Retrieve the configured Stardog HTTP endpoint.
    Connection.prototype.getEndpoint = function () {
        return this.endpoint;
    };

    // Set the Stardog Credentials - `username` and `password`.
    Connection.prototype.setCredentials = function(username, password) {
        this.credentials = {};
        this.credentials.username = username;
        this.credentials.password = password;
    };

    // Retrieve the configured Stardog Credentials. Credentials are returned in a JSON
    // containing `{ "username": "...", "password": "..." }`
    Connection.prototype.getCredentials = function() {
        return this.credentials;
    };

    // Sets the reasoning enabled flag of the connection when performing SPARQL queries &
    // function calls involving reasoning.
    // Boolean parameter `true` to enable reasoning, `false` to disable it.
    // [Stardog Reasoning docs](http://docs.stardog.com/#_owl_rule_reasoning)
    Connection.prototype.setReasoning = function(reasoningFlag) {
        this.reasoning = reasoningFlag;
    };

    // Gets reasoning enabled flag for the Stardog Connection.
    Connection.prototype.isReasoningEnabled = function() {
        return this.reasoning;
    };

    // Check if we're in node or in the browser.
    // Execute a query to the endpoint provided with the
    // resource specified and the parameters.
    // Needs a callback to process results in a function receiving a
    // JSONLD object.
    if (isNode) {

        // Node.js implementation of the HTTP request using `request` npm module.
        // __Parameters__:
        // `options`: an object with the following attributes:
        //              `httpMethod`: the name of the database;
        //              `resource`: the resource;
        //              `acceptHeader`: the accept header;
        //              `params`: any other parameters to pass to the SPARQL endpoint;
        //              `msgBody`: the message body;
        //              `isJsonBody`: whether the body is a JSON object;
        //              `contentType`: the content type;
        //              `multipart`: the multipart;
        // `callback`: the callback to execute once the request is done.
        Connection.prototype._httpRequest = function(options, callback) {
            var theMethod = options.httpMethod,
                req_url = this.endpoint + options.resource,
                params = options.params || {},
                msgBody = options.msgBody,
                acceptH = options.acceptHeader,
                isJsonBody = options.isJsonBody,
                contentType = options.contentType,
                multipart = options.multipart,
                headers = {},
                reqJSON, attachments;

            // Set the Accept header by default to "application/sparql-results+json"
            headers.Accept = acceptH || "text/plain";

            function fnResponseHandler(body, response) {
                var jsonData;

                if (!(body instanceof Error)) {
                    // Try to parse response to JSON, which is expected in most
                    // cases
                    try {
                        if (body) {
                            jsonData = JSON.parse(body);
                        } else {
                            jsonData = {};
                        }
                    }
                    catch (err) {
                        // If parsing throws an error just leave it as is.
                        jsonData = body;
                    }

                    callback(jsonData, response);
                }
                else {
                    console.log("Error found!");
                    console.log(JSON.stringify(body));

                    // TODO: maybe wrap the error with stardog specific info
                    callback(body, response);
                }
            }

            if (!multipart && msgBody) {
                if (isJsonBody) {
                    headers["Content-Type"] = "application/json";
                }
                else {
                    headers["Content-Type"] = contentType;
                }
            }

            // build request object
            reqJSON = {
                "method" : theMethod,
                "query" : params,
                "username" : this.credentials.username,
                "password" : this.credentials.password,
                "headers" : headers,
                "data" : (isJsonBody) ? JSON.stringify(msgBody) : msgBody,
                "multipart" : multipart || false
            };

            if (multipart) {
                // var fs = require("fs");

                attachments = {
                    "root" : msgBody
                };

                reqJSON.data = attachments;
            }

            rest.request(req_url, reqJSON).on("complete",
                fnResponseHandler
            );
        };
    }
    else {
        // Browser implementation using jQuery's AJAX
        // In case of cross-domain requests, a pre-flight OPTIONS http request is sent by the browser and
        // the response is scanned for CORS headers. As per the CORS spec, no authentication information should
        // be included in the pre-flight request and the original request should only be sent if the pre-flight request
        // succeeded and the required CORS headers are received.
        //
        // Unfortunately Stardog (up to 1.1.3) does enforce authentication on the pre-flight request,
        // causing it to fail in all browsers (401). Webkit-based browsers ignore 401 on the pre-flight request
        // and continue with sending the original request, if the correct CORS headers were received.
        //
        // It seems that jQuery doesn't send the HTTP Basic authentication information, when simply pass as
        // parameter to the jQuery.ajax call. Here, we can manually inject the HTTP Authorization header, which seems
        // to work for Chrome, Safari, Firefox(*)

        // (*) Only if the pre-flight request succeeds.

        // IE7-9 does not provide a native btoa (Base64 encoding) function
        // One can fall back to a JS implementation, e.g. http://www.webtoolkit.info/javascript-base64.html
        // jQuery does not natively provide support for IE's XDomainRequest object, although jQuery plugins exist that
        // provide this extension and are reported to work.
        Connection.prototype._base64Encode = typeof(btoa) == "function" ? function(x){return btoa(x);} : null;

        // Low level HTTP request method to use in the Browser, using an AJAX implementation.
        // __Parameters__:
        // `options`: an object with the following attributes:
        //              `httpMethod`: the name of the database;
        //              `resource`: the resource;
        //              `acceptHeader`: the accept header;
        //              `params`: any other parameters to pass to the SPARQL endpoint;
        //              `msgBody`: the message body;
        //              `isJsonBody`: whether the body is a JSON object;
        //              `contentType`: the content type;
        //              `multipart`: the multipart;
        // `callback`: the callback to execute once the request is done.
        Connection.prototype._httpRequest = function(options, callback) {
            var theMethod = options.httpMethod,
                acceptH = options.acceptHeader,
                req_url = this.endpoint + options.resource,
                params = options.params || {},
                contentType = options.contentType,
                body = options.msgBody || null,
                isJsonBody = options.isJsonBody,
                multipart = options.multipart,
                headers = {},
                username, password,
                ajaxSettings,
                userPassBase64;

            headers.Accept = acceptH || "application/sparql-results+json";

            if (this.credentials) {
                username = this.credentials.username;
                password = this.credentials.password;
                if (this._base64Encode) {
                    userPassBase64 = this._base64Encode(username.concat(":",password));
                    headers.Authorization = "Basic ".concat(userPassBase64);
                } else {
                    throw new Error("Your browser does not support btoa() natively.\n" +
                        " Please provide a javascript implementation for Connection.prototype._base64Encode");
                }
            }

            // if there are params, append them to the req_url
            req_url = (!_.isEmpty(params)) ? req_url +"?"+ $.param(params) :
                req_url;

            ajaxSettings = {
                type: theMethod,
                url: req_url,
                processData: false, // prevents jquery from tampering with the DataFrom object
                dataType: acceptH.match(/json/gi) ? "json" : "text",
                data:  isJsonBody ? JSON.stringify(body) : body,
                headers: headers
            };

            if (isJsonBody) {
                headers["Content-Type"] = "application/json";
            } else if (contentType) {
                headers["Content-Type"] = contentType;
            } else if (multipart) {
                // prevents jquery from overwriting the proper content-type header
                ajaxSettings.contentType = false;
            }

            $.ajax(ajaxSettings).done(function(data, status, jqXHR) {
                var return_obj;
                // check if the returned object is a JSONLD object
                if (data && (data.hasOwnProperty("@id") || data.hasOwnProperty("@context"))) {
                    return_obj = Connection._convertToLinkedJson(data);
                } else {
                    return_obj = data;
                }
                callback(return_obj, {
                    responseText: jqXHR.responseText,
                    statusCode: jqXHR.status,
                    statusText: jqXHR.statusText
                });
            }).fail(function(jqXHR, textStatus, errorThrown) {
                callback(
                    jqXHR.responseText,
                    {
                        responseText: jqXHR.responseText,
                        statusCode: jqXHR.status,
                        statusText: jqXHR.statusText
                    },
                    errorThrown
                );
            });
        };
    }

    // `Connection.getProperty` retrieves the values for a specific property of a URI individual in a
    // Stardog DB. This function is a direct access to provide easy out-of-the-box functionality
    // for retrieving common properties such as rdfs:label, etc
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `uri`: the individual URI;
    //              `property`: the specific property.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.getProperty = function(options, callback) {
        var val = options.uri,
            reqOptions = {
                database: options.database,
                query:  "select ?val where { "+ options.uri +" "+ options.property +" ?val }",
                params: options.params
            };

        this.query(reqOptions, function (jsonRes) {
            if (jsonRes.results && jsonRes.results.bindings.length > 0) {
                val = jsonRes.results.bindings[0].val.value;
            }

            callback(val);
        });
    };

    // Performs a GET to the root endpoint of the DB `database`
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.getDB = function (options, callback) {
        var reqOptions = {
                resource : options.database,
                acceptHeader: "*/*",
                httpMethod: "GET",
                params: options.params || ""
             };

        this._httpRequest(reqOptions, callback);
    };

    // Retrieve the DB size.
    // Returns a single numeric value representing the number of triples in the database.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database to verify its size;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.getDBSize = function (options, callback) {
        var reqOptions = {
                resource: options.database + "/size",
                httpMethod: "GET",
                acceptHeader: "text/plain",
                params: options.params || ""
            };
        this._httpRequest(reqOptions, callback);
    };

    // Evaluate a SPARQL query specifying `database`, `query`, `baseURI`, `limit`, `offset` and the `mimetype`
    // for the Accept header. This method is designed for `select` & `ask` queries, where the result type will
    // be a set of bindings.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `query`: the query;
    //              `baseURI`: the base URI;
    //              `limit`: the limit;
    //              `offset`: the offset;
    //              `mimetype`: the mimetype;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.query = function(options, callback) {
        var reqOptions = {
            acceptHeader : options.mimetype || "application/sparql-results+json",
            resource: options.database + "/query",
            httpMethod: "POST",
            params: {}
        },  reasoning = options.reasoning || this.reasoning;

        var queryParams = _.extend({ "query" : options.query }, options.params);

        if (options.baseURI) {
            queryParams.baseURI = options.baseURI;
        }

        if (options.limit) {
            queryParams.limit = options.limit;
        }

        if (options.offset) {
            queryParams.offset = options.offset;
        }

        if (reasoning) {
            reqOptions.params.reasoning = reasoning;
        }

        if (!isNode) {
            var postData = _.map(_.pairs(queryParams), function (pairArr) {
                return pairArr[0] +"="+ pairArr[1];
            });

            reqOptions.msgBody = postData.join("&");
        }
        else {
            reqOptions.msgBody = queryParams;
        }

        this._httpRequest(reqOptions, callback);
    };


    // Evaluate a SPARQL query specifying `database`, `query`, `baseURI`, `limit`, `offset` and the `mimetype`
    // for the Accept header. This method is designed for `describe` & `construct` queries, where the result type will
    // be a set of triples.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `query`: the query;
    //              `baseURI`: the base URI;
    //              `limit`: the limit;
    //              `offset`: the offset;
    //              `mimetype`: the mimetype;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.queryGraph = function (options, callback) {
        var reqOptions = {
            acceptHeader : options.mimetype || "application/ld+json",
            resource: options.database + "/query",
            httpMethod: "POST",
            params: {}
        }, reasoning = options.reasoning || this.reasoning;

        var queryParams = _.extend({ "query" : options.query }, options.params);

        if (options.baseURI) {
            queryParams.baseURI = options.baseURI;
        }

        if (options.limit) {
            queryParams.limit = options.limit;
        }

        if (options.offset) {
            queryParams.offset = options.offset;
        }

        if (reasoning) {
            reqOptions.params.reasoning = reasoning;
        }

        if (!isNode) {
            var postData = _.map(_.pairs(queryParams), function (pairArr) {
                return pairArr[0] +"="+ pairArr[1];
            });

            reqOptions.msgBody = postData.join("&");
        }
        else {
            reqOptions.msgBody = queryParams;
        }

        this._httpRequest(reqOptions, callback);
    };

    // Returns the query plan generated by Stardog given a SPARQL query.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `query`: the query;
    //              `baseURI`: (optional) the base URI;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.queryExplain = function (options, callback) {
        var reqOptions = {
                resource: options.database + "/explain",
                httpMethod: "GET",
                acceptHeader: "text/plain",
                params : _.extend({ "query" : options.query }, options.params)
            };

        if (options.baseURI) {
            reqOptions.params.baseURI = options.baseURI;
        }

        this._httpRequest(reqOptions, callback);
    };

    // Start a new transaction in the database.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.begin = function (options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/transaction/begin",
                acceptHeader: "text/plain",
                params: options.params
            };

        this._httpRequest(reqOptions, callback);
    };

    // Commit the transaction `txId` in the database. This will remove the transaction and the `txId` will not
    // be valid anymore. All function calls using a transaction to mutate the contents of a database must call this
    // function in order to make the changes permanent.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `txId`: the transaction id;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.commit = function (options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource:  options.database + "/transaction/commit/" + options.txId,
                acceptHeader: "text/plain",
                params: options.params
            };

        this._httpRequest(reqOptions, callback);
    };

    // Perform a rollback given within a trasaction, providing the transaction id `txId`.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `txId`: the transaction id;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.rollback = function (options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource:  options.database + "/transaction/rollback/" + options.txId,
                acceptHeader: "text/plain",
                params: options.params
            };

        this._httpRequest(reqOptions, callback);
    };

    // Evaluate a SPARQL query using a transaction `txId`.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `query`: the query;
    //              `txId`: the transaction id;
    //              `baseURI`: the base URI;
    //              `limit`: the limit;
    //              `offset`: the offset;
    //              `mimetype`: the mimetype;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.queryInTransaction = function(options, callback) {
        // function (database, txId, query, baseURI, limit, offset, callback, acceptMIME) {
        var reqOptions = {
                acceptHeader : options.mimetype || "application/sparql-results+json",
                resource: options.database + "/" + options.txId +"/query",
                httpMethod: "GET",
                params : _.extend({ "query" : options.query }, options.params)
            };

        if (options.baseURI) {
            reqOptions.params.baseURI = options.baseURI;
        }

        if (options.limit) {
            reqOptions.params.limit = options.limit;
        }

        if (options.offset) {
            reqOptions.params.offset = options.offset;
        }

        this._httpRequest(reqOptions, callback);
    };

    // Add a set of statements included in the `body` request, using a transaction `txId`. Note that after calling this function
    // to add the statements, `Connection.commit` must be performed to make the changes persistent in the DB.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `txId`: the transaction id;
    //              `body`: the request body;
    //              `contentType`: the request content type;
    //              `graphUri`: (optional) the graph URI;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.addInTransaction = function (options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/" + options.txId + "/add",
                acceptHeader: "text/plain",
                params: options.params || { },
                msgBody: options.body,
                contentType: options.contentType,
                isJsonBody: false,
                multipart: null
            };

        if (options.graphUri) {
            reqOptions.params["graph-uri"] =  options.graphUri;
        }

        this._httpRequest(reqOptions, callback);
    };

    // Remove a set of statements included in the `body` request, using a transaction `txId`. Note that after calling this function
    // to add the statements, `Connection.commit` must be performed to make the changes persistent in the DB.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `txId`: the transaction id;
    //              `body`: the request body;
    //              `contentType`: the request content type;
    //              `graphUri`: the graph URI;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.removeInTransaction = function (options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/" + options.txId + "/remove",
                acceptHeader: "text/plain",
                params: options.params || { },
                msgBody: options.body,
                contentType: options.contentType,
                isJsonBody: false,
                multipart: null
            };

        if (options.graphUri) {
            reqOptions.params["graph-uri"] =  options.graphUri;
        }

        this._httpRequest(reqOptions, callback);
    };

    // Clears the content of the DB.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `txId`: the transaction id;
    //              `graphUri`: the graph URI;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.clearDB = function (options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/" + options.txId + "/clear",
                acceptHeader: "text/plain",
                params: options.params || {}
            };

        if (options.graphUri) {
            reqOptions.params["graph-uri"] =  options.graphUri;
        }

        this._httpRequest(reqOptions, callback);
    };

    // Exports the content of the DB.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `mimetype`: the MIME type of the RDF format for the export, default: application/ld+json
    //              `graphUri`: the graph URI to export (if any);
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.exportDB = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: options.database + "/export",
            acceptHeader: options.mimetype || "application/ld+json",
            params: options.params || {}
        };

        // by default it exports the whole database in JSON-LD
        reqOptions.params["graph-uri"] = options.graphUri || "tag:stardog:api:context:all";

        this._httpRequest(reqOptions, callback);
    };

    // ## Reasoning API
    // -------------------------

    // API call to get explanation of the inferences in `axioms` using a transaction `txId` with the content type
    // `contentType` of the axioms.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `txId`: the transaction;
    //              `axioms`: the axioms;
    //              `contentType`: the content-type;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.reasoningExplain = function (options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/reasoning/" +
                    (options.txId && options.txId !== null ? "/" + options.txId : ""),
                acceptHeader: "application/x-turtle",
                params: options.params || null,
                msgBody: options.axioms,
                isJsonBody: false,
                contentType: options.contentType || "text/plain"
            };

        this._httpRequest(reqOptions, callback);
    };

    // Checks the logical consistency of database. If using a named graph provide the `graph_uri` parameter.
    // Returns a boolean response as `true` if the database is consistent.
    // See [stardog reasoning consistency](http://docs.stardog.com/man/reasoning-consistency.html)
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `graphUri`: the graph URI;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.isConsistent = function (options, callback) {
        var reqOptions = {
                httpMethod: "GET",
                resource: options.database + "/reasoning/consistency",
                acceptHeader: "text/boolean",
                params: options.params || {}
            };

        if (options.graphUri) {
            reqOptions.params["graph-uri"] =  options.graphUri;
        }

        this._httpRequest(reqOptions, callback);
    };

    // ### Integrity Constraint Validation
    // Listing the Integrity Constraints. Returns the integrity constraints for the specified database serialized in any supported RDF format.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `acceptMime`: the MIME type;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.getICV = function (options, callback) {
        var reqOptions = {
                httpMethod: "GET",
                resource: options.database + "/icv",
                acceptHeader: options.acceptMime || "text/plain",
                params: options.params || null,
                contentType: options.contentType || "text/plain"
            };

        this._httpRequest(reqOptions, callback);
    };

    // Accepts a set of valid Integrity constraints serialized in any RDF format supported by Stardog and adds them to the database in an atomic action.
    // 200 return code indicates the constraints were added successfully, 500 indicates that the constraints were not valid or unable to be added.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `icvAxioms`: the ICV axioms;
    //              `contentType`: the content-type;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.setICV = function (options, callback) {
        // set default content-type to "text/plain" (N-Triples)
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/icv/add",
                acceptHeader: "text/boolean",
                params: options.params || null,
                contentType: options.contentType || "text/plain",
                msgBody: options.icvAxioms,
                isJsonBody: false
            };

        this._httpRequest(reqOptions, callback);
    };

    // Accepts a set of valid Integrity constraints serialized in any RDF format supported by Stardog and removes them from the database in a single atomic action.
    // 200 indicates the constraints were successfully remove; 500 indicates an error.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `icvAxioms`: the ICV axioms;
    //              `contentType`: the content-type;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.removeICV = function (options, callback) {
        // set default content-type to "text/plain" (N-Triples)
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/icv/remove",
                acceptHeader: "text/boolean",
                params: options.params || null,
                contentType: options.contentType || "text/plain",
                msgBody: options.icvAxioms,
                isJsonBody: false
            };

        this._httpRequest(reqOptions, callback);
    };

    // Drops ALL integrity constraints for a database. 200 indicates all constraints were successfully dropped; 500 indicates an error.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.clearICV = function (options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/icv/clear",
                acceptHeader: "text/boolean",
                params: options.params || null
            };

        this._httpRequest(reqOptions, callback);
    };

    // Only works for one constraint, if more than 1 are provided returns 400 code status. The body of the POST is a single Integrity Constraint,
    // serialized in any supported RDF format, with Content-type set appropriately. Returns either a text/plain result containing a single SPARQL query;
    // or it returns 400 if more than one constraint was included in the input.
    //
    // __Parameters__:
    // `options`: an object with at least the following attributes:
    //              `database`: the name of the database;
    //              `icvAxiom`: the ICV axiom;
    //              `contentType`: the content-type;
    //              `graphUri`: the graph URI;
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.fromICVtoSPARQL = function (options, callback) {
        // set default content-type to "text/plain" (N-Triples)
        var reqOptions = {
                httpMethod: "POST",
                resource: options.database + "/icv/convert",
                acceptHeader: "text/plain",
                params: options.params || {},
                msgBody: options.icvAxiom,
                isJsonBody: false,
                contentType: options.contentType || "text/plain"
            };

        if (options.graphUri) {
            reqOptions.params["graph-uri"] =  options.graphUri;
        }

        this._httpRequest(reqOptions, callback);
    };

    // -----------------------------------------

    // Returns a mapping of the namespaces being used in a database.
    // See: Section __Namespace Prefix Bindings__ in
    // [Stardog Administration](http://docs.stardog.com/admin/#sd-Database-Admin)
    Connection.prototype.getNamespaces = function(options, callback) {
        if (!options || !options.database) {
            throw new Error("Option `database` is required.");
        }

        this.getDBOptions({
            database: options.database,
            optionsObj: { "database.namespaces": "" }
        }, function (data, response) {
            var namespaces = data["database.namespaces"] || [];
            var nsMap = {};

            _.each(namespaces, function (namespace) {
                var nsTokens = namespace.split("=");
                nsMap[nsTokens[0]] = nsTokens[1];
            });

            callback(nsMap, response);
        });
    };

    // ## Query Management API
    // ---------------------------------------
    // [Stardog Query Management](http://docs.stardog.com/admin/#manage-queries)
    // Stardog includes the capability to manage running queries according to configurable
    // policies set at run-time; this capability includes support for:
    //
    // * __listing__ running queries
    // * __deleting__ running queries
    // * __reading__ the status of a running query
    // * __killing__ running queries that exceed a time threshold automatically

    // ### List running queries
    // Get a list of the currently running queries.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `params`: (optional) currently not used.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.queryList = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/queries",
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, (typeof options === "function") ? options : callback);
    };

    // ### Get query information
    // Get the information related to the query running such as: a query ID, the database on which the
    // query is running, the user that executed the query, the elapsed time among other metadata.
    //
    // __Parameters__:
    // `options`: an object with the following attributes:
    //              `queryId`: the ID of the query;
    //              `params`: (optional) currently not used.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.queryGet = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/queries/" + options.queryId,
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, (typeof options === "function") ? options : callback);
    };

    // ### Kill a running query
    // Kill a currently running query using a query ID.
    //
    // __Parameters__:
    // `options`: an object with the following attributes:
    //              `queryId`: the ID of the query;
    //              `params`: (optional) currently not used.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.queryKill = function (options, callback) {
        var reqOptions = {
            httpMethod: "DELETE",
            resource: "admin/queries/" + options.queryId,
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, (typeof options === "function") ? options : callback);
    };


    // ---------------------------------------


    // ## Stardog Administrative API
    // ---------------------------------------
    // [Admin Resources](http://docs.stardog.com/http/#sd-Admin-Resources)

    // ### Database operations.

    // These API calls are related to the DBMS core functions for administrating resources in the
    // Stardog Database System, such as: getting a list of databases, add/copy/delete databases.
    // Note that there's one administrative call missing for creating DBs, this is to limitations
    // on the HTTP multi-part libraries, but support for this is coming soon.

    // #### List databases (GET)
    // Get a list of the existing databases in the system.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.listDBs = function (options, callback) {
        var reqOptions = {
                httpMethod: "GET",
                resource: "admin/databases",
                acceptHeader: "application/json",
                params: (options && typeof options !== "function") ? options.params : ""
            };
        this._httpRequest(
            reqOptions,
            typeof options === "function" ? options /* no options passed, so this is the callback */
                    : callback /* options is an object, callback might be a function */);
    };

    // #### Copy database (PUT)
    // Copy an existing database.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `dbsource`: the name of the database to copy.
    //              `dbtarget`: the name of the new copied database.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.copyDB = function (options, callback) {
        var reqOptions = {
                httpMethod: "PUT",
                resource: "admin/databases/" + options.dbsource + "/copy",
                acceptHeader: "application/json",
                params: _.extend({ "to" : options.dbtarget }, options.params)
            };
        this._httpRequest(reqOptions, callback);
    };


    // #### Create a new database (POST)
    // Set options in the database passed through a JSON object specification, i.e. JSON Request for option values.
    // Database options can be found [here](http://docs.stardog.com/admin/#sd-Database-Admin).
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `database`: the name of the database to set the options.
    //              `options`: the options JSON object, indicating the options and values to set, [more info](http://docs.stardog.com/http/).
    //              `files`: the array of file names to bulk load into the new database
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.createDB = function(options, callback) {
        var creationData, data, formData, reqOptions;

        creationData = {
            dbname : options.database,
            options : options.options,
            files : options.files
        };

        data = JSON.stringify(creationData);

        if (!isNode) {
            formData = new window.FormData();
            formData.append("root", data);
        }
        else {
            formData = data;
        }

        reqOptions = {
            httpMethod: "POST",
            resource: "admin/databases",
            acceptHeader: "*/*",
            params: options.params || "",
            isJsonBody: false,
            multipart: true,
            msgBody: formData,
            files: options.files
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Drop an existing database.
    // Drops an existing database `dbname` and all the information that it contains.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `database`: the name of the database to drop.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.dropDB = function (options, callback) {
        var reqOptions = {
                httpMethod: "DELETE",
                resource: "admin/databases/" + options.database,
                acceptHeader: "application/json",
                params: options.params || ""
            };

        this._httpRequest(reqOptions, callback);
    };

    // #### Migrate an existing database.
    // Migrates the existing content of a legacy database to new format.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `database`: the name of the database to migrate.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.migrateDB = function (options, callback) {
        var reqOptions = {
                httpMethod: "PUT",
                resource: "admin/databases/" + options.database + "/migrate",
                acceptHeader: "application/json",
                params: options.params || ""
            };

        this._httpRequest(reqOptions, callback);
    };

    // #### Optimize an existing database.
    // Optimize an existing database.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `database`: the name of the database to optimize.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.optimizeDB = function (options, callback) {
        var reqOptions = {
                httpMethod: "PUT",
                resource: "admin/databases/" + options.database +"/optimize",
                acceptHeader: "application/json",
                params: options.params || ""
            };

        this._httpRequest(reqOptions, callback);
    };

    // #### Set database on-line.
    // Request message to set an existing database `dbname` on-line.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `database`: the name of the database to set on-line.
    //              `strategyOp`: the strategy options, [more info](http://docs.stardog.com/http/).
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.onlineDB = function (options, callback) {
        var reqOptions = {
                httpMethod: "PUT",
                resource: "admin/databases/" + options.database +"/online",
                acceptHeader: "application/json",
                params: _.extend({ "strategy": options.strategyOp }, options.params)
            };

        this._httpRequest(reqOptions, callback);
    };

    // #### Set database off-line.
    // Request message to set an existing database off-line;
    // receives optionally a JSON input to specify a timeout for the off-line operation.
    // When not specified, defaults to 3 minutes as the timeout;
    // the timeout should be provided in milliseconds.
    // The timeout is the amount of time the database will wait for existing connections to complete before going off-line.
    // This will allow open transaction to commit/rollback, open queries to complete, etc.
    // After the timeout has expired, all remaining open connections are closed and the database goes off-line.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `database`: the name of the database to set off-line.
    //              `strategyOp`: the strategy options, [more info](http://docs.stardog.com/http/).
    //              `timeout`: timeout in milliseconds.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.offlineDB = function (options, callback) {
        var reqOptions = {
                httpMethod: "PUT",
                resource: "admin/databases/" + options.database +"/offline",
                acceptHeader: "application/json",
                params: _.extend({ "strategy": options.strategyOp }, options.params)
            };

        if (options.timeoutMS) {
            reqOptions.msgBody = { timeout: options.timeout };
            reqOptions.isJsonBody = true;
        }

        this._httpRequest(reqOptions, callback);
    };

    // #### Set option values to an existing database.
    // Set options in the database passed through a JSON object specification, i.e. JSON Request for option values.
    // Database options can be found [here](http://docs.stardog.com/admin/#sd-Database-Admin).
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `database`: the name of the database to set the options.
    //              `optionsObj`: the options JSON object, indicating the options and values to set, [more info](http://docs.stardog.com/http/).
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.setDBOptions = function(options, callback) {
        var reqOptions = {
                httpMethod: "POST",
                resource: "admin/databases/" + options.database +"/options",
                acceptHeader: "application/json",
                params: options.params,
                msgBody: options.optionsObj,
                isJsonBody: true
            };

        this._httpRequest(reqOptions, callback);
    };

    // #### Get option values from an existing database.
    // Retrieves a set of options passed through a JSON object specification.
    // The JSON input has empty values for each key, but will be filled with the option
    // values in the database when the call returns.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `database`: the name of the db to retrieve the option values.
    //              `optionsObj`: the options JSON object seed, indicating the options to retrieve, [more info](http://docs.stardog.com/http/).
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.getDBOptions = function(options, callback) {
        var reqOptions = {
                httpMethod: "PUT",
                resource: "admin/databases/" + options.database +"/options",
                acceptHeader: "application/json",
                params: options.params || "",
                msgBody: options.optionsObj,
                isJsonBody: true
            };

        this._httpRequest(reqOptions, callback);
    };

    // ### User operations.

    // Administrative API calls for managing user accounts in Stardog, e.g. creating/modifying/removing
    // user accounts.

    // #### Create new user
    // Adds a new user to the system; allows a configuration option for superuser as a JSON object.
    // Superuser configuration is set as default to false. The password __must__ be provided for the user.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `username`: the username of the user to create.
    //              `password`: the initial password of the newly created user.
    //              `superuser`: boolean flag indicating if the created user will have super-user privileges.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.createUser = function (options, callback) {
        var reqOptions = {
            httpMethod: "POST",
            resource: "admin/users",
            acceptHeader: "application/json",
            msgBody: { "username" : options.username, "password" : options.password.split("") },
            isJsonBody: true,
            params: options.params || ""

        };

        if (options.superuser) {
            reqOptions.msgBody.superuser = options.superuser;
        }

        this._httpRequest(reqOptions, callback);
    };

    // #### Change user's password
    // Changes `user` password in the system. Receives input of new password as a JSON Object.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the user to change the password.
    //              `newPwd`: the new password of `user`.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.changePwd = function (options, callback) {
        var reqOptions = {
            httpMethod: "PUT",
            resource: "admin/users/" + options.user + "/pwd",
            acceptHeader: "application/json",
            msgBody: { "password" : options.newPwd },
            isJsonBody: true,
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Check if user is enabled.
    // Verifies if user is enabled in the system.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the user name to verify if enabled.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.isUserEnabled = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/users/" + options.user + "/enabled",
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Check if user is superuser.
    // Verifies if the user is a superuser.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the user to verify if is superuser.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.isSuperUser = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/users/" + options.user + "/superuser",
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### List user roles.
    // Retrieves the list of the roles assigned to user.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the user used to list roles.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.listUserRoles = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/users/" + options.user + "/roles",
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### List users (GET)
    // Retrieves a list of users available in the system.
    //
    // __Parameters__:
    // `options`: (optional) an object with one the following attributes:
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.listUsers = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/users",
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, typeof options === "function" ? options : callback);
    };

    // #### Delete user
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the name of the user to delete from the system.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.deleteUser = function (options, callback) {
        var reqOptions = {
            httpMethod: "DELETE",
            resource: "admin/users/" + options.user,
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Enable users.
    // Enables/Disables an existing user in the system.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the name of the user to set enable.
    //              `enableFlag`: boolean flag, if `true` user is enabled; `false` to disable it.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.userEnabled = function (options, callback) {
        var reqOptions = {
            httpMethod: "PUT",
            resource: "admin/users/" + options.user + "/enabled",
            acceptHeader: "application/json",
            params: options.params || "",
            msgBody: { "enabled" : options.enableFlag},
            isJsonBody: true
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Setting user roles.
    // Sets roles for a given user.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the name of the user to set the roles.
    //              `roles`: an array containing the roles to assign to the user, [more info](http://docs.stardog.com/http/).
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.setUserRoles = function (options, callback) {
        var reqOptions = {
            httpMethod: "PUT",
            resource: "admin/users/" + options.user + "/roles",
            acceptHeader: "application/json",
            params: options.params || "",
            msgBody: { "roles" : options.roles },
            isJsonBody: true
        };

        this._httpRequest(reqOptions, callback);
    };

    // ### Role operations.

    // Administrative API calls for managing roles in Stardog, which are part of the security model, e.g. creating/modifying/removing
    // roles.

    // #### Create a new role
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `rolename`: the name of the role to create.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.createRole = function(options, callback) {
        var reqOptions = {
            httpMethod: "POST",
            resource: "admin/roles",
            acceptHeader: "application/json",
            params: options.params || "",
            msgBody: { "rolename" : options.rolename },
            isJsonBody: true
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### List roles (GET)
    // Retrieves the list of roles registered in the system.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.listRoles = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/roles",
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, (typeof options === "function") ? options : callback);
    };

    // #### List users with a specified role.
    // Retrieves users that have the role assigned.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `role`: the role to look for in the set of users defined in Stardog.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.listRoleUsers = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/roles/" + options.role + "/users",
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Delete role
    // Deletes an existing role from the system; the force parameter is a boolean
    // flag which indicates if the delete call for the role must be forced,
    // [more info](http://docs.stardog.com/http/)
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `role`: the role to delete.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.deleteRole = function (options, callback) {
        var reqOptions = {
            httpMethod: "DELETE",
            resource: "admin/roles/" + options.role,
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // ### Permissions operations.

    // Administrative API calls for managing permissions for users & roles in Stardog,
    // which are also part of the security model, e.g. creating/modifying/removing
    // permissions.

    // #### Assign permission to role.
    // Creates a new permission for a given role over a specified resource.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `role`: the role to whom the permission will be assigned.
    //              `permissionObj`: the permission descriptor object, [more info](http://docs.stardog.com/http/).
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.assignPermissionToRole = function (options, callback) {
        var reqOptions = {
            httpMethod: "PUT",
            resource: "admin/permissions/role/" + options.role,
            acceptHeader: "application/json",
            params: options.params || "",
            msgBody: options.permissionObj,
            isJsonBody: true
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Assign permission to user.
    // Creates a new permission for a given user over a specified resource.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the user to whom the permission will be assigned.
    //              `permissionObj`: the permission descriptor object, [more info](http://docs.stardog.com/http/).
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.assignPermissionToUser = function (options, callback) {
        var reqOptions = {
            httpMethod: "PUT",
            resource: "admin/permissions/user/" + options.user,
            acceptHeader: "application/json",
            params: options.params || "",
            msgBody: options.permissionObj,
            isJsonBody: true
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Delete permission from role.
    // Deletes a permission for a given role over a specified resource.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `role`: the role to whom the permission will be removed.
    //              `permissionObj`: the permission descriptor object, [more info](http://docs.stardog.com/http/).
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.deletePermissionFromRole = function (options, callback) {
        var reqOptions = {
            httpMethod: "POST",
            resource: "admin/permissions/role/" + options.role + "/delete",
            acceptHeader: "application/json",
            params: options.params || "",
            msgBody: options.permissionObj,
            isJsonBody: true
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### Delete permission from user.
    // Deletes a permission for a given user over a specified resource.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the user to whom the permission will be removed.
    //              `permissionObj`: the permission descriptor object, [more info](http://docs.stardog.com/http/).
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.deletePermissionFromUser = function (options, callback) {
        var reqOptions = {
            httpMethod: "POST",
            resource: "admin/permissions/user/" + options.user + "/delete",
            acceptHeader: "application/json",
            params: options.params || "",
            msgBody: options.permissionObj,
            isJsonBody: true
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### List role permissions.
    // Retrieves permissions assigned to the role.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `role`: the role to check for its permissions.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.listRolePermissions = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/permissions/role/" + options.role,
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### List user permissions.
    // Retrieves permissions assigned to the user.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the user to check for its permissions.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.listUserPermissions = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/permissions/user/" + options.user,
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // #### List user effective permissions.
    // Retrieves effective permissions assigned to the user.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `user`: the user to check for its effective permissions.
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.listUserEffPermissions = function (options, callback) {
        var reqOptions = {
            httpMethod: "GET",
            resource: "admin/permissions/effective/user/" + options.user,
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, callback);
    };

    // ### Shutdown server.
    // Shuts down the Stardog Server. If successful, returns a 202 to indicate that the
    // request was received and that the server will be shut down shortly.
    //
    // __Parameters__:
    // `options`: an object with one the following attributes:
    //              `params`: (optional) any other parameters to pass to the SPARQL endpoint.
    // `callback`: the callback to execute once the request is done.
    Connection.prototype.shutdownServer = function (options, callback) {
        var reqOptions = {
            httpMethod: "POST",
            resource: "admin/shutdown",
            acceptHeader: "application/json",
            params: options.params || ""
        };

        this._httpRequest(reqOptions, (typeof options === "function") ? options : callback);
    };

    return Stardog;
});
