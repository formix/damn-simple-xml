damn-simple-xml [![travis-ci build result](https://api.travis-ci.org/formix/damn-simple-xml.svg?branch=master "damn-simple-xml master")](https://travis-ci.org/search/damn-simple-xml)
===============

[![Join the chat at https://gitter.im/formix/damn-simple-xml](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/formix/damn-simple-xml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Damn Simple XML (DSX) is an XML deserialization and serialization library with
a small memory footprint. This is the only XML library that can handle CDATA 
sections for both serialization and deserialization.

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
    "employees" : "employee",
    "employees.employee.emails": "email"
  },
  attributes: {
    "employees.employee": ["id", "department"],
    "employees.employee.emails.email": ["type"]
  },
  texts: {
    "employees.employee.emails.email": "value"
  }
});

var employees = [
  { 
    id: 123,
    department: "Marketting",
    fullname: "John Doe",
    emails: [
        {
            type: "home",
            value: "jd@home.com"
        },
        {
            type: "work",
            value: "jd@work.com"
        }
    ]
  },
  { 
    id: 456,
    department: "Administration",
    fullname: "Jane Dowell",
    emails: [
        {
            type: "home",
            value: "jane_dowell@home.com"
        }
    ]
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
  <employee id="123" department="Marketting">
    <fullname>John Doe</fullname>
    <emails>
      <email type="home">jd@home.com</email>
      <email type="work">jd@work.com</email>
    </emails>
  </employee>
  <employee id="456" department="Administration">
    <fullname>Jane Dowell</fullname>
    <emails>
      <email type="home">jane_dowell@home.com</email>
    </emails>
  </employee>
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
