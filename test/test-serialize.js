var assert = require("assert");
var Serializer = require("../damn-simple-xml");



describe("DamnSimpleXml.serialize()", function() {
   
    var dsx = new Serializer();

    describe("Empty and empty-like data", function() {

        it("should be '<undefined />'", function(done) {
            dsx.serialize({
                root: "undefined"
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, "<undefined />");
                done();
            });
        });

        it("should be '<null />'", function(done) {
            dsx.serialize({
                root: "null",
                data: null
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, "<null />");
                done();
            });
        });

        it("should be '<empty></empty>'", function(done) {
            dsx.serialize({
                root: "empty",
                data: ""
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, "<empty></empty>");
                done();
            });
        });

        it("should be '<boolean>false</boolean>'", function(done) {
            dsx.serialize({
                root: "boolean",
                data: false
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, "<boolean>false</boolean>");
                done();
            });
        });

        it("should be '<number>0</number>'", function(done) {
            dsx.serialize({
                root: "number",
                data: 0
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, "<number>0</number>");
                done();
            });
        });

    });

    describe("Simple data at the root node", function() {
        
        it("sould be '<hello>World!</hello>'", function(done) {
            dsx.serialize({
                root: "hello", 
                data: "World!"
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, "<hello>World!</hello>");
                done();
            });
        });


        it("should be <date>2011-11-11T11:11:11.111Z</date>", function(done) {
            dsx.serialize({
                root: "date",
                data: new Date("2011-11-11T11:11:11.111Z")
            }, function (err, xml) {
                if (err) throw err;
                assert.equal(xml, "<date>2011-11-11T11:11:11.111Z</date>");
                done();
            });
        });

    });


    describe("An object containing a '_text' field", function() {
        it("should be <email>nobody@nowhere.com</email>", 
        function(done) {
            dsx.serialize({
                root: "email",
                data: {
                    _text: "nobody@nowhere.com"
                }
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, "<email>nobody@nowhere.com</email>");
                done();
            });
        });
    });


    describe("Defining an array in options", function() {
        
        it("should be an array of department in the departments node", 
        function(done) {
            
            var dsx2 = new Serializer({
                arrays: {
                    "departments": "department"
                }
            });

            dsx2.serialize({
                root: "departments",
                data: [
                    {
                        name: "Sales"
                    },
                    {
                        name: "Shipping"
                    }
                ]
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, 
                    "<departments>" +
                    "<department><name>Sales</name></department>" +
                    "<department><name>Shipping</name></department>" +
                    "</departments>");
                done();
            });

        });


        it("should be an array of dep, in the deps node under the org node", 
        function(done) {
            
            var dsx2 = new Serializer({
                arrays: {
                    "organisation.departments": "department"
                }
            });

            dsx2.serialize({
                root: "organisation",
                data: {
                    title: "OrgCorp",
                    departments: [
                        {
                            name: "Sales"
                        },
                        {
                            name: "Shipping"
                        }
                    ]
                }
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, 
                    "<organisation>" +
                        "<title>OrgCorp</title>" +
                        "<departments>" +
                          "<department><name>Sales</name></department>" +
                          "<department><name>Shipping</name></department>" +
                        "</departments>" +
                    "</organisation>");
                done();
            });

        });

    });


    describe("Defining attributes in options", function() {

        var dsx2 = new Serializer({
            attributes: {
                "email" : ["type"]
            }
        });

        it("should be a root containing one attributes", function(done) {
            dsx2.serialize({
                root: "email",
                data: {
                    type: "personnal",
                    _text: "nobody@nowhere.com"
                }
            }, function(err, xml) {
                if (err) throw err;
                assert.equal(xml, '<email type="personnal">nobody@nowhere.com</email>');
                done();
            });
        });

    });



});
