//     Stardog.js 0.0.4
//
// Copyright 2012 Clark & Parsia LLC

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
	// ## Initial Setup
	// -------------
	//
	// Save a reference to the global object ('window' in the browser, 'global'
	// on the server).
	var root = this;

	// Save the previous value of the 'Stardog' variable, so that it can be 
	// restored later on, if 'noConflict' is used.
	var previousStardog = root.Stardog;

	// Export the Underscore object for **Node.js**, with
	// backward compatibility for the old `require()` API. If we're in
	// the browser, add `_` as a global object via a string identifier,
	// for Closure Compiler "advanced" mode.
	if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
		exports = module.exports = factory();
	}
	else if (typeof define === 'function' && define.amd) {
		// load Stardog via AMD
		define(['stardog'], function() {
			// Export to global for backward compatibility
			root['Stardog'] = factory();
			return root.Stardog();
		});
	}
	else {
		// Browser global
		root['Stardog'] = factory();
	}
}).call(this, function() {
	// Create top-level namespace
	var Stardog = {};

	// Current version of the library. Keep in sync with 'package.json'
	Stardog.VERSION = '0.0.4';

	// Require request, if we're on the server, and it's not already present
	var request = root.request;
	if (!request && (typeof require !== 'undefined')) request = require('request');

	// Require querystring, if we're on the server, and it's not already present
	var qs = root.qs;
	if (!qs && (typeof require !== 'undefined')) qs = require('querystring');

	// For AJAX's purposes, jQuery owns the `$` variable.
	// jQuery is only required when using the library in the browser.

	
	// ## Define LinkedJson Object
	// ---------------------------------------------

	// LinkedJson is an abstraction of a JSON-LD Object. This is just a placeholder for a 
	// better implementation of the JSON-LD spec. Currently it is used for query results when 
	// the result format is a JSON-LD from Stardog.
	var LinkedJson = Stardog.LinkedJson = function (jsonldValues) {
		// Attributes contains the original JSON object with the map of 
		// all the attributes.
		this.attributes = jsonldValues;
	}

	// Gets a property from the LinkedJson object.
	LinkedJson.prototype.get = function (key) {
		return this.attributes[key];
	}

	// Sets a property in the LinkedJson object.
	LinkedJson.prototype.set = function (key, value) {
		this.attributes[key] = value;
	}

	// Get the raw JSON object of the LinkedJson object.
	LinkedJson.prototype.rawJSON = function () {
		return this.attributes;
	}

	// Returns a String representation of the LinkedJson object.
	LinkedJson.prototype.toString = function () {
		return JSON.stringify(this.attributes);
	}

	// ---------------------------------

    // ## Stardog Connection
    //
    // Defines the HTTP connection to Stardog as well as all the API calls 
    // available to this protocol. The API calls defined in this element are
    // referenced in [Stardog Network documentation](http://stardog.com/docs/network/).
	var Connection = Stardog.Connection = function ()	{ 
		// By default (for testing)
		this.endpoint = 'http://localhost:5822/nodeDB/';
	};

    // Set the Stardog HTTP endpoint, usually running in port `5822`.
	Connection.prototype.setEndpoint = function (endpoint) {
		if (endpoint.charAt(endpoint.length-1) != '/') {
			this.endpoint = endpoint + '/';
		} else {
			this.endpoint = endpoint;
		}
	};

    // Retrieve the configured Stardog HTTP endpoint.
	Connection.prototype.getEndpoint = function () {
		return this.endpoint;
	};

    // Set the Stardog Credentials - `username` and `password`.
	Connection.prototype.setCredentials = function(username, password) {
		this.credentials = new Object();
		this.credentials.username = username;
		this.credentials.password = password;
	};

    // Retrieve the configured Stardog Credentials. Credentials are returned in a JSON 
    // containing `{ "username": "...", "password": "..." }`
	Connection.prototype.getCredentials = function() {
		return this.credentials;
	};
        
    // Sets the reasoning level of the connection when performing SPARQL queries &
    // function calls involving reasoning. Allowed values are documented in 
    // [Stardog Reasoning docs](http://stardog.com/docs/owl2/)
	Connection.prototype.setReasoning = function(reasoning) {
		return this.reasoning = reasoning;
	};

    // Retrieves the configured reasoning level for the Stardog Connection.
	Connection.prototype.getReasoning = function() {
		return this.reasoning;
	};

	// Check if we're in node or in the browser.
	// Execute a query to the endpoint provided with the 
	// resource specified and the parameters.
	// Needs a callback to process results in a function receiving a 
	// JSONLD object.
	if (typeof exports !== 'undefined') {
		// Node.js implementation of the HTTP request using `request` npm module.

		Connection.prototype._httpRequest = function(theMethod, 
			resource, acceptH, params, callback, msgBody, isJsonBody, contentType, multipart) {

			var req_url = this.endpoint + resource,
				strParams = qs.stringify(params);

			if (strParams && strParams.length > 0)
				req_url += "?" + strParams;

			var fnResponseHandler = function (error, response, body) {
				if (!error) {
					var jsonData;
					// Try to parse response to JSON, which is expected in most 
					// cases
					try {
						jsonData = JSON.parse(body);

						if (jsonData instanceof Array) {
							// console.log(jsonData);
							var arrLinkedJson = []
							for (var iElem=0; iElem < jsonData.length; iElem++) {
								// Check if the JSON object is JSON-LD
								if (jsonData[iElem].hasOwnProperty('@id') || 
                                    jsonData[iElem].hasOwnProperty('@context')) {
								
                                    arrLinkedJson.push( new LinkedJson(jsonData[iElem]) );
								}
							}
							jsonData = arrLinkedJson;
						}
						else if (jsonData.hasOwnProperty('@id') ||
                            jsonData.hasOwnProperty('@context')) {
                            
                            jsonData = new LinkedJson(jsonData);
						}
					}
					catch (err) {
                        // If parsing throws an error just leave it as is.
                        jsonData = body;
					}

					callback(jsonData, response);
				}
				else {
					console.log('Error found!');
					console.log(error);
				}
			};

			// build request object
			var reqJSON = { 
				url : req_url,
				method : theMethod,
				headers : {
					"Accept" : acceptH
				}
			};

			if (msgBody && msgBody != null) {
				if (isJsonBody) {
					reqJSON["json"] = msgBody;
				}
				else {
					reqJSON["body"] = msgBody;
					reqJSON["headers"]["Content-Type"] = contentType;
				}
			}

			if (this.credentials) {
				var authHeaderVal = "Basic " + new Buffer(this.credentials.username + ":" + 
					this.credentials.password).toString("base64");

				reqJSON["headers"]["Authorization"] = authHeaderVal;
			}

			if (multipart && multipart != null) {
				reqJSON["multipart"] = multipart;
			}

			if (this.reasoning && this.reasoning != null) {
				reqJSON['headers']['SD-Connection-String'] = 'reasoning=' + this.reasoning;
			}

			request(reqJSON, 
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
		Connection.prototype._base64Encode = typeof(btoa) == "function" ? function(x){return btoa(x)} : null;

		// Low level HTTP request method to use in the Browser, using an AJAX implementation.
		Connection.prototype._httpRequest = function(theMethod, resource, acceptH, params, callback) {
			var req_url = this.endpoint + resource,
				headers = {},
				username, password;

			if (this.reasoning && this.reasoning != null) {
				headers['SD-Connection-String'] = 'reasoning=' + this.reasoning;
			}
			headers['Accept'] = acceptH || "application/sparql-results+json";

			if (this.credentials) {
				username = this.credentials.username;
				password = this.credentials.password;
				if (this._base64Encode) {
					var userPassBase64 = this._base64Encode(username.concat(":",password));
				} else {
					throw new Error("Your browser does not support btoa() natively.\n" +
						" Please provide a javascript implementation for Connection.prototype._base64Encode")
				}
				headers["Authorization"] = "Basic ".concat(userPassBase64);
			}

			$.ajax({
				type: theMethod,
				url: req_url,
				dataType: 'json',
				data: params,
				headers: headers,

				success: function(data) {
					var return_obj;

					// check if the returned object is a JSONLD object
					if (data.hasOwnProperty('@id') || data.hasOwnProperty('@context')) {
						return_obj = Connection._convertToLinkedJson(data);
					}
					else {
						return_obj = data;
					}

					callback(return_obj);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					callback({
						'status': jqXHR.status,
						'statusText' : jqXHR.statusCode,
						'error': jqXHR.responseText});
				}
			});
		};
	}

    // `Connection.getProperty` retrieves the values for a specific property of a URI individual in a 
    // Stardog DB. This function is a direct access to provide easy out-of-the-box functionality
    // for retrieving common properties such as rdfs:label, etc
	Connection.prototype.getProperty = function(database, uri, property, callback) {
		var strQuery = 'select ?val where { '+ uri +' '+ property +' ?val }' ;
		var val = uri;

		this.query(database, strQuery, function (jsonRes) {

			if (jsonRes.results && jsonRes.results.bindings.length > 0) {
				val = jsonRes.results.bindings[0].val.value;
			}

			callback(val);
		});
	};

	// Performs a GET to the root endpoint of the DB `database`
	//
	// __Parameters__:  
	// `database`: the name of the database verify its size.
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.getDB = function (database, callback) {
		this._httpRequest("GET", database, "*/*", "", callback);
	};

	// Retrieve the DB size.
	// Returns a single numeric value representing the number of triples in the database.
	//
	// __Parameters__:  
	// `database`: the name of the database verify its size.
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.getDBSize = function (database, callback) {
		this._httpRequest("GET", database + "/size", "*/*", "", callback);
	};

	// Evaluate a SPARQL query specifying `database`, `query`, `baseURI`, `limit`, `offset` and the `mimetype`
	// for the Accept header. This method is designed for `select` & `ask` queries, where the result type will 
	// be a set of bindings.
	Connection.prototype.query = function(database, query, baseURI, limit, offset, callback, acceptMIME) {
		var acceptH = (acceptMIME) ? acceptMIME : 'application/sparql-results+json';
		var options = {
			"query" : query
		};

		if (baseURI && baseURI != null)
			options["baseURI"] = baseURI;

		if (limit && limit != null)
			options["limit"] = limit;

		if (offset && offset != null)
			options["offset"] = offset;

		this._httpRequest("GET", database + "/query", acceptH, options, callback);
	};


	// Evaluate a SPARQL query specifying `database`, `query`, `baseURI`, `limit`, `offset` and the `mimetype`
	// for the Accept header. This method is designed for `describe` & `construct` queries, where the result type will 
	// be a set of triples.
	Connection.prototype.queryGraph = function (database, query, baseURI, limit, offset, callback, acceptMIME) {
		var acceptH = (acceptMIME) ? acceptMIME : 'application/ld+json';
		var options = {
			"query" : query
		};

		if (baseURI && baseURI != null)
			options["baseURI"] = baseURI;

		if (limit && limit != null)
			options["limit"] = limit;

		if (offset && offset != null)
			options["offset"] = offset;

		this._httpRequest("GET", database + "/query", acceptH, options, callback);
	};

	// Returns the query plan generated by Stardog given a SPARQL query.
	Connection.prototype.queryExplain = function (database, query, baseURI, callback) {
		var options = {
			"query" : query
		}

		if (baseURI)
			options["baseURI"] = baseURI;

		this._httpRequest("GET", database + "/explain", "text/plain", options, callback);
	};

	// Start a new transaction in the database.
	Connection.prototype.begin = function (database, callback) {
		this._httpRequest("POST", database + "/transaction/begin", "text/plain", "", callback);
	};

	// Commit the transaction `txId` in the database. This will remove the transaction and the `txId` will not 
	// be valid anymore. All function calls using a transaction to mutate the contents of a database must call this 
	// function in order to make the changes permanent.
	Connection.prototype.commit = function (database, txId, callback) {
		this._httpRequest("POST", database + "/transaction/commit/" + txId, "text/plain", "", callback);
	};

	// Perform a rollback given within a trasaction, providing the transaction id `txId`.
	Connection.prototype.rollback = function (database, txId, callback) {
		this._httpRequest("POST", database + "/transaction/rollback/"+ txId, "text/plain", "", callback);
	};

	// Evaluate a SPARQL query using a transaction `txId`.
	Connection.prototype.queryInTransaction = 
		function (database, txId, query, baseURI, limit, offset, callback, acceptMIME) {
		var acceptH = (acceptMIME) ? acceptMIME : 'application/sparql-results+json';
		var options = {
			"query" : query
		};

		if (baseURI && baseURI != null)
			options["baseURI"] = baseURI;

		if (limit && limit != null)
			options["limit"] = limit;

		if (offset && offset != null)
			options["offset"] = offset;

		this._httpRequest("GET", database + "/" + txId +"/query", acceptH, options,	callback);
	};

	// Add a set of statements included in the `body` request, using a transaction `txId`. Note that after calling this function 
	// to add the statements, `Connection.commit` must be performed to make the changes persistent in the DB.
	Connection.prototype.addInTransaction = function (database, txId, body, callback, contentType, graph_uri) {
		var options;
		if (graph_uri && graph_uri != null) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		this._httpRequest("POST", database + "/" + txId + "/add", "*/*", options, callback, body, false, contentType, null);
	};

	// Remove a set of statements included in the `body` request, using a transaction `txId`. Note that after calling this function 
	// to add the statements, `Connection.commit` must be performed to make the changes persistent in the DB.
	Connection.prototype.removeInTransaction = function (database, txId, body, callback, contentType, graph_uri) {
		var options;
		if (graph_uri) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		this._httpRequest("POST", database + "/" + txId + "/remove", "text/plain", options, callback, body, false, contentType, null);
	};

	// Clears the content of the DB.
	Connection.prototype.clearDB = function (database, txId, callback, graph_uri) {
		var options;
		if (graph_uri) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		this._httpRequest("POST", database + "/" + txId + "/clear", "text/plain", options, callback);
	};

	// ## Reasoning API
	// -------------------------
	
	// API call to get explanation of the inferences in `axioms` using a transaction `txId` with the content type 
	// `contentType` of the axioms.
	Connection.prototype.reasoningExplain = function (database, axioms, callback, contentType, txId) {
		var url = database + "/reasoning";
		if (txId && txId != null) {
			url = url + "/" + txId;
		}
		url + url + "/explain";

		// set default content-type to "text/plain" (N-Triples)
		if (!contentType || contentType === null) {
			contentType = "text/plain";
		}

		this._httpRequest("POST", url, "application/x-turtle", null, callback, axioms, false, contentType);
	};

	// Checks the logical consistency of database. If using a named graph provide the `graph_uri` parameter.
	// Returns a boolean response as `true` if the database is consistent. 
	// See [stardog-reasoning consistency](http://stardog.com/docs/man/reasoning-consistency.html)
	Connection.prototype.isConsistent = function (database, callback, graph_uri) {
		var options;
		if (graph_uri) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		this._httpRequest("GET", database + "/reasoning/consistency", "text/boolean", options, callback);
	}

	// ### Integrity Constraint Validation
	// Listing the Integrity Constraints. Returns the integrity constraints for the specified database serialized in any supported RDF format.
	Connection.prototype.getICV = function (database, acceptH, callback) {
		var acceptH = (acceptMIME) ? acceptMIME : 'text/plain';
		this._httpRequest("GET", database + "/icv", acceptH, null, callback);
	};

	// Accepts a set of valid Integrity constraints serialized in any RDF format supported by Stardog and adds them to the database in an atomic action. 
	// 200 return code indicates the constraints were added successfully, 500 indicates that the constraints were not valid or unable to be added.
	Connection.prototype.setICV = function (database, icv_axioms, callback, contentType) {
		// set default content-type to "text/plain" (N-Triples)
		if (!contentType || contentType === null) {
			contentType = "text/plain";
		}

		this._httpRequest("POST", database + "/icv/add", "text/boolean", null, callback, icv_axioms, false, contentType);
	};

	// Accepts a set of valid Integrity constraints serialized in any RDF format supported by Stardog and removes them from the database in a single atomic action. 
	// 200 indicates the constraints were successfully remove; 500 indicates an error.
	Connection.prototype.removeICV = function (database, icv_axioms, callback, contentType) {
		// set default content-type to "text/plain" (N-Triples)
		if (!contentType || contentType === null) {
			contentType = "text/plain";
		}

		this._httpRequest("POST", database + "/icv/remove", "text/boolean", null, callback, icv_axioms, false, contentType);
	};

	// Drops ALL integrity constraints for a database. 200 indicates all constraints were successfully dropped; 500 indicates an error.
	Connection.prototype.clearICV = function (database, callback) {
		this._httpRequest("POST", database + "/icv/clear", "text/boolean", null, callback);
	};

	// Only works for one constraint, if more than 1 are provided returns 400 code status. The body of the POST is a single Integrity Constraint, 
	// serialized in any supported RDF format, with Content-type set appropriately. Returns either a text/plain result containing a single SPARQL query; 
	// or it returns 400 if more than one constraint was included in the input.
	Connection.prototype.fromICVtoSPARQL = function (database, icv_axiom, callback, contentType, graph_uri) {
		var options;
		if (graph_uri) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		// set default content-type to "text/plain" (N-Triples)
		if (!contentType || contentType === null) {
			contentType = "text/plain";
		}

		this._httpRequest("POST", database + "/icv/convert", "text/plain", options, callback, icv_axiom, false, contentType);
	};

	// -----------------------------------------

	// Returns a mapping of common prefix-namespace values. In the future this function will be replaced by a function call to the DB service.
	Connection.prototype.getPrefixes = function () {
		var prefixMap = {
			'http://www.w3.org/2002/07/owl#' : 'owl',
			'http://www.w3.org/2000/01/rdf-schema#' : 'rdfs',
			'http://www.w3.org/1999/02/22-rdf-syntax-ns#' : 'rdf',
			'http://www.w3.org/2001/xmlnschema#' : 'xsd',
			'http://www.w3.org/2004/02/skos/core#' : 'skos',
			'http://purl.org/dc/elements/1.1/' : 'dc',
			'http://xmlns.com/foaf/0.1/' : 'foaf',
			'http://www.w3.org/ns/sparql-service-description#' : 'sd',
			'http://rdfs.org/ns/void#' : 'void',
			'http://www.w3.org/ns/org#' : 'org',
			'http://clarkparsia.com/annex#' : 'annex'
		};

		return prefixMap;
	};

	// ## Stardog Administrative API
	// ---------------------------------------
	// [Extended HTTP Protocol](http://stardog.com/docs/network/#extended-http)

	// ### Database operations.

	// These API calls are related to the DBMS core functions for administrating resources in the 
	// Stardog Database System, such as: getting a list of databases, add/copy/delete databases. 
	// Note that there's one administrative call missing for creating DBs, this is to limitations 
	// on the HTTP multi-part libraries, but support for this is coming soon.

	// #### List databases (GET)
	// Get a List of the existing databases in the system.
	//
	// __Parameters__:  
	// `callback`: the callback to execute once the request is done. 
	Connection.prototype.listDBs = function (callback) {
		this._httpRequest("GET", "admin/databases", "application/json", "", callback);
	};

	// #### Copy database (PUT)
	// Copy an existing database.
	//
	// __Parameters__:  
	// `dbsource`: the name of the database to copy.  
	// `dbtarget`: the name of the new copied database.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.copyDB = function (dbsource, dbtarget, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbsource + "/copy", "application/json", { "to" : dbtarget }, callback
		);
	};

	// #### Drop an existing database.
	// Drops an existing database `dbname` and all the information that it contains.
	//
	// __Parameters__:  
	// `dbname`: the name of the database to drop.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.dropDB = function (dbname, callback) {
		this._httpRequest(
			"DELETE", "admin/databases/"+ dbname, "application/json", "", callback
		);
	};

	// #### Migrate an existing database.
	// Migrates the existing content of a legacy database to new format.
	// 
	// __Parameters__:  
	// `dbname`: the name of the database to migrate.
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.migrateDB = function (dbname, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/migrate", "application/json", "", callback
		);
	};

	// #### Optimize an existing database.
	// Optimize an existing database.
	//
	// __Parameters__:  
	// `dbname`: the name of the database to optimize.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.optimizeDB = function (dbname, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/optimize", "application/json", "", callback
		);
	};

	// #### Set database on-line.
	// Request message to set an existing database `dbname` on-line.
	//
	// __Parameters__:  
	// `dbname`: the name of the database to set on-line.  
	// `strategyOp`: the strategy options, [more info](http://stardog.com/docs/network/#extended-http).  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.onlineDB = function (dbname, strategyOp, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/online", "application/json", { "strategy" : strategyOp }, callback
		);
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
	// `dbname`: the name of the database to set off-line.  
	// `strategyOp`: the strategy options, [more info](http://stardog.com/docs/network/#extended-http).  
	// `timeoutMS`: timeout in milliseconds.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.offlineDB = function (dbname, strategyOp, timeoutMS, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/offline", "application/json", { "strategy" : strategyOp }, callback
		);
	};

	// #### Set option values to an existing database.
	// Set options in the database passed through a JSON object specification, i.e. JSON Request for option values. 
	// Database options can be found [here](http://stardog.com/docs/admin/#admin-db).
	//
	// __Parameters__:  
	// `dbname`: the name of the database to set the options.  
	// `optionsObj`: the options JSON object, indicating the options and values to set, [more info](http://stardog.com/docs/network/#extended-http).  
	// `callback`: the callback to execute once the request is done.
	Connection.prototype.setDBOptions = function(dbname, optionsObj, callback) {
		this._httpRequest(
			"POST", "admin/databases/"+ dbname +"/options", "application/json", "", callback, optionsObj, true
		);
	};

	// #### Get option values from an existing database.
	// Retrieves a set of options passed through a JSON object specification. 
	// The JSON input has empty values for each key, but will be filled with the option 
	// values in the database when the call returns.
	//
	// __Parameters__:  
	// `dbname`: the name of the db to retrieve the option values.  
	// `optionsObj`: the options JSON object seed, indicating the options to retrieve, [more info](http://stardog.com/docs/network/#extended-http).  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.getDBOptions = function(dbname, optionsObj, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/options", "application/json", "", callback, optionsObj, true
		);
	};
	
	// ### User operations.

	// Administrative API calls for managing user accounts in Stardog, e.g. creating/modifying/removing 
	// user accounts.

	// #### Create new user
	// Adds a new user to the system; allows a configuration option for superuser as a JSON object. 
	// Superuser configuration is set as default to false. The password __must__ be provided for the user.
	// 
	// __Parameters__:  
	// `username`: the username of the user to create.  
	// `password`: the initial password of the newly created user.  
	// `superuser`: boolean flag indicating if the created user will have super-user privileges.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.createUser = function (username, password, superuser, callback) {
		var options = {
			"username" : username,
			"password" : password.split('')
		}

		if (superuser && superuser != null) {
			options["superuser"] = superuser;
		}

		this._httpRequest(
			"POST", "admin/users", "application/json", "", callback, options, true
		);
	};

	// #### Change user's password
	// Changes `user` password in the system. Receives input of new password as a JSON Object.
	//
	// __Parameters__:  
	// `user`: the user to change the password.  
	// `newPwd`: the new password of `user`.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.changePwd = function (user, newPwd, callback) {
		this._httpRequest(
			"PUT", "admin/users/"+ user +"/pwd", "application/json", "", callback, { "password" : newPwd }, true
		);
	};

	// #### Check if user is enabled.
	// Verifies if user is enabled in the system.
	// 
	// __Parameters__:  
	// `user`: the user name to verify if enabled.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.isUserEnabled = function (user, callback) {
		this._httpRequest("GET", "admin/users/"+ user +"/enabled", "application/json", "", callback);
	};

	// #### Check if user is superuser.
	// Verifies if the user is a superuser.
	//
	// __Parameters__:  
	// `user`: the user to verify if is superuser.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.isSuperUser = function (user, callback) {
		this._httpRequest("GET", "admin/users/"+ user +"/superuser", "application/json", "", callback);
	};

	// #### List user roles.
	// Retrieves the list of the roles assigned to user.
	//
	// __Parameters__:  
	// `user`: the user used to list roles.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.listUserRoles = function (user, callback) {
		this._httpRequest("GET", "admin/users/"+ user +"/roles", "application/json", "", callback);
	};

	// #### List users (GET)
	// Retrieves a list of users available in the system.
	//
	// __Parameters__:  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.listUsers = function (callback) {
		this._httpRequest("GET", "admin/users", "application/json", "", callback);
	};

	// #### Delete user
	// 
	// __Parameters__:  
	// `user`: the name of the user to delete from the system.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.deleteUser = function (user, callback) {
		this._httpRequest("DELETE", "admin/users/"+ user, "application/json", "", callback);
	};

	// #### Enable users.
	// Enables/Disables an existing user in the system.
	// 
	// __Parameters__:  
	// `user`: the name of the user to set enable.  
	// `enableFlag`: boolean flag, if `true` user is enabled; `false` to disable it.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.userEnabled = function (user, enableFlag, callback) {
		this._httpRequest(
			"PUT", "admin/users/"+ user +"/enabled", "application/json", "", callback, { "enabled" : enableFlag }, true
		);
	};

	// #### Setting user roles.
	// Sets roles for a given user.
	//
	// __Parameters__:  
	// `user`: the name of the user to set the roles.  
	// `rolesArray`: an array containing the roles to assign to the user, [more info](http://stardog.com/docs/network/#extended-http).  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.setUserRoles = function (user, rolesArray, callback) {
		this._httpRequest(
			"PUT", "admin/users/"+ user +"/roles", "application/json", "", callback, { "roles" : rolesArray }, true
		);
	};

	// ### Role operations.
	
	// Administrative API calls for managing roles in Stardog, which are part of the security model, e.g. creating/modifying/removing 
	// roles.

	// #### Create a new role
	// 
	// __Parameters__:  
	// `rolename`: the name of the role to create.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.createRole = function(rolename, callback) {
		this._httpRequest(
			"POST", "admin/roles", "application/json", "", callback, { "rolename" : rolename }, true
		);
	};

	// #### List roles (GET)
	// Retrieves the list of roles registered in the system.
	// 
	// __Parameters__:  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.listRoles = function (callback) {
		this._httpRequest("GET", "admin/roles", "application/json", "", callback);
	};

	// #### List users with a specified role.
	// Retrieves users that have the role assigned.
	//
	// __Parameters__:  
	// `role`: the role to look for in the set of users defined in Stardog.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.listRoleUsers = function (role, callback) {
		this._httpRequest("GET", "admin/roles/"+ role +"/users", "application/json", "", callback);
	};

	// #### Delete role
	// Deletes an existing role from the system; the force parameter is a boolean 
	// flag which indicates if the delete call for the role must be forced, 
	// [more info](http://stardog.com/docs/network/#extended-http)
	//
	// __Parameters__:  
	// `role`: the role to delete.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.deleteRole = function (role, callback) {
		this._httpRequest("DELETE", "admin/roles/"+ role, "application/json", "", callback);
	};

	// ### Permissions operations.

	// Administrative API calls for managing permissions for users & roles in Stardog, 
	// which are also part of the security model, e.g. creating/modifying/removing 
	// permissions.

	// #### Assign permission to role.
	// Creates a new permission for a given role over a specified resource.
	//
	// __Parameters__:  
	// `role`: the role to whom the permission will be assigned.  
	// `permissionObj`: the permission descriptor object, [more info](http://stardog.com/docs/network/#extended-http).  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.assignPermissionToRole = function (role, permissionObj, callback) {
		this._httpRequest(
			"PUT", "admin/permissions/role/"+ role, "application/json", "", callback, permissionObj, true
		);
	};

	// #### Assign permission to user.
	// Creates a new permission for a given user over a specified resource.
	//
	// __Parameters__:  
	// `user`: the user to whom the permission will be assigned.  
	// `permissionObj`: the permission descriptor object, [more info](http://stardog.com/docs/network/#extended-http).  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.assignPermissionToUser = function (user, permissionObj, callback) {
		this._httpRequest(
			"PUT", "admin/permissions/user/"+ user, "application/json", "", callback, permissionObj, true
		);
	};

	// #### Delete permission from role.
	// Deletes a permission for a given role over a specified resource.
	//
	// __Parameters__:  
	// `role`: the role to whom the permission will be removed.  
	// `permissionObj`: the permission descriptor object, [more info](http://stardog.com/docs/network/#extended-http).  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.deletePermissionFromRole = function (role, permissionObj, callback) {
		this._httpRequest(
			"POST", "admin/permissions/role/"+ role + "/delete", "application/json", "", callback, permissionObj, true
		);
	};

	// #### Delete permission from user.
	// Deletes a permission for a given user over a specified resource.
	//
	// __Parameters__:  
	// `user`: the user to whom the permission will be removed.  
	// `permissionObj`: the permission descriptor object, [more info](http://stardog.com/docs/network/#extended-http).  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.deletePermissionFromUser = function (user, permissionObj, callback) {
		this._httpRequest(
			"POST", "admin/permissions/user/"+ user + "/delete", "application/json", "", callback, permissionObj, true
		);
	};

	// #### List role permissions.
	// Retrieves permissions assigned to the role.
	//
	// __Parameters__:  
	// `role`: the role to check for its permissions.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.listRolePermissions = function (role, callback) {
		this._httpRequest(
			"GET", "admin/permissions/role/"+ role, "application/json", "", callback
		);
	};

	// #### List user permissions.
	// Retrieves permissions assigned to the user.
	//
	// __Parameters__:  
	// `user`: the user to check for its permissions.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.listUserPermissions = function (user, callback) {
		this._httpRequest(
			"GET", "admin/permissions/user/"+ user, "application/json", "", callback
		);
	};

	// #### List user effective permissions.
	// Retrieves effective permissions assigned to the user.
	//
	// __Parameters__:  
	// `user`: the user to check for its effective permissions.  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.listUserEffPermissions = function (user, callback) {
		this._httpRequest(
			"GET", "admin/permissions/effective/user/"+ user, "application/json", "", callback
			);
	};

	// ### Shutdown server.
	// Shuts down the Stardog Server. If successful, returns a 202 to indicate that the 
	// request was received and that the server will be shut down shortly.
	//
	// __Parameters__:  
	// `callback`: the callback to execute once the request is done.  
	Connection.prototype.shutdownServer = function (callback) {
		this._httpRequest(
			"POST", "admin/shutdown", "application/json", "", callback
			);
	};

	return Stardog;
});
