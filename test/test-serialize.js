var assert = require("assert");
var Serializer = require("../lib/index").Serializer;



describe("DamnSimpleXml.serialize()", function() {
   
    describe("Empty and empty-like (falsy) data", function() {

        it("should be '<undefined />'", function(done) {
            
            var dsx = new Serializer();

            var xml = "";
            dsx.on("xmlchunk", function(chunk) {
                xml += chunk;
            });

            dsx.serialize({
                name: "undefined"
            }, function(err) {
                asert.ifError(err);
                done();
            });
        });

        it("should be '<null />'", function(done) {
           
            var dsx = new Serializer();
           
            var xml = "";
            dsx.on("xmlchunk", function(chunk) {
                xml += chunk;
            });
            
            dsx.serialize({
                name: "null",
                data: null
            }, function(err) {
                assert.ifError(err);
                assert.equal(xml, "<null />");
                done();
            });
        });

        it("should be '<empty></empty>'", function(done) {
            var xml = "";
            dsx.serialize({
                name: "empty",
                data: ""
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<empty></empty>");
                    done();
                }
            });
        });

        it("should be '<boolean>false</boolean>'", function(done) {
            var xml = "";
            dsx.serialize({
                name: "boolean",
                data: false
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<boolean>false</boolean>");
                    done();
                }
            });
        });

        it("should be '<number>0</number>'", function(done) {
            var xml = "";
            dsx.serialize({
                name: "number",
                data: 0
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<number>0</number>");
                    done();
                }
            });
        });

    });

    describe("Simple data at the root node", function() {
        
        it("sould be '<hello>World!</hello>'", function(done) {
            var xml = "";
            dsx.serialize({
                name: "hello", 
                data: "World!"
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<hello>World!</hello>");
                    done();
                }
            });
        });


        it("should be <date>2011-11-11T11:11:11.111Z</date>", function(done) {
            var xml = "";
            dsx.serialize({
                name: "date",
                data: new Date("2011-11-11T11:11:11.111Z")
            }, function (err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<date>2011-11-11T11:11:11.111Z</date>");
                    done();
                }
            });
        });


    });



    describe("An object containing a '_text' field", function() {

        it("should be <email>nobody@nowhere.com</email>", 
        function(done) {
            var xml = "";
            dsx.serialize({
                name: "email",
                data: {
                    _text: "nobody@nowhere.com"
                }
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<email>nobody@nowhere.com</email>");
                    done();
                }
            });
        });

        it("should be <email>nobody@nowhere.com</email> with a declared text field", 
        function(done) {
            var dsx2 = new Serializer({
                texts: {
                    "email": "value"
                }
            });
            var xml = "";
            dsx2.serialize({
                name: "email",
                data: {
                    value: "nobody@nowhere.com"
                }
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<email>nobody@nowhere.com</email>");
                    done();
                }
            });
        });

    });


    describe("Defining an array in behaviors", function() {
        
        it("should be an array of department in the departments node", 
        function(done) {
            var xml = "";
            
            var dsx2 = new Serializer({
                arrays: {
                    "departments": "department"
                }
            });

            dsx2.serialize({
                name: "departments",
                data: [
                    {
                        name: "Sales"
                    },
                    {
                        name: "Shipping"
                    }
                ]
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, 
                        "<departments>" +
                        "<department><name>Sales</name></department>" +
                        "<department><name>Shipping</name></department>" +
                        "</departments>");
                    done();
                }
            });

        });


        it("should be an array of dep, in the deps node under the org node", 
        function(done) {

            var xml = "";            

            var dsx2 = new Serializer({
                arrays: {
                    "organisation.departments": "department"
                }
            });

            dsx2.serialize({
                name: "organisation",
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
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level == 0) {
                    assert.equal(xml, 
                        "<organisation>" +
                            "<title>OrgCorp</title>" +
                            "<departments>" +
                              "<department><name>Sales</name></department>" +
                              "<department><name>Shipping</name></department>" +
                            "</departments>" +
                        "</organisation>");
                    done();
                }
            });

        });

    });


    describe("Defining attributes in behaviors", function() {

        it("should be a root containing one attributes", function(done) {
            var dsx2 = new Serializer({
                attributes: {
                    "email" : ["type"]
                }
            });

            var xml = "";
            dsx2.serialize({
                name: "email",
                data: {
                    type: "personnal",
                    _text: "nobody@nowhere.com"
                }
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, '<email type="personnal">nobody@nowhere.com</email>');
                    done();
                }
            });
        });


        it("should allow many attribute definitions in child node", function(done) {
            var dsx2 = new Serializer({
                attributes: {
                    "department.supervisor" : ["number", "birthDate"]
                }
            });
  
            var xml = "";          
            dsx2.serialize({
                name: "department",
                data: {
                    name: "Sales and Marketting",
                    supervisor: {
                        number: "122",
                        birthDate: new Date("1972-02-16"),
                        firstName: "John",
                        lastName: "Doe"
                    }
                }
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<department>" +
                                        "<name>Sales and Marketting</name>" +
                                        "<supervisor number=\"122\" " +
                                                "birthDate=\"1972-02-16T00:00:00.000Z\">" +
                                            "<firstName>John</firstName>" +
                                            "<lastName>Doe</lastName>" +
                                        "</supervisor>" +
                                      "</department>");
                    done();
                }
            });
        });


        it("should be working even within an array", function(done) {
            var dsx2 = new Serializer({
                attributes: {
                    "department.employees.employee" : ["number"]
                },
                arrays: {
                    "department.employees": "employee"
                }
            });

            var xml = "";            
            dsx2.serialize({
                name: "department",
                data: {
                    name: "Sales and Marketting",
                    employees: [
                        {
                            number: 122,
                            firstName: "John",
                            lastName: "Doe"
                        }
                    ]
                }
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<department>" +
                                        "<name>Sales and Marketting</name>" +
                                        "<employees>" +
                                            "<employee number=\"122\">" +
                                                "<firstName>John</firstName>" +
                                                "<lastName>Doe</lastName>" +
                                            "</employee>" +
                                        "</employees>" +
                                      "</department>");
                    done();
                }
            });
        });


        it("should be <email type=\"personal\" />", 
        function(done) {

            var dsx2 = new Serializer({
                attributes: {
                    "email": ["type"]
                }
            });

            var xml = "";
            dsx2.serialize({
                name: "email",
                data: {
                    type: "personal"
                }
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<email type=\"personal\" />");
                    done();
                }
            });
        });

    });


    describe("Defining cdatas in behaviors",function() {

        it("should create a CDATA wrapper", function(done) {

            var dsx2 = new Serializer({
                cdatas: {
                    "test": "invalidxml"
                }
            });

            var xml = "";
            dsx2.serialize({
                name: "test",
                data: {
                    invalidxml: "> this is invalid xml <"
                }
            }, function(err, xmlpart, level) {
                assert.ifError(err);
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<test><invalidxml><![CDATA[> this is invalid xml <]]></invalidxml></test>");
                    done();
                }
            });

        });

    });


    describe("Using the meta object during serialization", function() {

        it("should take care of the meta object supplied", function(done) {

            var testObj = {
                owners: ["John", "Jane"]                
            };

            var dsx2 = new Serializer();
            var expected = "<list><owners><owner>John</owner><owner>Jane</owner></owners></list>";

            dsx2.serialize({
                name: "list",
                data: testObj,
                meta: {
                    arrays: {
                        "list.owners": "owner"
                    }
                }
            }, 
            function(err, xml, level) {
                assert.ifError(err);
                assert.equal(xml, expected);
                done();
            });

        });

    });


});
