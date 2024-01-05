export type TNodeType = 'dir' | 'file';

/**
  * For each dir/file that gats traversed, one object of `FSSerNode` gets created.
  */
export interface FSSerNode {
  /**
    * Records the type of the node based on if a dir/file that is being traversed.
    */
  nodeType: TNodeType
  /**
    * Name of the directory or file being traversed
    */
  nodeName: string
  /**
    * Absolute path of the current file / dir being traversed
    */
  absPath: string
  /**
    * If `nodeType == dir` this key is not present.
    * If `nodeType == file` this key should be present if the file has extension
    */
  ext?: string
  children?: FSSerNode[]
  isRoot?: boolean
  frontmatter?: Record<string, any>
  pathName?: string
}

export interface Visitor {
  enter?: (node: FSSerNode, state: any) => Promise<void>
  exit?: (node: FSSerNode, state: any) => Promise<void>
}

export type TVisitors = Record<string, Visitor>;
