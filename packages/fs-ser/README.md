[fs-ser](README.md) / Exports

# fs-ser

## Table of contents

### Interfaces

- [FSSerNode](interfaces/FSSerNode.md)
- [FSSerializationOptions](interfaces/FSSerializationOptions.md)
- [FSSerialized](interfaces/FSSerialized.md)

### Functions

- [default](modules.md#default)

## Functions

### default

▸ **default**(`options`): `Promise`\<[`FSSerialized`](interfaces/FSSerialized.md)\>

Terminology
- FS: File System
- ser: Serialization

Starts from `opts.serStartsFromDir` path and serialize the FS hierarchy by traversing the FS
recursively. FS is serialized as object of type [FSSerNode](interfaces/FSSerNode.md) for each file/dir that is encountered during traversal.
The final content is either written to a file if `opts.outputFilePath` is passed or is simply returned to the caller.
Serialization does not read the content of the file, it simply traverse the dirs and files.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FSSerializationOptions`](interfaces/FSSerializationOptions.md) |

#### Returns

`Promise`\<[`FSSerialized`](interfaces/FSSerialized.md)\>

#### Defined in

index.ts:99
