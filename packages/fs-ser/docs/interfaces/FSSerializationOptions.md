[fs-ser](../README.md) / [Exports](../modules.md) / FSSerializationOptions

# Interface: FSSerializationOptions

## Table of contents

### Properties

- [donotTraverseDir](FSSerializationOptions.md#donottraversedir)
- [outputFilePath](FSSerializationOptions.md#outputfilepath)
- [serStartsFromDir](FSSerializationOptions.md#serstartsfromdir)

## Properties

### donotTraverseDir

• `Optional` **donotTraverseDir**: `string`[]

List of all dirs that are not be traversed while serializing the FS. By default `node_modules` and `.git` are not
traversed

#### Defined in

index.ts:23

___

### outputFilePath

• `Optional` **outputFilePath**: `string`

Output file path where the serialized fs would be written in json format.
If this is not present then it's not written in a file, the content is simply returned to the caller.

#### Defined in

index.ts:18

___

### serStartsFromDir

• **serStartsFromDir**: `string`

Relative/absolute path to the dir in FS from where the serialization starts.

#### Defined in

index.ts:13
