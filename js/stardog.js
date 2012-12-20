//     Stardog.js 0.0.1
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

(function() {

	// Initial Setup
	// -------------
	//
	// Save a reference to the global object ('window' in the browser, 'global'
	// on the server).
	var root = this;

	// Save the previous value of the 'Stardog' variable, so that it can be 
	// restored later on, if 'noConflict' is used.
	var previousStardog = root.Stardog;

	// Create top-level namespace
	var Stardog = {};
	// Export the Underscore object for **Node.js**, with
	// backwards-compatibility for the old `require()` API. If we're in
	// the browser, add `_` as a global object via a string identifier,
	// for Closure Compiler "advanced" mode.
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = Stardog;
		}
		//exports.Stardog = Stardog;
	} else {
		root['Stardog'] = Stardog;
	}

	// Create a local reference to slice/splice
	var slice = Array.prototype.slice;
	var splice = Array.prototype.splice;

	// Current version of the library. Keep in sync with 'package.json'
	Stardog.VERSION = '0.0.1';

	// Require jsonld, if we're on the server, and it's not already present
	var jsonld = root.jsonld;
	if (!jsonld && (typeof require !== 'undefined')) jsonld = require('jsonld');

	// Require request, if we're on the server, and it's not already present
	var request = root.request;
	if (!request && (typeof require !== 'undefined')) request = require('request');

	// Require querystring, if we're on the server, and it's not already present
	var qs = root.qs;
	if (!qs && (typeof require !== 'undefined')) qs = require('querystring');

	// For AJAX's purposes, jQuery owns the `$` variable.
	// jQuery is only required when using the library in the browser.

	// ---------------------------------------------
	// Define LinkedJson Object
	// ---------------------------------------------
	var LinkedJson = Stardog.LinkedJson = function (jsonldValues) {
		// Attributes contains the original JSON object with the map of 
		// all the attributes.
		this.attributes = jsonldValues;
	}

	LinkedJson.prototype.get = function (key) {
		return this.attributes[key];
	}

	LinkedJson.prototype.set = function (key, value) {
		this.attributes[key] = value;
	}

	LinkedJson.prototype.rawJSON = function () {
		return this.attributes;
	}

	LinkedJson.prototype.toString = function () {
		return JSON.stringify(this.attributes);
	}

	// ---------------------------------

	var Connection = Stardog.Connection = function ()	{ 
		// By default (for testing)
		this.endpoint = 'http://localhost:5822/nodeDB/';
	};

	Connection.prototype.setEndpoint = function (endpoint) {
		this.endpoint = endpoint;
	};

	Connection.prototype.getEndpoint = function () {
		return this.endpoint;
	};

	Connection.prototype.setCredentials = function(username, password) {
		this.credentials = new Object();
		this.credentials.username = username;
		this.credentials.password = password;
	};

	Connection.prototype.getCredentials = function() {
		return this.credentials;
	};

	Connection.prototype.setReasoning = function(reasoning) {
		return this.reasoning = reasoning;
	};

	Connection.prototype.getReasoning = function() {
		return this.reasoning;
	};

	// Check if we're in node or in the browser.
	// Execute a query to the endpoint provided with the 
	// resource specified and the params.
	// Needs a callback to process results in a function receiving a 
	// JSONLD object.
	if (typeof exports !== 'undefined') {
		// Node.js implementation using request

		Connection.prototype._httpRequest = function(theMethod, resource, acceptH, params, callback, msgBody, isJsonBody, contentType, multipart) {
			var req_url = this.endpoint + resource,
				strParams = qs.stringify(params);

			if (strParams && strParams.length > 0)
				req_url += "?" + strParams;

			// console.log("Endpoint using Nodejs: "+theMethod+ " -> " + req_url);

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
								if (jsonData[iElem].hasOwnProperty('@id') || jsonData[iElem].hasOwnProperty('@context')) {
									arrLinkedJson.push( new LinkedJson(jsonData[iElem]) );
								}
							}
							jsonData = arrLinkedJson;
						}
						else if (jsonData.hasOwnProperty('@id') || jsonData.hasOwnProperty('@context')) {
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
				var authHeaderVal = "Basic " + new Buffer(this.credentials.username + ":" + this.credentials.password).toString("base64");

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
		// Browser implementation usin jQuery's AJAX

		Connection.prototype._httpRequest = function(theMethod, resource, params, callback) {
			var req_url = this.endpoint + resource;

			//if (typeof params['callback'] === 'undefined')
			//  req_url = req_url + "?callback=?"

			// console.log("Endpoint: "+ req_url);

			var headers = {};
			if (this.reasoning && this.reasoning != null) {
				headers['SD-Connection-String'] = 'reasoning=' + this.reasoning;
			}

			$.ajax({
				type: theMethod,
				url: req_url,
				dataType: 'json',
				data: params,
				headers: headers,
				success: function(data) {
					var return_obj;

					console.log("Call on success");

					// check if the returned object is a JSONLD object
					if (data.hasOwnProperty('@id') || data.hasOwnProperty('@context')) {
						return_obj = Connection._convertToLinkedJson(data);
					}
					else {
						return_obj = data;
					}

					//console.info(return_obj);
					callback(return_obj);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log("Call on error");
					console.log(textStatus);
					console.log(errorThrown);

					callback({ 'message':'Error retrieving information from the Server.'});
				}
			});
		};
	}

	// ----------------------------------------------------------------------
	// Declares the Stardog Connection which will be able to query the endpoint
	// ----------------------------------------------------------------------

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

	// A Stardog Database
	Connection.prototype.getDB = function (database, callback) {
		this._httpRequest("GET", database, "*/*", "", callback);
	};

	// Database Size
	Connection.prototype.getDBSize = function (database, callback) {
		this._httpRequest("GET", database + "/size", "*/*", "", callback);
	};

	// Query Evaluation
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

	// Query Plan
	Connection.prototype.queryExplain = function (database, query, baseURI, callback) {
		var options = {
			"query" : query
		}

		if (baseURI)
			options["baseURI"] = baseURI;

		this._httpRequest("GET", database + "/explain", "text/plain", options, callback);
	};

	// Transactions
	Connection.prototype.begin = function (database, callback) {
		this._httpRequest("POST", database + "/transaction/begin", "text/plain", "", callback);
	};

	Connection.prototype.commit = function (database, txId, callback) {
		this._httpRequest("POST", database + "/transaction/commit/" + txId, "text/plain", "", callback);
	};

	Connection.prototype.rollback = function (database, txId, callback) {
		this._httpRequest("POST", database + "/transaction/rollback/"+ txId, "text/plain", "", callback);
	};

	Connection.prototype.queryInTransaction = function (database, txId, query, baseURI, limit, offset, callback, acceptMIME) {
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

	Connection.prototype.addInTransaction = function (database, txId, body, callback, contentType, graph_uri) {
		var options;
		if (graph_uri && graph_uri != null) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		this._httpRequest("POST", database + "/" + txId + "/add", "*/*", options, callback, body, false, contentType, null);
	};

	Connection.prototype.removeInTransaction = function (database, txId, body, callback, contentType, graph_uri) {
		var options;
		if (graph_uri) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		this._httpRequest("POST", database + "/" + txId + "/remove", "text/plain", options, callback, body, false, contentType, null);
	};

	Connection.prototype.clearDB = function (database, txId, callback, graph_uri) {
		var options;
		if (graph_uri) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		this._httpRequest("POST", database + "/" + txId + "/clear", "text/plain", options, callback);
	};

	// Reasoning API
	// -------------------------
	// Explanation of inferences.

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

	// Consistency

	Connection.prototype.isConsistent = function (database, callback, graph_uri) {
		var options;
		if (graph_uri) {
			options = {
				"graph-uri" : graph_uri
			};
		}

		this._httpRequest("GET", database + "/reasoning/consistency", "text/boolean", options, callback);
	}

	// ICV

	Connection.prototype.getICV = function (database, acceptH, callback) {
		var acceptH = (acceptMIME) ? acceptMIME : 'text/plain';
		this._httpRequest("GET", database + "/icv", acceptH, null, callback);
	};

	Connection.prototype.setICV = function (database, icv_axioms, callback, contentType) {
		// set default content-type to "text/plain" (N-Triples)
		if (!contentType || contentType === null) {
			contentType = "text/plain";
		}

		this._httpRequest("POST", database + "/icv/add", "text/boolean", null, callback, icv_axioms, false, contentType);
	};

	Connection.prototype.removeICV = function (database, icv_axioms, callback, contentType) {
		// set default content-type to "text/plain" (N-Triples)
		if (!contentType || contentType === null) {
			contentType = "text/plain";
		}

		this._httpRequest("POST", database + "/icv/remove", "text/boolean", null, callback, icv_axioms, false, contentType);
	};

	Connection.prototype.clearICV = function (database, callback) {
		this._httpRequest("POST", database + "/icv/clear", "text/boolean", null, callback);
	};

	// Only works for one constraint, if more than 1 are provided returns 400 code status.
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

	Connection.prototype.getPrefixes = function () {
		var prefixMap = {
			'http://www.w3.org/2002/07/owl#' : 'owl',
			'http://www.w3.org/2000/01/rdf-schema#' : 'rdfs',
			'http://www.w3.org/1999/02/22-rdf-syntax-ns#' : 'rdf',
			'http://www.w3.org/2001/XMLSchema#' : 'xsd',
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

	// ---------------------------------------
	// Administration functions referent to:
	// http://stardog.com/docs/network/#extended-http
	// ---------------------------------------

	// ----------------------------------------------------------------------------------
	// Database operations.
	// ----------------------------------------------------------------------------------

	// ----------------
	// List databases (GET)
	// ----------------

	Connection.prototype.listDBs = function (callback) {
		this._httpRequest("GET", "admin/databases", "application/json", "", callback);
	};

	// ----------------
	// Copy database (PUT)
	// ----------------

	Connection.prototype.copyDB = function (dbsource, dbtarget, callback) {
		this._httpRequest("PUT", "admin/databases/"+ dbsource + "/copy", "application/json", { "to" : dbtarget }, callback);
	};

	// ---------------------------
	// Drop an existing database.
	// ---------------------------

	Connection.prototype.dropDB = function (dbname, callback) {
		this._httpRequest(
			"DELETE", "admin/databases/"+ dbname, "application/json", "", callback
			);
	};

	// ---------------------------
	// Migrate an existing database.
	// ---------------------------

	Connection.prototype.migrateDB = function (dbname, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/migrate", "application/json", "", callback
			);
	};

	// ---------------------------
	// Optimize an existing database.
	// ---------------------------

	Connection.prototype.optimizeDB = function (dbname, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/optimize", "application/json", "", callback
			);
	};

	// ---------------------------
	// Set database online.
	// ---------------------------

	Connection.prototype.onlineDB = function (dbname, strategyOp, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/online", "application/json", { "strategy" : strategyOp }, callback
			);
	};

	// ---------------------------
	// Set database offline.
	// ---------------------------

	Connection.prototype.offlineDB = function (dbname, strategyOp, timeoutMS, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/offline", "application/json", { "strategy" : strategyOp }, callback
			);
	};

	// ------------------------------------------
	// Set option values to an existing database.
	// ------------------------------------------

	Connection.prototype.setDBOptions = function(dbname, optionsObj, callback) {
		this._httpRequest(
			"POST", "admin/databases/"+ dbname +"/options", "application/json", "", callback, optionsObj, true
			);
	};

	// ------------------------------------------
	// Get option values from an existing database.
	// ------------------------------------------

	Connection.prototype.getDBOptions = function(dbname, optionsObj, callback) {
		this._httpRequest(
			"PUT", "admin/databases/"+ dbname +"/options", "application/json", "", callback, optionsObj, true
			);
	};

	// ----------------------------------------------------------------------------------
	// User operations.
	// ----------------------------------------------------------------------------------

	// -------------------------
	// Create new user
	// -------------------------

	Connection.prototype.createUser = function (username, superuser, callback) {
		var options = {
			"username" : username
		}

		if (superuser && superuser != null) {
			options["superuser"] = superuser;
		}

		this._httpRequest(
			"POST", "admin/users", "application/json", "", callback, options, true
			);
	};

	// -------------------------
	// Change user's password
	// -------------------------

	Connection.prototype.changePwd = function (user, newPwd, callback) {
		this._httpRequest(
			"PUT", "admin/users/"+ user +"/pwd", "application/json", "", callback, { "password" : newPwd }, true
			);
	};

	// -------------------------
	// Check if user is enabled.
	// -------------------------

	Connection.prototype.isUserEnabled = function (user, callback) {
		this._httpRequest("GET", "admin/users/"+ user +"/enabled", "application/json", "", callback);
	};

	// -------------------------
	// Check if user is superuser.
	// -------------------------

	Connection.prototype.isSuperUser = function (user, callback) {
		this._httpRequest("GET", "admin/users/"+ user +"/superuser", "application/json", "", callback);
	};

	// -------------------------
	// List user roles.
	// -------------------------

	Connection.prototype.listUserRoles = function (user, callback) {
		this._httpRequest("GET", "admin/users/"+ user +"/roles", "application/json", "", callback);
	};

	// ----------------
	// List users (GET)
	// ----------------

	Connection.prototype.listUsers = function (callback) {
		this._httpRequest("GET", "admin/users", "application/json", "", callback);
	};

	// -------------------------
	// Delete user
	// -------------------------

	Connection.prototype.deleteUser = function (user, callback) {
		this._httpRequest("DELETE", "admin/users/"+ user, "application/json", "", callback);
	};

	// -------------------------
	// Enable users.
	// -------------------------

	Connection.prototype.userEnabled = function (user, enableFlag, callback) {
		this._httpRequest(
			"PUT", "admin/users/"+ user +"/enabled", "application/json", "", callback, { "enabled" : enableFlag }, true
			);
	};

	// -------------------------
	// Setting user roles.
	// -------------------------

	Connection.prototype.setUserRoles = function (user, rolesArray, callback) {
		this._httpRequest(
			"PUT", "admin/users/"+ user +"/roles", "application/json", "", callback, { "roles" : rolesArray }, true
			);
	};

	// ----------------------------------------------------------------------------------
	// Role operations.
	// ----------------------------------------------------------------------------------

	// -----------------
	// Create a new role
	// -----------------

	Connection.prototype.createRole = function(rolename, callback) {
		this._httpRequest(
			"POST", "admin/roles", "application/json", "", callback, { "rolename" : rolename }, true
			);
	};

	// ----------------
	// List roles (GET)
	// ----------------

	Connection.prototype.listRoles = function (callback) {
		this._httpRequest("GET", "admin/roles", "application/json", "", callback);
	};

	// ---------------------------------
	// List users with a specified role.
	// ---------------------------------

	Connection.prototype.listRoleUsers = function (role, callback) {
		this._httpRequest("GET", "admin/roles/"+ role +"/users", "application/json", "", callback);
	};

	// -----------------
	// Delete role
	// -----------------

	Connection.prototype.deleteRole = function (role, callback) {
		this._httpRequest("DELETE", "admin/roles/"+ role, "application/json", "", callback);
	};

	// ----------------------------------------------------------------------------------
	// Permissions operations.
	// ----------------------------------------------------------------------------------

	// ---------------------------
	// Assign permission to role.
	// ---------------------------

	Connection.prototype.assignPermissionToRole = function (role, permissionObj, callback) {
		this._httpRequest(
			"PUT", "admin/permissions/role/"+ role, "application/json", "", callback, permissionObj, true
			);
	};

	// ---------------------------
	// Assign permission to user.
	// ---------------------------

	Connection.prototype.assignPermissionToUser = function (user, permissionObj, callback) {
		this._httpRequest(
			"PUT", "admin/permissions/user/"+ user, "application/json", "", callback, permissionObj, true
			);
	};

	// ---------------------------
	// Delete permission to role.
	// ---------------------------

	Connection.prototype.deletePermissionFromRole = function (role, permissionObj, callback) {
		this._httpRequest(
			"POST", "admin/permissions/role/"+ role + "/delete", "application/json", "", callback, permissionObj, true
			);
	};

	// ---------------------------
	// Delete permission to user.
	// ---------------------------

	Connection.prototype.deletePermissionFromUser = function (user, permissionObj, callback) {
		this._httpRequest(
			"POST", "admin/permissions/user/"+ user + "/delete", "application/json", "", callback, permissionObj, true
			);
	};

	// ---------------------------
	// List role permissions.
	// ---------------------------

	Connection.prototype.listRolePermissions = function (role, callback) {
		this._httpRequest(
			"GET", "admin/permissions/role/"+ role, "application/json", "", callback
			);
	};

	// ---------------------------
	// List user permissions.
	// ---------------------------

	Connection.prototype.listUserPermissions = function (user, callback) {
		this._httpRequest(
			"GET", "admin/permissions/user/"+ user, "application/json", "", callback
			);
	};

	// ---------------------------
	// List user effective permissions.
	// ---------------------------

	Connection.prototype.listUserEffPermissions = function (user, callback) {
		this._httpRequest(
			"GET", "admin/permissions/effective/user/"+ user, "application/json", "", callback
			);
	};

	// ---------------------------
	// Shutdown server.
	// ---------------------------

	Connection.prototype.shutdownServer = function (callback) {
		this._httpRequest(
			"POST", "admin/shutdown", "application/json", "", callback
			);
	};

}).call(this);
