[fs-ser](../README.md) / [Exports](../modules.md) / FSSerNode

# Interface: FSSerNode

For each dir/file that gats traversed, one object of `FSSerNode` gets created.

## Table of contents

### Properties

- [children](FSSerNode.md#children)
- [ext](FSSerNode.md#ext)
- [nodeName](FSSerNode.md#nodename)
- [nodeType](FSSerNode.md#nodetype)

## Properties

### children

• `Optional` **children**: [`FSSerNode`](FSSerNode.md)[]

#### Defined in

index.ts:49

___

### ext

• `Optional` **ext**: `string`

If `nodeType == dir` this key is not present.
If `nodeType == file` this key should be present if the file has extension

#### Defined in

index.ts:48

___

### nodeName

• **nodeName**: `string`

Name of the directory or file

#### Defined in

index.ts:43

___

### nodeType

• **nodeType**: ``"dir"`` \| ``"file"``

Records the type of the node based on if a dir/file is getting traversed.

#### Defined in

index.ts:39
