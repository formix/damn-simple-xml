
Array.prototype.isArray = true;



module.exports = function(behavior) {
    this.behavior    = createBehavior(behavior);
    this.deserialize = deserialize;
    this.serialize   = serialize;
    this._serialize  = _serialize;
}


// *************************** Public methods *************************** \\

function deserialize(xml, callback) {

    var sax = require("sax");
    var parser = sax.parser(true); // strict parser.
    var stack = createStack();

    var arrays = this.behavior.arrays;

    parser.onerror = function(err) {
        throw callback(err);
        return;
    }

    parser.onopentag = function(node) {
        var obj = createObject(stack, node.name, arrays);
        for (var key in node.attributes) {
            obj[key] = convert(node.attributes[key]);
        }

        // Check if the current node content found a node after having 
        // found some text in the current node.
        if ((stack.length > 0) && (typeof(stack.peek().data) === "string")) {
            // We have a "text" sibling to a <node>, we must change the 
            // data to an object with a _text element before going on.
            var text = stack.peek().data;
            stack.peek().data = {
                _text: text.trim()
            };
        } 

        stack.push({
            name: node.name,
            data: obj
        });
        
    }


    parser.onclosetag = function() {
        var root = stack.pop();
        if (stack.length > 0) {
            if (stack.peek().data.isArray) {
                // Already an array, just push the data.
                stack.peek().data.push(root.data);
            } else if (typeof(stack.peek().data[root.name]) !== "undefined") {
                // This is the second time we encouter a node at the same
                // root. It means that we are in an array.
                var data = stack.peek().data[root.name];
                delete stack.peek().data[root.name];
                stack.peek().data = [];
                stack.peek().data.push(data);
                stack.peek().data.push(root.data);
            } else {
                stack.peek().data[root.name] = convert(root.data);
            }
        } else {
            callback(null, root); // parsing ends here!
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
                if (stack.peek().data._text.length > 0) {
                    stack.peek().data._text += " ";
                }
                stack.peek().data._text += text.trim();
            }
        } else if (typeof(stack.peek().data) === "string") {
            stack.peek().data += text.trim();
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



function serialize(root, callback) {
    try {
        var xml = this._serialize(root.name, root, callback); 
        callback(null, xml);
    } catch (err) {
        callback(err);
    }
}


function _serialize(nameStack, root) {

    if (!root) {
        throw new Error("The root parameter is not set at " + nameStack);
    }

    if (!root.name) {
        throw new Error("The root.name value must be set to a non-empty " +
               "string at " + nameStack);
    }

    if (root.name.indexOf(" ") > -1) {
        throw new Error("No space allowed in root.name value at " + nameStack);
    }

    if ((root.data === null) || (root.data === undefined)) {
        // data is null, undefined or an empty string.
        return "<" + root.name + " />";
    }

    var xml = "<" + root.name; // Create the current element

    // Add attributes if any
    var attrset = {};
    var attributes = this.behavior.attributes[nameStack];
    if (attributes !== undefined) {
        for (var i = 0; i < attributes.length; i++) {
            var name = attributes[i];
            var value = root.data[name];
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
                    var attrValue = "";
                    if (value instanceof Date) {
                        attrValue = value.toISOString();
                    } else if (isNative(value)) {
                        attrValue = value.toString();
                    } else {
                        throw new Error("An attribute's value cannot " +
                                "be an object at " + nameStack + 
                                " attribute: " + name);
                    }
                    // Add the value only if non-null
                    xml += "=\"" + attrValue + "\"";
                }
            }
        }
    }

    var datatype = typeof(root.data);
    // create subxml data from sub elements.
    var subxml = null;
    if ((datatype === "string") || (datatype === "boolean") || 
            (datatype === "number")) {
        subxml = root.data.toString();
    } else if (root.data instanceof Date) {
        subxml = root.data.toISOString();
    } else if (root.data.isArray) {
        // When data is an array, add all array item to the subxml.
        var itemName = root.name + "Item";
        if (this.behavior.arrays[nameStack]) {
            itemName = this.behavior.arrays[nameStack];
        }
        for (var i = 0; i < root.data.length; i++) {
            if (subxml === null) {
                subxml = "";
            }
            var item = root.data[i];
            try {
                subxml += this._serialize(nameStack + "." + itemName, {
                    name: itemName,
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
        for (var elem in root.data) {
            // skip attribues
            if (!attrset[elem]) {
                if (subxml === null) {
                    subxml = "";
                }
                if (elem === "_text") {
                    if (isNative(root.data[elem])) {
                        subxml += root.data[elem];
                    } else if (root.data[elem] instanceof Date) {
                        subxml += root.data[elem].toISOString();
                    } else {
                        throw new Error("A _text field cannot contain an " +
                                "object or array.");
                    }
                } else {
                    // Serialize the non-attribute element.
                    subxml += this._serialize(nameStack + "." + elem, {
                        name: elem,
                        data: root.data[elem]
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
        xml += ">" + subxml + "</" + root.name + ">";
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
        name += stack[i].name + ".";
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

function createBehavior(behavior) {
    var opt = {
        arrays : {},
        attributes: {}
    };
    if (behavior !== undefined) {
        for (var key in behavior) {
            opt[key] = behavior[key];
        }
    }
    return opt;
}
