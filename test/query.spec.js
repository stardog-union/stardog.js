(function (root, factory) {
    "use strict";

    if (typeof exports === "object") {
        // NodeJS. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require("../js/stardog.js"), require("expect.js"));
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["stardog", "expect"], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog, root.expect);
    }
}(this, function (Stardog, expect) {
    "use strict";

    // -----------------------------------
    // Describes the query test methods
    // -----------------------------------

    describe ("Query a DB receiving a bind of results.", function() {
        var conn;

        this.timeout(50000);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
        });

        afterEach(function() {
            conn = null;
        });

        it ("A query result should not be empty", function(done) {
            conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.query({
                    database: "nodeDB",
                    query: "select distinct ?s where { ?s ?p ?o }",
                    limit: 20,
                    offset: 0
                }, function (data) {

                    expect(data).not.to.be(null);
                    expect(data.results).not.to.be(undefined);
                    expect(data.results.bindings).not.to.be(undefined);
                    expect(data.results.bindings.length).to.be.above(0);
                    expect(data.results.bindings.length).to.be(3);
                    done();
                });
            });
        });

        it ("A query result should not have more bindings than its intended limit", function(done) {
            conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.query({
                    database: "nodeDB",
                    query: "select * where { ?s ?p ?o }",
                    limit: 10,
                    offset: 0
                }, function (data) {
                    //console.log(data);

                    expect(data).not.to.be(null);
                    expect(data.results).not.to.be(undefined);
                    expect(data.results.bindings).not.to.be(undefined);
                    expect(data.results.bindings.length).to.be.above(0);
                    expect(data.results.bindings.length).to.be(10);
                    done();
                });
            });
        });

        it ("The baseURI option should be applied to the query", function(done) {
            conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.query({
                    database: "nodeDB",
                    query: "select * where { <Article1> ?p ?o }",
                    baseURI: "http://localhost/publications/articles/Journal1/1940/",
                    limit: 10,
                    offset: 0
                }, function (data) {
                    //console.log(data);

                    expect(data).not.to.be(null);
                    expect(data.results).not.to.be(undefined);
                    expect(data.results.bindings).not.to.be(undefined);
                    expect(data.results.bindings.length).to.be.above(0);
                    done();
                });
            });
        });

        it ("Very long queries should be OK", function(done) {
            conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.query({
                    database: "nodeDB",
                    query: "select * where { <http://localhost/publications/articles/Journal1/1940/Article1> ?p \"unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary burlily thanklessly swiveled polers oinked apnea maxillary burlily thanklessly swiveled polers oinked apnea maxillary\" }",
                    limit: 1,
                    offset: 0
                }, function (data) {
                    // console.log(data);

                    expect(data).not.to.be(null);
                    expect(data.results).not.to.be(undefined);
                    expect(data.results.bindings).not.to.be(undefined);
                    expect(data.results.bindings.length).to.be(0);
                    done();
                });
            });
        });
    });

    describe ("Query a DB with reasoning enabled, receiving a bind of results.", function() {
        var conn;

        this.timeout(50000);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
            conn.setReasoning(true);
        });

        afterEach(function() {
            conn = null;
        });

        it ("A query to Vehicles must have result count to 3", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(3);
                done();
            });
        });

        it ("A query to Car must have result count to 3", function(done) {
            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Car> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                // console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(3);
                done();
            });
        });

        it ("A query to SportsCar must have result count to 3", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/SportsCar> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(1);
                done();
            });
        });

        it ("A query to Vehicles must have result count to 3", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(3);
                done();
            });
        });

        it ("A query to Car must have result count to 3", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Car> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(3);
                done();
            });
        });

        it ("A query to SportsCar must have result count to 1", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/SportsCar> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(1);
                done();
            });
        });

        it ("A query to Vehicles must have result count to 3", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(3);
                done();
            });
        });

        it ("A query to Car must have result count to 3", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Car> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(3);
                done();
            });
        });

        it ("A query to SportsCar must have result count to 1", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/SportsCar> }",
                limit: 20,
                offset: 0
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(1);
                done();
            });
        });

    });

    describe ("Query a DB with reasoning enabled per query, receiving a bind of results.", function() {
        var conn;

        this.timeout(50000);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
        });

        afterEach(function() {
            conn = null;
        });

        it ("A query to Vehicles must have result count to 3", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }",
                limit: 20,
                offset: 0,
                reasoning: true
            },
            function (data) {
                // console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(3);
                done();
            });
        });

        it ("A query to Car must have result count to 3", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Car> }",
                limit: 20,
                offset: 0,
                reasoning: true
            },
            function (data) {
                //console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be.above(0);
                expect(data.results.bindings.length).to.be(3);
                done();
            });
        });

        it ("A query to Vehicle must have result count to 1 w/o reasoning", function(done) {

            conn.query({
                database: "nodeDBReasoning",
                query: "select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }",
                limit: 20,
                offset: 0,
                reasoning: false
            },
            function (data) {
                // console.log(data);

                expect(data).not.to.be(null);
                expect(data.results).not.to.be(undefined);
                expect(data.results.bindings).not.to.be(undefined);
                expect(data.results.bindings.length).to.be(0);
                done();
            });
        });

    });
}));
