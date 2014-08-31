damn-simple-xml
===============

Simple XML to JSON deserializer for Node

## What damn-simple-xml is good for?

*damn-simple-xml* does a really good job at deserializing XML data of a
formely serialized object from another language like C# or Java.

## What damn-simple-xml is not good for?

**1. If you have a complex document that combines text at the same level as other xml nodes, it'S not gonna work:**

```xml
<root>
  <elements>
    damn-simple-xml will not be able to do anything with this XML!
    <sub-element>plain text</sub-element>
    <sub-element attribute="value">element with attribute</sub-element>
  </elements>
</root>
```

**2. Reading XML schemas**

*damn-simple-xml* extrapolates object hierarchies, subtypes and arrays
directly from the given XML data. XML schema definition is of no use.

**3. XML Serialization**

*damn-simple-xml* does not support JSON to XML serialization yet. I
plan to add that feature in a future release.

## Behavior

**1. Attributes are rendered as fields**

Attributes are directly rendered as fields in the resulting object.

```xml
<employee id="123">
  <firstName>John</firstName>
  <lastName>Doe</lastName>
  <dateOfBirth>1984-03-12T00:00:00.000Z</dateOfBirth>
</employee>
```

```javascript
{
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: 1984-03-27T00:00:00.000Z
}
```
