Stardog.js
==========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/complexible/stardog.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)  
_Current Version **0.3.1**_

Stardog.js JavaScript Framework for node.js to develop apps with the [Stardog RDF Database](http://stardog.com).  

<a href="http://stardog.com"><img src="http://stardog.com/img/stardog.png" width="250px"/></a>

For detailed documentation, see the [annotated source](http://complexible.github.io/stardog.js/docs/stardog.html).

## What is it? ##

This framework wraps all the functionality of a client for the Stardog DBMS, and provides access to a full set of functions such as executing SPARQL Queries, administration tasks on Stardog, and the use of the Reasoning API.

All the implementation uses the HTTP protocol, since most of Stardog functionality is available using this protocol. For more information, go to the Stardog's [HTTP Programming](http://docs.stardog.com/http/) documentation.

The framework is currently supported for node.js and the browser, including test cases for both environments.
You'll also need [npm](https://npmjs.org) and [bower](http://bower.io) to run the test cases and install the dependencies in node.js & the browser respectively.

## Installation

To install stardog.js locally from the npm registry simply execute:

#### In node.js

    npm install stardog

That will fetch the latest version of stardog.js in the npm registry, [more details](https://npmjs.org/package/stardog).

#### In the browser (client library using bower)

    bower install stardog

That will fetch the latest version of stardog.js in the bower registry, [more details](http://bower.io/search/?q=stardog).

## Development ##

To get started, just clone the project. You'll need a local copy of Stardog to be able to run the tests. For more information on starting the Stardog DB service and how it works, go to [Stardog's documentation](http://docs.stardog.com), where you'll find everything you need to get up and running with Stardog.

Go to [http://stardog.com](http://stardog.com), download and install the database and load the data provided in `data/` using the script in the repository.

1. Start the Stardog server

    * Stardog > `2.1.1`

            $ stardog-admin server start

    * Stardog <= `2.1.1`

            $ stardog-admin server start --port 5823

2. Install `stardog.js` dependencies:

        $ npm install
        $ bower install

This will install all the dependencies using npm (for node.js) and bower (for browser), once this is done, run the test cases.

### Running Tests

Run all the test cases in `test/spec`, all test cases must pass. Having the Stardog server running, execute the following commands:

* In the browser

    1. Load the test data using the provided script:

            $ ./load_test_data.sh

    2. Run the test cases

        * Stardog > `2.1.1`

                $ open test/index.html

        * Stardog <= `2.1.1`

                $ node test/testCORS.js
                $ open test/index.html

* In node.js

        $ npm test



## Version details ##

Stardog.js depends of the Stardog HTTP API, and any change in this API will be supported by Stardog.js. Here's a list of version compatibility between __Stardog__ and  __Stardog.js__:

| Stardog Version | Stardog.js Version |
| --------------- | ------------------ |
| <= 1.1.5        | <= 0.0.3           |
| 1.2 - 2.0.0     | 0.0.4, 0.0.5       |
| 2.0.0           | >= 0.1.0           |


## Quick Example ##

### node.js

```javascript
var stardog = require("stardog");

var conn = new stardog.Connection();

conn.setEndpoint("http://myserver:myport/");
conn.setCredentials("username", "password");

conn.query({
        database: "myDB",
        query: "select distinct ?s where { ?s ?p ?o }",  
        limit: 10,
        offset: 0
    },
    function (data) {
        console.log(data.results.bindings);
});
```

### Browser

__NOTE__: the Endpoint is a proxy to the Stardog HTTP interface in order to avoid CORS issues (an example can be fount in `test/testCORS.js`.

```html
<script src="js/stardog.js" type="text/javascript"></script>
…
<script type="text/javascript">
    var conn = new Stardog.Connection();
    conn.setEndpoint("/stardog");
    conn.setReasoning(true);
    conn.setCredentials("browser", "secret");
</script>
```

## NOTE ##

This framework is in continuous development, please check the [issues](https://github.com/complexible/stardog.js/issues) page. You're welcome to contribute.

&nbsp;
&nbsp;

<a href="http://complexible.com"><img src="http://complexible.com/img/l-b.png" width="120px"/></a>
