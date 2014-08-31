
Array.prototype.isArray = true;

exports.deserialize = function(xmlstring, callback) {

    var sax = require("sax");
    var parser = sax.parser(true); // strict parser.
    var stack  = [];
    stack.peek = function() {
        return this[this.length - 1];
    }

    parser.onerror = function(err) {
        throw err;
    };

    parser.onopentag = function(node) {
        stack.push({
            root: node.name,
            data: node.attributes
        });
    };

    parser.onclosetag = function() {
        var pair = stack.pop();
        if (stack.length > 0) {
            if (stack.peek().data.isArray) {
                // Already an array, just push the data.
                stack.peek().data.push(pair.data);
            } else if (typeof(stack.peek().data[pair.root]) === "object") {
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
    };

    parser.ontext = function(text) {
        if (text.trim() === "") {
            return;
        }
        if (typeof(stack.peek().data) === "object") {
            stack.peek().data = "";
        }
        stack.peek().data += text;
    };

    parser.write(xmlstring).close();
    
}


function convert(value) {
    var res = value;
    if (typeof(value) === "string") {
        if (value.match(/^\d+(\.\d+)?$/)) {
            res = Number(value);
        } else if (value.match(/^(true|false)$/)) {
            res = value == "true";
        }
    }
    return res;
}
