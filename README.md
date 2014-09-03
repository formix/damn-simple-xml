damn-simple-xml
===============

Simple XML to JSON deserializer for Node

## What damn-simple-xml is good for?

*damn-simple-xml* does a really good job at deserializing XML data of a
formely serialized object from another language like C# or Java.

## What damn-simple-xml is not good for?

*damn-simple-xml* does not cope whell with text mixed with elements on
the same level.

```xml
<root>
  <elements>
    Do not expect damn-simple-xml to cope well with this XML!
    <sub-element>plain text</sub-element>
    <sub-element attribute="value">element with attribute</sub-element>
  </elements>
</root>
```

*damn-simple-xml* do not need XML schemas. It extrapolates object 
hierarchies, subtypes and arrays directly from the given XML data. 
An XML schema definition is of no use.

*damn-simple-xml* does not support JSON to XML serialization yet. I
plan to add that feature in a future release.

## Behavior

1. Attributes are directly rendered as fields in the resulting object.

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

2. Arrays are discovered when a second node with the same name is found

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

3. objects are created all the way down

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

4. When there is no second node with the same name then an object is created

That's an expected behavior as described in point 3. But that may be a
little bit confusing when other objects of the same kind contains an 
array as in point 2.

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

