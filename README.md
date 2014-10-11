damn-simple-xml
===============

Simple XML to JavaScript object deserializer for Node

## What damn-simple-xml is good for?

*damn-simple-xml* (or DSX) does a really good job at deserializing XML data of a
formely serialized object from another language like C# or Java.

## Usage

Having the variable named *xmlString* containing:
```xml
<employee id="123">
  <firstName>John</firstName>
  <lastName>Doe</lastName>
  <dateOfBirth>1984-03-12T00:00:00.000Z</dateOfBirth>
</employee>
```

This code:
```javascript
var dsx = require("damn-simple-xml");
dsx.deserialize(xmlString, function(pair) {
   console.log(pair); 
});
```

Will print:
```javascript
{
    root: "employee",
    data: {
        id: 123,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1984-03-27T00:00:00.000Z"
    }
}
```

As described in the Behavior section, DSX will create arrays when meeting
the second occurence of the same node name at the same level. Sometimes,
it may be more convenient to declare which fields should be instanciated as
array up front. To do this, you can call *damn-simple-xml* with an object 
instead of an xmlstring as first parameter. That object must contain the
following fields:

* xml: The XML string.
* arrayNames: An array of strings containing all field names that have to be created as an array instead of an object.

For example, if `xmlstrinig = `
```xml
<employee id="123">
  <firstName>John</firstName>
  <lastName>Doe</lastName>
  <dateOfBirth>1984-03-12T00:00:00.000Z</dateOfBirth>
  <languages>
    <language>Java</language>
  </languages>
</employee>
```

This code:
```javascript
var dsx = require("damn-simple-xml");
dsx.deserialize({
        xml: xmlstring,
        arrayNames: ["languages"]
    }, function(pair) {
   console.log(pair); 
});
```

Will print:
```javascript
{
    root: "employee",
    data: {
        id: 123,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1984-03-27T00:00:00.000Z",
        languages: ["Java"]
    }
}
```

## Behavior

1) Attributes are directly rendered as fields in the resulting object.

```xml
<employee id="123">
  <firstName>John</firstName>
  <lastName>Doe</lastName>
  <dateOfBirth>1984-03-12T00:00:00.000Z</dateOfBirth>
</employee>
```

```javascript
{
    id: 123,
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1984-03-27T00:00:00.000Z"
}
```

2) Arrays are discovered when a second node with the same name is found

```xml
<employee id="123">
  <firstName>John</firstName>
  <lastName>Doe</lastName>
  <dateOfBirth>1984-03-12T00:00:00.000Z</dateOfBirth>
  <languages>
    <language>Java</language>
    <language>C++</language>
    <language>C#</language>
    <language>JavaScript</language>
  </languages>
</employee>
```

```javascript
{
    id: 123,
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1984-03-27T00:00:00.000Z",
    languages: ["Java", "C++", "C#", "JavaScript"]
}
```

3) objects are created all the way down

```xml
<employee id="123">
  <firstName>John</firstName>
  <lastName>Doe</lastName>
  <dateOfBirth>1984-03-12T00:00:00.000Z</dateOfBirth>
  <department>
    <name>Marketting</name>
    <level>4</level>
    <supervisor>
      <firstName>Amanda</name>
      <lastName>Clarke</lastName>
      <email>amanda.clarke@revenge.tv</email>
    <supervisor>
  </department>
</employee>
```

```javascript
{
    id: 123,
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1984-03-27T00:00:00.000Z",
    department: {
        name: "Marketting",
        supervisor: {
            firstName: "Amanda",
            lastName: "Clarke",
            email: "amanda.clarke@revenge.tv"
        }
    }
}
```

4) When there is no second node with the same name then an object is created

This is what DSX will do by default but you can override this behavior by 
providing an object to the deserialize method containing an array of field
names that should be considered as array. See the Usage section for the 
correct syntax.

```xml
<employee id="123">
  <firstName>John</firstName>
  <lastName>Doe</lastName>
  <dateOfBirth>1984-03-12T00:00:00.000Z</dateOfBirth>
  <languages>
    <language>Java</language>
  </languages>
</employee>
```

```javascript
{
    id: 123,
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1984-03-27T00:00:00.000Z",
    languages: {
        language: "Java"
    }
}
```

5) Elements that combine attributes and text

Since version 0.5.5, when a node containing text have attributes, the text 
content is set in a "_text" field beside other possible attributes.

```xml
<player>
  <name>Tom Brady</name>
  <emails>
    <email type="personal">me@tombrady.com</email>
    <email type="work">tom.brady@patriots.com</email>
  </emails>
</player>
```

Will be rendered as:
```javascript
{
    name: "Tom Brady",
    emails: [
        {
            type: "personal",
            _text: "me@tombrady.com"
        },
        {
            type: "work",
            _text: "tom.brady@patriots.com"
        }
    ]
}
```
