damn-simple-xml
===============

![travis-ci build result](https://api.travis-ci.org/formix/damn-simple-xml.svg?branch=master "damn-simple-xml master")

Damn Simple XML (DSX) is an XML serialization library meant to ease 
programmer's life in NodeJS.

[Google Group](https://groups.google.com/forum/?hl=fr#!forum/damn-simple-xml)

## Documentation and Release Notes

Consult the full [API Reference](https://github.com/formix/damn-simple-xml/wiki/Api-Reference) for detailed documentation.


Consult The [Release Notes](https://github.com/formix/damn-simple-xml/wiki/Release-Notes) here.

## Usage

### Serialization

By default, all fields of an object will be serialized as a XML element. You
can control serialization by providing a `behavior` object telling Damn 
Simple Xml how to serialize attributes texts, arrays and arrays' items fields:

```javascript
var Serializer = require("damn-simple-xml");
var serializer = new Serializer({
  arrays: {
    "employees" : "employee"
  },
  attributes: {
    "employees.employee": ["id", "department"]
  },
  texts: {
    "employees.employee": "fullname"
  }
});

var employees = [
  { 
    id: 123,
    department: "Marketting",
    fullname: "John Doe"
  },
  { 
    id: 456,
    department: "Administration",
    fullname: "Jane Dowell"
  }
];

var xml = "";
serializer.serialize({
  name: "employees", 
  data: employees
}, function(err, xmlpart, level) {
  if (err) {
    console.log(err);
    return;
  }
  xml += xmlpart;
  if (level === 0) {  // 0 means seialization is done
    console.log(xml);
  }
});
```

The previous code will result in a one line unformatted xml corresponding to:

```xml
<employees>
  <employee id="123" department="Marketting">John Doe</employee>
  <employee id="456" department="Administration">Jane Dowell</employee>
</employees>
```

### Deserialization

When unspecified, free text beside other XML elements is added to the "_text"
field by default.

Given the following XML:
```xml
<employee>
  This employee is terrible!
  <firstName>John</firstName>
  <lastName>Doe</lastName>
  <emails>
    <email type="personal">john.doe@nobody.com</email>
  <emails>
</employee>
```

```javascript
var Serializer = require("damn-simple-xml");
var serializer = new Serializer({
  arrays: {
    "employee.emails": "email"
  },
  texts: {
    "employee.emails.email": "value"
  }
)};

serializer.deserialize(xml, function(err, root) {
  console.log(root);
});
```

Will display the following Javascritp object:

```javascript
{
  name: "employee",
  data: {
    _text: "This employee is terrible!",
    firstName: "John",
    lastName: "Doe",
    emails: [
      {
        type: "personal",
        value: "john.doe@nobody.com"
      }
    ]
  }
}
```

License
=======

MIT License

Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
