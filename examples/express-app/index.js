var express = require("express");
var stardog = require("stardog");

var app = express();

// just setting them here, could be in a config file
var dbuser = "admin";
var dbpass = "admin";

function connection() {
  "use strict";

  var sdconn = new stardog.Connection();
  sdconn.setEndpoint("http://localhost:5820");
  sdconn.setCredentials(dbuser, dbpass);

  return sdconn;
}

/**
 * Assume everything is working under our app DB (nodeDB),
 * but it could be a parameter too!
 */

// Very simple resource GET, no URI validations or anything fancy
app.get("/article/:id", function (req, res) {
  "use strict";

  var instanceQuery = "construct where { <"+ req.params.id +"> ?p ?o }";

  console.log("Requested id: "+ req.params.id);

  connection().query({
    database: "nodeDB",
    query: instanceQuery,
    mimetype: "application/ld+json"
  },
  function (data) {     // callback
    // just take the first element, URIs must be unique
    if (data.length > 0) {
      res.send(data[0]);
    }
  });
});

// Something can be done here for POST to create a new article
// ...

// Redirect query
app.get("/query", function (req, res) {
  "use strict";

  console.log("Executing query "+ req.query.query);

  connection().query({
    database: "nodeDB",
    query: req.query.query
  },
  function (data) {     // callback
    res.send(data);
  });
});


// Start server with our app
var server = app.listen(3000, function () {
  "use strict";

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);

});
