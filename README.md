damn-simple-xml
===============

Simple XML to JSON deserializer for Node

## What damn-simple-xml is good for?

*damn-simple-xml* does a really good job at deserializing XML data of a
formely serialized object from another language like C#, Java. When
you read an XML document and it maps direclty into a JavaScript object 
hierarchy in your mind, then damn-simple-xml is the library you need.

## What damn-simple-xml is not good at?

### 1. If you have a complex document that combines text at the same level as other xml nodes then *damn-simple-xml* is not for you:

```xml
<root>
  <elements>
    damn-simple-xml will not be able to do anything with this XML!
    <sub-element />
    <sub-element />
  </elements>
</root>
```

### 2. Reading XML schemas

*damn-simple-xml* extrapolates object hierarchies, subtypes and arrays
directly from the given XML data. XML schema definition is of no use.

### 3. XML Serialization

*damn-simple-xml* does not support JSON to XML serialization yet. I
plan to add that feature in a future release.
