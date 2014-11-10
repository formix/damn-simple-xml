<img src="https://travis-ci.org/formix/damn-simple-xml.svg?branch=master" 
     alt="Travis-CI">

damn-simple-xml
===============

**Damn Simple XML** (DSX) is an XML serialization library meant to ease 
programmer's life in NodeJS.

## Documentation

Consult the full [API Reference](wiki/Api-Reference) for detailed 
documentation.

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

Given the floowing XML:
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

