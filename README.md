[![Stories in Ready](https://badge.waffle.io/formix/damn-simple-xml.png?label=ready&title=Ready)](https://waffle.io/formix/damn-simple-xml)
damn-simple-xml [![travis-ci build result](https://api.travis-ci.org/formix/damn-simple-xml.svg?branch=master "damn-simple-xml master")](https://travis-ci.org/search/damn-simple-xml)
===============

[![Join the chat at https://gitter.im/formix/damn-simple-xml](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/formix/damn-simple-xml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Dams Simple XML DSX is optimized to serialize JavaScript objects and deserialize 
XML elements that have been formerly serialized from an object in another 
programming language (or by DSX). DSX is not designed to handle any kind of 
free form XML documents. DSX have a small memory footprint. It is the only 
XML library that can handle CDATA sections for both serialization and 
deserialization.

[Google Group](https://groups.google.com/forum/?hl=fr#!forum/damn-simple-xml)

## Documentation and Release Notes

Consult the full [API Reference](https://github.com/formix/damn-simple-xml/wiki/Api-Reference) for detailed documentation.

Consult The [Release Notes](https://github.com/formix/damn-simple-xml/wiki/Release-Notes) here.

## Usage

The following usage scenarios are oversimplified. with DSX, you can fine tune 
and control each serialization behaviors. You can choose to define a field to be 
serialized as an attribute, a CDATA or define a collection child 
elements' name. For more informations, see 
[API Reference](https://github.com/formix/damn-simple-xml/wiki/Api-Reference) 
reference

### Serialization

By default, all fields of an object will be serialized as a XML element. You
can control serialization by providing a `behavior` object telling Damn 
Simple Xml how to serialize attributes texts, CDATA, arrays and arrays' 
items fields:

```javascript
var Serializer = require("damn-simple-xml");
var serializer = new Serializer();

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
  <employee>
    <id>123</id>
    <department>Marketting</department>
    <fullname>John Doe</fullname>
    <emails>
      <emailsItem>
        <type>home</type>
        <value>jd@home.com</value>
      </emailsItem>
      <emailsItem>
        <type>work</type>
        <value>jd@work.com</value>
      </emailsItem>
    </emails>
  </employee>
  <employee>
    <id>456</id>
    <department>Administration</department>
    <fullname>Jane Dowell</fullname>
    <emails>
      <emailsItem>
        <type>home</type>
        <value>jane_dowell@home.com</value>
      </emailsItem>
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
    <email type="work">jdoe@work.com</email>
    <email type="personal">john.doe@nobody.com</email>
  <emails>
</employee>
```

```javascript
var Serializer = require("damn-simple-xml");
var serializer = new Serializer();

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
        type: "work",
        value: "jdoe@work.com"
      },
      {
        type: "personal",
        value: "john.doe@nobody.com"
      }
    ]
  }
}
```
