
Array.prototype.isArray = true;

exports.deserialize = function(options, callback) {

    var arrayNameSet = {};
    if (typeof(options) === "object") {
        arrayNameSet = createSet(options.arrayNames);
    } 

    var sax = require("sax");
    var parser = sax.parser(true); // strict parser.
    var stack  = [];
    stack.peek = function() {
        return this[this.length - 1];
    }


    parser.onerror = function(err) {
        throw err;
    }


    parser.onopentag = function(node) {
        var obj = createObject(node.name, arrayNameSet);
        for (var key in node.attributes) {
            obj[key] = convert(node.attributes[key]);
        }

        stack.push({
            root: node.name,
            data: obj
        });
    }


    parser.onclosetag = function() {
        var pair = stack.pop();
        if (stack.length > 0) {
            if (stack.peek().data.isArray) {
                // Already an array, just push the data.
                stack.peek().data.push(pair.data);
            } else if (typeof(stack.peek().data[pair.root]) !== "undefined") {
                // This is the second time we encouter a node at the same
                // root. It means that we are in an array.
                var data = stack.peek().data[pair.root];
                delete stack.peek().data[pair.root];
                stack.peek().data = [];
                stack.peek().data.push(data);
                stack.peek().data.push(pair.data);
            } else {
                stack.peek().data[pair.root] = convert(pair.data);
            }
        } else {
            callback(pair); // parsing ends here!
        }
    }


    parser.ontext = function(text) {
        if (text.trim() === "") {
            return;
        }
        if (typeof(stack.peek().data) === "object") {
            stack.peek().data = "";
        }
        stack.peek().data += text;
    }


    var cdata = "";
    parser.onopencdata = function() {
        cdata = "";
    }

    parser.oncdata = function(text) {
        cdata += text;
    }

    parser.onclosecdata = function() {
        parser.ontext(cdata);
    }

    
    var xmlstring = options;
    if (typeof(xmlstring) === "object") {
        xmlstring = options.xml;
    }
    parser.write(xmlstring).close();
    
}


function convert(value) {
    var res = value;
    if (typeof(value) === "string") {
        if (value.match(/^\d+(\.\d+)?$/)) {
            res = Number(value);
        } else if (value.match(/^(true|false)$/)) {
            res = value == "true";
        } else if (value.match(/\d{4}-[01]\d-[0-3]\d(T[0-2]\d:[0-5]\d(:[0-5]\d(\.\d+([+-][0-2]\d:[0-5]\d|Z)?)?)?)?/)) {
            if (value.length == 10) {
                res = new Date(value + "T00:00:00.000Z");
            } else {
                res = new Date(value);
            }
        }
    }
    return res;
}


function createSet(array) {
    var set = {};
    for (var i = 0; i < array.length; i++) {
        set[array[i]] = true;
    }
    return set;
}

function createObject(nodeName, arrayNameSet) {
    var obj = {};
    if (arrayNameSet[nodeName]) {
        obj = [];
    }
    return obj;    
}
