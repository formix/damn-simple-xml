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

    describe("Just a string as data", function() {
        
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

    });

});
