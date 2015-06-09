
var fs = require("fs");
var assert = require("assert");
var Serializer = require("../lib/index").Serializer;
var EOL = require('os').EOL;

describe("DamnSimpleXml.deserialize()", function() {


    describe("simple.xml", function() {
        var expected = {
            id          : "jpg",
            firstName   : "Jean-Philippe",
            lastName    : "Gravel",
            email       : "jeanphilippe.gravel@gmail.com"
        };
        
        var dsx = new Serializer(); 

        it("should be equal to the expected object", function(done) {
            fs.readFile("test/simple.xml", {encoding: "utf8"}, 
            function(err, data) {
                if (err) return done(err);
                dsx.deserialize(data, function(err, root) {
                    assert.ifError(err);
                    assert.deepEqual(root.data, expected);
                    done();
                });
            });
        });

        it("should deserialize using a stream.Readable object", function(done) {
            var xmlstream = fs.createReadStream("test/simple.xml", {
                encoding: "utf8"
            });
            
            dsx.deserialize(xmlstream, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root.data, expected);
                done();
            });
        });
        
    });


    describe("attr-types.xml", function() {

        var expected = {
            numeric: 10
        }

        var dsx = new Serializer(); 
   
        it("'.number' should be a number equal to 10", function(done) {
            fs.readFile("test/attr-types.xml", { encoding: "utf8" }, 
            function(err, data) {
                if (err) done(err);
                dsx.deserialize(data, function(err, root) {
                    assert.ifError(err);
                    assert.strictEqual(root.data.numeric, 10);
                    done();
                });
            });
        });

        it("'.boolTrue' should be a boolean equal to true", function(done) {
            fs.readFile("test/attr-types.xml", { encoding: "utf8" }, 
            function(err, data) {
                if (err) done(err);
                dsx.deserialize(data, function(err, root) {
                    assert.ifError(err);
                    assert.strictEqual(root.data.boolTrue, true);
                    done();
                });
            });
        });

        it("'.boolFalse' should be a boolean equal to false", function(done) {
            fs.readFile("test/attr-types.xml", { encoding: "utf8" }, 
            function(err, data) {
                assert.ifError(err);
                dsx.deserialize(data, function(err, root) {
                    assert.ifError(err);
                    assert.strictEqual(root.data.boolFalse, false);
                    done();
                });
            });
        });


        it("'.date' should be a date equal to 2014-08-31T13:00:00.000Z", 
        function(done) {
            fs.readFile("test/attr-types.xml", { 
                encoding: "utf8" 
            }, function(err, data) {
                assert.ifError(err);
                dsx.deserialize(data, function(err, root) {
                    assert.ifError(err);
                    var expected = new Date("2014-08-31T13:00:00.000Z");
                    assert.strictEqual(
                        root.data.date.toISOString(), 
                        expected.toISOString());
                    done();
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

        var dsx = new Serializer(); 

        it("should correspond to expected types", function(done) {
            dsx.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root.data, expected);
                done();
            });
        }); 
    });


    describe("array.xml", function() {
        var data = fs.readFileSync("test/array.xml", {
            encoding: "utf8"
        });
        
        var dsx = new Serializer(); 

        it("should be an array containing two items", function(done) {
            dsx.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.equal(root.data.length, 2);
                done();
            });
        });

        it("should contains an employee with only one language as an " +
                "object.", function(done) {
            dsx.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.ok(root.data[0].languages["language"]);
                done();
            });
        });

        it("should contains an employee with only one language as an " +
                "array", function(done) {
            var dsx = new Serializer({
                arrays: {
                    "employees": "employee",
                    "employees.employee.languages": "language"
                }
            });
            dsx.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.ok(root.data[0].languages.length == 1);
                done();
            });
        });

        it("should contains an employee with many languages as an " +
                "array.", function(done) {
            dsx.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.ok(root.data[1].languages.length > 0);
                done();
            });
        });

    });


    describe("cdata.xml", function() {

        var data = fs.readFileSync("test/cdata.xml", {
            encoding: "utf8"
        });

        var dsx = new Serializer(); 

        it("should contain a string with invalid xml " +
                "characters", function(done) {
            dsx.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.equal(root.data, 
                        "This is an <unparsed /> cdata block.");
                done();
            });
        });

    });


    describe("mixed-attribute-text.xml", function() {
        var expected = {
            "name": "employee",
            "data": {
                "name": "John Doe",
                "emails": [{
                    "type": "home",
                    "_text": "jdoe@home.com"
                },
                {
                    "type": "work",
                    "_text": "john.doe@work.com"
                }]
            },
            "options": {
                "arrays": {
                    "employee.emails": "email"
                },
                "attributes": {
                    "employee.emails.email": ["type"]
                },
                "texts": {
                    "employee.emails.email": "_text"
                },
                "cdatas": {}
            }
        }

        var dsx = new Serializer(); 

        it("should correspond to the expected object", function(done) {
            var data = fs.readFileSync("test/mixed-attribute-text.xml", {
                encoding: "utf8"
            });
            dsx.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root, expected);
                done();
            });
        });
        
    });


    describe("mixed-element-text.xml", function() {

        var expected = { 
            nodeTextNode: { 
                node1: "node 1 value",
                _text: "text",
                node2: "node 2 value"
            },
            textNodeText: { 
                _text: "text1 text2",
                node: "node value" 
             } 
        };

        var dsx = new Serializer(); 

        it("should contains nodeTextNode and textNodeText elements", 
        function(done) {
            var data = fs.readFileSync("test/mixed-element-text.xml" , {
                encoding: "utf8"
            });

            dsx.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root.data, expected);
                done();
                
            });
           
        }); 


        it("should deserialize according to meta.texts.", 
        function(done) {

            var expected2 = { 
                nodeTextNode: { 
                    node1: "node 1 value",
                    myText: "text",
                    node2: "node 2 value"
                },
                textNodeText: { 
                    myText2: "text1 text2",
                    node: "node value" 
                 } 
            };

            var data = fs.readFileSync("test/mixed-element-text.xml" , {
                encoding: "utf8"
            });

            var dsx2 = new Serializer({
                texts: {
                    "mixed.nodeTextNode": "myText",
                    "mixed.textNodeText": "myText2"
                }
            });


            dsx2.deserialize(data, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root.data, expected2);
                done();
            });

        });

    });


    describe("Building options objects", function() {

        it("should define attributes properly", function(done){

            var xml = "<emails><email type='home' source='A' /></emails>";

            var expectedOptions = {
                arrays: {},
                attributes: {
                    "emails.email": ["type", "source"]
                },
                texts: {},
                cdatas: {}
            }

            var dsx = new Serializer();
            dsx.deserialize(xml, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root.options, expectedOptions);
                done();
            });

        });


        it("should define arrays properly", function(done) {

            var xml = "<emails><email><value>q@w.e</value></email>" +
                "<email><value>a@s.d</value></email></emails>";

            var expectedOptions = {
                arrays: {
                    "emails": "email"
                },
                attributes: {},
                texts: {},
                cdatas: {}
            }

            var dsx = new Serializer();
            dsx.deserialize(xml, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root.options, expectedOptions);
                done();
            });

        });


        it("should define texts properly", function(done) {

            var xml = "<emails><email type='home'>q@w.e</email></emails>";

            var expectedOptions = {
                arrays: {},
                attributes: {
                    "emails.email": ["type"]
                },
                texts: {
                    "emails.email": "_text"
                },
                cdatas: {}
            }

            var dsx = new Serializer();
            dsx.deserialize(xml, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root.options, expectedOptions);
                done();
            });

        });


        it("should create cdatas elements properly", function(done) {

            var xml = "<emails><email><![CDATA[<hello!>]]></email></emails>";

            var expectedOptions = {
                arrays: {},
                attributes: {},
                texts: {},
                cdatas: {
                    "emails": ["email"]
                }
            }

            var dsx = new Serializer();
            dsx.deserialize(xml, function(err, root) {
                assert.ifError(err);
                assert.deepEqual(root.options, expectedOptions);
                done();
            });

        });

    });

});


