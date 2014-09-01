
var fs = require("fs");
var assert = require("assert");
var dsx = require ("../damn-simple-xml");


describe("DamnSimpleXml.deserialize()", function() {

    describe("simple.xml", function() {
        var expected = {
            id          : "jpg",
            firstName   : "Jean-Philippe",
            lastName    : "Gravel",
            email       : "jeanphilippe.gravel@gmail.com"
        }; 

        it("should be equal to the expected object", function(done) {
            fs.readFile("test/simple.xml", {encoding: "utf8"}, function(err, data) {
                if (err) return done(err);
                dsx.deserialize(data, function(pair) {
                    assert.deepEqual(pair.data, expected);
                    done();
                });
            });
        });
    });


    describe("attr-types.xml", function() {

        var expected = {
            numeric: 10
        }

   
        describe(".number", function() {
            it("should be a number equal to 10", function(done) {
                fs.readFile("test/attr-types.xml", { encoding: "utf8" }, function(err, data) {
                    if (err) done(err);
                    dsx.deserialize(data, function(pair) {
                        assert.strictEqual(pair.data.numeric, 10);
                        done();
                    });
                });
            });
        });

        describe(".boolTrue", function() {
            it("should be a boolean equal to true", function(done) {
                fs.readFile("test/attr-types.xml", { encoding: "utf8" }, function(err, data) {
                    if (err) done(err);
                    dsx.deserialize(data, function(pair) {
                        assert.strictEqual(pair.data.boolTrue, true);
                        done();
                    });
                });
            });
        });


        describe(".boolFalse", function() {
            it("should be a boolean equal to false", function(done) {
                fs.readFile("test/attr-types.xml", { encoding: "utf8" }, function(err, data) {
                    if (err) done(err);
                    dsx.deserialize(data, function(pair) {
                        assert.strictEqual(pair.data.boolFalse, false);
                        done();
                    });
                });
            });
        });


        describe(".date", function() {
            it("should be a date equal to 2014-08-31T13:00:00.000Z", function(done) {
                fs.readFile("test/attr-types.xml", { 
                    encoding: "utf8" 
                }, function(err, data) {
                    if (err) done(err);
                    dsx.deserialize(data, function(pair) {
                        var expected = new Date("2014-08-31T13:00:00.000Z");
                        assert.strictEqual(
                            pair.data.date.toISOString(), 
                            expected.toISOString());
                        done();
                    });
                });
            });
        });

    });

    

    describe("typed-nodes.xml", function() {
        var data = fs.readFileSync("test/typed-nodes.xml", { 
            encoding: "utf8" 
        });
        var expected = {
            string: "This is a string",
            number: 125.3,
            bool: false,
            date1: new Date("2014-08-31T00:00:00.000Z"),
            date2: new Date("2014-08-31T22:38"),
            date3: new Date("2014-08-31T22:38:45"),
            date4: new Date("2014-08-31T22:38:45.123Z")
        }
        it("should correspond to expected types", function(done) {
            dsx.deserialize(data, function(pair) {
                assert.deepEqual(pair.data, expected);
                done();
            });
        }); 
    });

});


