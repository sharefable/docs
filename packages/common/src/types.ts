export interface FileDetail {
  fileName: string
  filePath: string
  frontmatter: Record<string, any>
}

export type UrlEntriesMap = Record<string, { fileName: string, filePath: string, frontmatter: Record<string, any> }>

export interface UrlMap {
  globalPrefix: string
  entries: UrlEntriesMap
}

export type UserUrlMapFn = (manifest: FSSerialized) => UrlMap

export interface Theme {
  colors: {
    primary: string
    accent: string
    border: string
    textPrimary: string
    textSecondary: string
    textTertiary: string
    backgroundPrimary: string
    backgroundSecondary: string
  }
  typography: {
    fontSize: string | number
    fontFamily: string
    lineHeight: string | number
    h1: headingConfigs
    h2: headingConfigs
    h3: headingConfigs
    h4: headingConfigs
    h5: headingConfigs
    h6: headingConfigs
    p: headingConfigs
  }
}

interface headingConfigs {
  margin: string | number
  padding: string | number
  fontSize: string | number
  fontWeight: number
  lineHeight: string | number
}

export interface Config {
  version: string
  urlMapping: UrlMap
  layout: 'default' | string
  props: {
    header: {
      customComponent: 'default' | string
    }
    sidepanel: {
      customComponent: 'default' | string
      showSidePanel: boolean
    }
    content: {}
    footer: {
      customComponent: 'default' | string
    }
  }
  theme: Theme
}

export interface SidepanelLinkInfoNode {
  title: string
  icon?: string
  url?: string
  children: SidepanelLinkInfoNode[]
}

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

export interface FSSerialized {
  version: 1
  tree: FSSerNode
}

export interface ImportedFileData {
  moduleName: string
  content: string
  importedPath: string
}
