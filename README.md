damn-simple-xml
===============

Simple XML to JSON deserializer for Node

## What damn-simple-xml is good for?

damn-simple-xml does a really good job at deserializing XML data from a
formely serialized object from another language like C# or Java. When
you read an XML document and it maps direclty into a JavaScript object 
hierarchy in your mind, then damn-simple-xml is the library you need.

## What damn-simple-xml is not good at?

1. If you have a complex document that combines text at the same level as other xml nodes then *damn-simple-xml* is not for you:

```xml
<root>
  <elements>
    damn-simple-xml will not be able to do anything with this XML!
    <sub-element />
    <sub-element />
  </elements>
</root>
```

