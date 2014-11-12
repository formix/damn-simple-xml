var assert = require("assert");
var Serializer = require("../damn-simple-xml");



describe("DamnSimpleXml.serialize()", function() {
   
    var dsx = new Serializer();

    describe("Empty and empty-like data", function() {

        it("should be '<undefined />'", function(done) {
            var xml = "";
            dsx.serialize({
                name: "undefined"
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<undefined />");
                    done();
                }
            });
        });

        it("should be '<null />'", function(done) {
            var xml = "";
            dsx.serialize({
                name: "null",
                data: null
            }, function(err, xmlpart, level) {
                if (err) throw err;
                xml += xmlpart;
                if (level === 0) {
                    assert.equal(xml, "<null />");
                    done();
                }
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

/*

    describe("An object containing a '_text' field", function() {
        it("should be <email>nobody@nowhere.com</email>", 
        function(done) {
            dsx.serialize({
                name: "email",
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
                name: "departments",
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

        it("should be a root containing one attributes", function(done) {
            var dsx2 = new Serializer({
                attributes: {
                    "email" : ["type"]
                }
            });

            dsx2.serialize({
                name: "email",
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


        it("should allow many attribute definitions in child node", function(done) {
            var dsx2 = new Serializer({
                attributes: {
                    "department.supervisor" : ["number", "birthDate"]
                }
            });
            
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
            }, function(err, xml) {
                assert.equal(xml, "<department>" +
                                    "<name>Sales and Marketting</name>" +
                                    "<supervisor number=\"122\" " +
                                            "birthDate=\"1972-02-16T00:00:00.000Z\">" +
                                        "<firstName>John</firstName>" +
                                        "<lastName>Doe</lastName>" +
                                    "</supervisor>" +
                                  "</department>");
                done();
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
            }, function(err, xml) {
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
            });
        });

    });

*/

});
