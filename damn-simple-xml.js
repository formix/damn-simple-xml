
Array.prototype.isArray = true;
var async = require("async");



module.exports = function(behavior) {
    this.behavior    = createBehavior(behavior);
    this.deserialize = deserialize;
    this.serialize   = serialize;
}


// *************************** Public methods *************************** \\

function deserialize(xml, callback) {

    var self = this;
    process.nextTick(function() {

        var sax = require("sax");
        var parser = {};
        var saxstream = null
        if (typeof(xml) === "string") {
            parser = sax.parser(true); // strict parser.
        } else if (typeof(xml.read) === "function") {
            // We assume that we are a readstream.
             saxstream = sax.createStream(true);
        } else {
            callback(new Error("The expected xml parameter must be either a " +
                        "string or a stream.Readable"));
        }
        

        var stack = createStack();
        var arrays = self.behavior.arrays;
        var texts = self.behavior.texts;


        parser.onerror = function(err) {
            callback(err);
            return;
        }

        if (saxstream !== null) {
            saxstream.on("error", parser.onerror);
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

        if (saxstream !== null) {
            saxstream.on("opentag", parser.onopentag);
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
                process.nextTick(function() {
                    callback(null, root); // parsing ends here!
                });
            }
        }

        if (saxstream !== null) {
            saxstream.on("closetag", parser.onclosetag);
        }


        parser.ontext = function(text) {
            if (text.trim() === "") {
                return;
            }
            var fieldPath = createNodeName(stack);
            var textName = texts[fieldPath];
            if (textName === undefined) {
                textName = "_text";
            } else if (stack.peek().data[textName] === undefined) {
                stack.peek().data[textName] = "";
            }
            if (typeof(stack.peek().data) === "object") {
                if (isEmpty(stack.peek().data)) {
                    stack.peek().data = text;
                } else {
                    // if the textname == "_text" it will be undefined here.
                    if (stack.peek().data[textName] === undefined) {
                        stack.peek().data[textName] = "";
                    }
                    if (stack.peek().data[textName].length > 0) {
                        stack.peek().data[textName] += " ";
                    }
                    stack.peek().data[textName] += text.trim();
                }
            } else if (typeof(stack.peek().data) === "string") {
                stack.peek().data += text.trim();
            }
        }

        if (saxstream !== null) {
            saxstream.on("text", parser.ontext);
        }


        var cdata = "";
        parser.onopencdata = function() {
            cdata = "";
        }

        if (saxstream !== null) {
            saxstream.on("opencdata", parser.onopencdata);
        }
        

        parser.oncdata = function(text) {
            cdata += text;
        }

        if (saxstream !== null) {
            saxstream.on("cdata", parser.oncdata);
        }


        parser.onclosecdata = function() {
            parser.ontext(cdata);
        }

        if (saxstream !== null) {
            saxstream.on("closecdata", parser.onclosecdata);
        }

        
        if (typeof(xml) === "string") {
            parser.write(xml).close();
        } else {
            xml.pipe(saxstream);
        }

    });
}


function serialize(root, callback) {
    var localBehavior = this.behavior;
    process.nextTick(function() {
        var buffer = { data: "" };
        _serialize(root, localBehavior, root.name, 1, buffer, callback); 
    });
}


function _serialize(root, behavior, fieldPath, level, buffer, callback) {

    // Checks if the root parameter is valid
    if(!rootIsValid(root, callback)) {
        return;
    }

    // If there is no data associated with the current element, dump a
    // simple autoclosing tag and exits the function. 
    if ((root.data === null) || (root.data === undefined)) {
        bufferize(buffer, "<" + root.name + " />", level - 1, callback);
        return;
    }

    var attrset = null;
    async.series([function(done) {
        // Creates the opening tag
        bufferize(buffer, "<" + root.name, level, callback);
        attrset = addAttributes(root, behavior, fieldPath, level, buffer, callback);
        var tagtype = closeOpeningTag(root, behavior, fieldPath, level, buffer, callback);
        if (tagtype !== "autoclose") {
            // done callback is called only if the tag is not auto-closing.
            // We do not want the two other functions to be executed if the
            // tag is auto-closed.
            done();
        }
    }, function(done) {
        // creates the inner xml data.
        createTagContent(root, behavior, fieldPath, level, attrset, buffer, callback);
        done();
    }, function(done) {
        // Terminate the current tag.
        bufferize(buffer, "</" + root.name + ">", level - 1, callback);
        done();
    }]);
}


function bufferize(buffer, chunk, level, callback) {
    buffer.data += chunk;
    if (buffer.data.length >= 65536 || level === 0) {
        callback(null, buffer.data, level);
        buffer.data = "";
    }
}


function rootIsValid(root, callback) {
    if (!root) {
        callback(new Error("The root parameter is not set at " + fieldPath));
        return false;
    }
    if (!root.name) {
        callback(new Error("The root.name value must be set to a non-empty " +
               "string at " + fieldPath));
        return false;
    }
    if (root.name.indexOf(" ") > -1) {
        callback(new Error("No space allowed in root.name value at " + fieldPath));
        return false;
    }
    return true;
}


// Add attributes if any
// returns an attribute set.
function addAttributes(root, behavior, fieldPath, level, buffer, callback) {

    var attrset = {};
    var attributes = behavior.attributes[fieldPath];
    
    if (attributes === undefined) {
        attributes = [];
    }

    for (var i = 0; i < attributes.length; i++) {
        var name = attributes[i];
        var value = root.data[name];
        attrset[name] = true;
        // Add an attribute only if the field is present and defined.
        if (value !== undefined) {
            if (name.indexOf(" ") > -1) {
                callback(new Error("An attribute's name cannot " +
                        "contain spaces at " + fieldPath + 
                        " attribute: " + name));
                return;
            }
            bufferize(buffer, " " + name, level, callback);
            if (value != null) {
                var attrValue = "";
                if (value instanceof Date) {
                    attrValue = value.toISOString();
                } else if (isNative(value)) {
                    attrValue = value.toString();
                } else {
                    callback(new Error("An attribute's value cannot " +
                            "be an object at " + fieldPath + 
                            " attribute: " + name));
                    return;
                }
                // Add the value only if non-null
                bufferize(buffer, "=\"" + attrValue + "\"", level, callback);
            }
        }
    }

    return attrset;
}


function closeOpeningTag(root, behavior, fieldPath, level, buffer, callback) {
    // Check if the openig tag is autoclosing or not.
    var attributes = behavior.attributes[fieldPath];
    if (attributes === undefined) {
        attributes = [];
    }
    var textName = behavior.texts[fieldPath];
    if (textName === undefined) {
        textName = "_text";
    }
    if ((root.data === null) || (root.data === undefined)) {
        bufferize(buffer, " />", level - 1, callback);
        return "autoclose";
    } else if (isNative(root.data) || (root.data instanceof Date) || 
            (root.data[textName] !== undefined)) {
        bufferize(buffer, ">", level, callback);
    } else {
        var fieldCount = countFields(root.data);
        if (attributes.length < fieldCount) {
            bufferize(buffer, ">", level, callback);
        } else {
            bufferize(buffer, " />", level - 1, callback);
            return "autoclose";
        }
    }
    return "opening";
}


function isContained(map, fieldPath, elemName) {
    var home = fieldPath.substr(0, fieldPath.length - elemName.length - 1);
    if (map[home]) {
        return map[home].indexOf(elemName) > -1;
    }
    return false;
}


function createTagContent(root, behavior, fieldPath, level, attrset, buffer, callback) {
    // create subxml data from sub elements.
    var datatype = typeof(root.data);
    if ((datatype === "string") || (datatype === "boolean") || 
            (datatype === "number")) {
        var iscdata = isContained(behavior.cdatas, fieldPath, root.name);
        if (behavior.cdatas[fieldPath]) {
            iscdata = behavior.cdatas[fieldPath].indexOf(root.name) > -1;
        }
        if (iscdata) {
            bufferize(buffer, "<![CDATA[", level, callback);
        }
        bufferize(buffer, root.data.toString(), level, callback);
        if (iscdata) {
            bufferize(buffer, "]]>", level, callback);
        }
    } else if (root.data instanceof Date) {
        bufferize(buffer, root.data.toISOString(), level, callback);
    } else if (root.data.isArray) {
        // When data is an array, add all array item to the subxml.
        var itemName = root.name + "Item";
        if (behavior.arrays[fieldPath]) {
            itemName = behavior.arrays[fieldPath];
        } else if (behavior.arrays["*." + root.name]) {
            itemName = behavior.arrays["*." + root.name];
        }
        for (var i = 0; i < root.data.length; i++) {
            var item = root.data[i];
            _serialize(
                    {
                        name: itemName,
                        data: item
                    },
                    behavior, 
                    fieldPath + "." + itemName, 
                    level + 1, 
                    buffer,
                    callback);
        }
    } else {
        // Otherwise, data is an object and we add-up the serialization 
        // result of all it child nodes.
        var textName = behavior.texts[fieldPath];
        if (textName === undefined) {
            textName = "_text";
        }
        for (var elem in root.data) {
            // skip attribues
            if (!attrset[elem]) {
                if (elem === textName) {
                    if (isNative(root.data[elem])) {
                        bufferize(buffer, root.data[elem], level, callback);
                    } else if (root.data[elem] instanceof Date) {
                        bufferize(buffer, root.data[elem].toISOString(), level, callback);
                    } else {
                        callback(new Error("A _text field cannot contain an " +
                                "object or array."));
                        return;
                    }
                } else {
                    // Serialize the non-attribute element.
                    _serialize(
                            {
                                name: elem,
                                data: root.data[elem]
                            },
                            behavior, 
                            fieldPath + "." + elem, 
                            level + 1,
                            buffer,
                            callback);
                }
            }
        }
    }
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


function createObject(stack, nodeName, arrays) {
    var obj = {};
    var fullName = createNodeName(stack, nodeName);
    if (arrays[fullName] || arrays["*." + nodeName]) {
        obj = [];
    }
    return obj;    
}


// This function is super slow and should be replaced by a
// string stack on the parser, or something.
function createNodeName(stack, nodeName) {
    var name = "";
    for (var i = 0; i < stack.length; i++) {
        name += stack[i].name + ".";
    }
    if (nodeName !== undefined) {
        return name + nodeName;
    } else {
        return name.substr(0, name.length - 1);
    }

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
        attributes: {},
        texts: {},
        cdatas: {}
    };
    if (behavior !== undefined) {
        for (var key in behavior) {
            opt[key] = behavior[key];
        }
    }
    return opt;
}


function countFields(obj) {
    var count = 0;
    for (var field in obj) {
        count++;
    }
    return count;
}


function mergeArrays(a1, a2) {
    var target = [];
    for (var i = 0; i < a1.length; i++) {
        target.push(a1[i]);
    }
    for (var j = 0; j < a2.length; j++) {
        target.push(a2[j]);
    }
    return target;
}
