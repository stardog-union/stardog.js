/*
	NB: original code by @laczoka (https://gist.github.com/laczoka/5065270)
		adapted to work as a full proxy for stardog 1.2.2
*/

/* ISSUE: Stardog (up to v1.1.3) does not properly support CORS[1] interaction.
    The issue is two-fold:
    1) Stardog tries to authenticated the OPTIONS "pre-flight" request.
    2) Stardog doesn't return CORS headers, hence can only be accessed 
       by browser web apps running in a different domain via a proxy.

Effected browsers: Firefox and IE*. Safari and Chrome work due to a bug in webkit (see [2]).

Expected behavior: Stardog MUST NOT try to authenticate the pre-flight request, it SHOULD rather return 
proper CORS headers. [4]

As pers CORS spec: if the pre-flight request fails (response code != 200), the original request will not be sent.
For security reasons, browsers will not send any authentication information or custom HTTP headers in the pre-flight request.

[1] https://dvcs.w3.org/hg/cors/raw-file/tip/Overview.html 
[2] https://bugzilla.mozilla.org/show_bug.cgi?id=778548
[3] https://bugzilla.mozilla.org/show_bug.cgi?id=778548#c5
[4] https://dvcs.w3.org/hg/cors/raw-file/tip/Overview.html#preflight-request

This is an example implementation to demostrate how should Stardog work in a CORS scenario 

Run it:

> node testCORS.js

*/

var http = require('http'),
	port = 5820,
	request = require('request'),
	_ = require('underscore');

/* Always add these CORS headers to the response */
function addCORSHeaders(res) {
    res.setHeader("Access-Control-Allow-Headers","accept, Authorization,  origin, sd-connection-string, Content-Type");
    res.setHeader("Access-Control-Allow-Methods","OPTIONS, GET, PUT, POST, DELETE");
    res.setHeader("Access-Control-Allow-Origin","*");
}



var server = http.createServer(function(req, res){
    console.log('Connection');
    /* Browsers will send a "pre-flight" HTTP request and scan the response for CORS headers. 
       The pre-flight OPTIONS request MUST NOT be authenticated.
    */
  if (req.method == "OPTIONS") {
		console.log('Preflight request OPTIONS received');
		
		res.setHeader('Content-Type', 'text/plain')
		addCORSHeaders(res);
		
		res.writeHead(200);
		
		res.end();	
	} else {
	    /* Regular requests MAY be authenticated. */
		if (req.headers['authorization']) {
			var data = "";
		    req.on('data', function(chunk) {
		    	data = chunk.toString();
		    });
		    
		    // for (var name in req.headers) {
		    // 	console.log("name:", name, "val:", req.headers[name]);
		    // }

		    function responseHandler(error, response, body) {
				console.log("stardog response:", response.statusCode,", body:", body);
				console.log("\n\n");
				
				// build response
				res.setHeader('Content-Type', 'application/sparql-results+json')
				addCORSHeaders(res);

				res.writeHead(response.statusCode);
				if (body) {
					res.write(body);
				}
	    		
				res.end();
			};
		    req.on('end' , function() {
		    	var stardogHeaders = {
		    		"Accept": req.headers["accept"],
		    		"Authorization": req.headers['authorization']
		    	};
		    	if (req.headers['content-type']) {
		    		_.extend(stardogHeaders, {'Content-Type': req.headers['content-type'] });
		    	}
		    	if (req.headers['sd-connection-string']) {
		    		_.extend(stardogHeaders, {'SD-Connection-String': req.headers['sd-connection-string'] });
		    	}
		    	var reqJSON = {
		    		url: "http://localhost:5823" + req.url,
		    		method: req.method,
		    		headers: stardogHeaders
		    	};
		    	_.extend(reqJSON, { body: data });
		    	request(reqJSON, responseHandler);
		    });

		    console.log('Authorization header received: ' + req.headers['authorization']);
		    
		} else {
		    res.setHeader('Content-Type', 'text/plain')
		    res.setHeader('WWW-Authenticate','BASIC realm="Stardog"');
			addCORSHeaders(res);

			res.writeHead(401);
			res.end();
		}
		    
	}
});

server.listen(port);
console.log("HTTP Server started on http://localhost:" + port);