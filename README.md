damn-simple-xml
===============

<a href="https://travis-ci.org/formix/damn-simple-xml">
<img src="https://travis-ci.org/formix/damn-simple-xml.svg?branch=master" 
     alt="Travis-CI">
</a>

Damn Simple XML (DSX) is an XML serialization library meant to ease 
programmer's life in NodeJS.

## Documentation

Consult the full [API Reference](https://github.com/formix/damn-simple-xml/wiki/Api-Reference) for detailed documentation.

## Usage

### Serialization

```javascript
var Serializer = require("damn-simple-xml");
var serializer = new Serializer({
  arrays: {
    "employees" : "employee"
  },
  attributes: {
    "employees.employee": ["id", "department"]
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
    fullname: "Jane Doe"
  }
];

serializer.serialize({
  name: "employees", 
  data: employees
}, function(err, xml) {
  console.log(xml);
});
```

The previous code will result in a one line unformatted xml corresponding to:

```xml
<employees>
  <employee id="123" department="Marketting">
    <fullname>John Doe</fullname>
  </employee>
  <employee id="456" department="Administration">
    <fullname>Jane Doe</fullname>
  </employee>
</employees>
```

### Deserialization

Given the following XML:
```xml
<employee>
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
    firstName: "John",
    lastName: "Doe",
    emails: [
      {
        type: "personal",
        _text: "john.doe@nobody.com"
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
