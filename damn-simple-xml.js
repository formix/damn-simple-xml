
Array.prototype.isArray = true;



module.exports = function(options) {
    this.options     = options;
    this.deserialize = deserialize;
    this.serialize   = serialize;
    this._serialize  = _serialize;
}


// *************************** Public methods *************************** \\

function deserialize(xml, callback) {

    var sax = require("sax");
    var parser = sax.parser(true); // strict parser.
    var stack = createStack();

    var arrays = {};
    if (this.options && this.options.arrays) {
        arrays = this.options.arrays;
    }


    parser.onerror = function(err) {
        throw callback(err);
        return;
    }

    parser.onopentag = function(node) {
        var obj = createObject(stack, node.name, arrays);
        for (var key in node.attributes) {
            obj[key] = convert(node.attributes[key]);
        }

        if ((stack.length > 0) && (typeof(stack.peek().data) === "string")) {
            var text = stack.peek().data;
            stack.peek().data = {
                _text: text
            };
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
            callback(null, pair); // parsing ends here!
        }
    }


    parser.ontext = function(text) {
        if (text.trim() === "") {
            return;
        }
        if (typeof(stack.peek().data) === "object") {
            if (isEmpty(stack.peek().data)) {
                stack.peek().data = text;
            } else {
                if (stack.peek().data._text === undefined) {
                    stack.peek().data._text = "";
                }
                stack.peek().data._text += text;
            }
        } else if (typeof(stack.peek().data) === "string") {
            stack.peek().data += text;
        }
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

    
    parser.write(xml).close();
    
}



function serialize(pair, callback) {
    try {
        var xml = this._serialize(pair.root, pair, callback); 
        callback(null, xml);
    } catch (err) {
        callback(err);
    }
}


function _serialize(nameStack, pair) {

    if (!pair) {
        throw new Error("The pair parameter is not set at " + nameStack);
    }

    if (!pair.root) {
        throw new Error("The pair.root value must be set to a non-empty " +
               "string at " + nameStack);
    }

    if (pair.root.indexOf(" ") > -1) {
        throw new Error("No space allowed in pair.root value at " + nameStack);
    }

    if ((pair.data === null) || (pair.data === undefined)) {
        // data is null, undefined or an empty string.
        return "<" + pair.root + " />";
    }

    var xml = "<" + pair.root; // Create the current element

    // Add attributes if any
    var attrset = {};
    if (this.options && this.options.attributes) {
        var attributes = this.options.attributes[nameStack];
        if (attributes !== undefined) {
            for (var i = 0; i < attributes.length; i++) {
                var name = attributes[i];
                var value = pair.data[name];
                attrset[name] = true;
                // Add an attribute only if the field is present and defined.
                if (value !== undefined) {
                    if (name.indexOf(" ") > -1) {
                        throw new Error("An attribute's name cannot " +
                                "contain spaces at " + nameStack + 
                                " attribute: " + name);
                    }
                    xml += " " + name;
                    if (value != null) {
                        if (typeof(value) !== "string") {
                            throw new Error("An attribute's value must " +
                                    "be a string at " + nameStack + 
                                    " attribute: " + name);
                        }
                        // Add the value only if non-null
                        xml += "=\"" + value + "\"";
                    }
                }
            }
        }
    }

    var datatype = typeof(pair.data);
    // create subxml data from sub elements.
    var subxml = null;
    if ((datatype === "string") || (datatype === "boolean") || 
            (datatype === "number")) {
        subxml = pair.data.toString();
    } else if (pair.data instanceof Date) {
        subxml = pair.data.toISOString();
    } else if (pair.data.isArray) {
        // When data is an array, add all array item to the subxml.
        var itemName = pair.root + "Item";
        if (this.options && this.options.arrays && this.options.arrays[nameStack]) {
            itemName = this.options.arrays[nameStack];
        }
        for (var i = 0; i < pair.data.length; i++) {
            if (subxml === null) {
                subxml = "";
            }
            var item = pair.data[i];
            try {
                subxml += this._serialize(nameStack + "." + itemName, {
                    root: itemName,
                    data: item
                });
            } catch (err) {
                var suberr = new Error("An error occured while serializing " +
                        "an array at index [" + i + "] at " + nameStack + 
                        ". See 'Error.innerError' for more details.");
                suberr.innerError = err;
                throw suberr;
            }
        }
    } else {
        // Otherwise, data is an object and we add-up the serialization 
        // result of all it child nodes.
        for (var elem in pair.data) {
            // skip attribues
            if (!attrset[elem]) {
                if (subxml === null) {
                    subxml = "";
                }
                if (elem === "_text") {
                    if (isNative(pair.data[elem])) {
                        subxml += pair.data[elem];
                    } else if (pair.data[elem] instanceof Date) {
                        subxml += pair.data[elem].toISOString();
                    } else {
                        subxml += JSON.stringify(pair.data[elem]);
                    }
                } else {
                    // Serialize the non-attribute element.
                    subxml += this._serialize(nameStack + "." + elem, {
                        root: elem,
                        data: pair.data[elem]
                    });
                }
            }
        }
    }


    if (subxml === null) {
        // No child nodes, close the opening tag as an empty tag.
        xml += " />";
    } else {
        // There is some child elements, close the opening element, add
        // the subxml and add the closing tag.
        xml += ">" + subxml + "</" + pair.root + ">";
    }

    return xml;
}


// *************************** Private methods *************************** \\


function isNative(value) {
    var datatype = typeof(value);
    if ((datatype === "string") || (datatype === "boolean") || 
            (datatype === "number")) {
        return true;
    }
    return false;
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


function createObject(stack, nodeName, arrayNameSet) {
    var obj = {};
    var fullName = createNodeName(stack, nodeName);
    if (arrayNameSet[fullName]) {
        obj = [];
    }
    return obj;    
}


function createNodeName(stack, nodeName) {
    var name = "";
    for (var i = 0; i < stack.length; i++) {
        name += stack[i].root + ".";
    }
    return name + nodeName;
}


function isEmpty(obj) {
    if (obj.isArray) {
        return obj.length === 0;
    }
    for (var key in obj) {
        return false;
    }
    return true;
}

function createStack() {
    var stack  = [];
    stack.peek = function() {
        if (this.length === 0) {
            throw new Error('Cannot peek an empty stack!');
        }
        return this[this.length - 1];
    }
    return stack;
}
