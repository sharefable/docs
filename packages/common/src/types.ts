export interface FileDetail {
  fileName: string;
  filePath: string;
  frontmatter: Record<string, any>;
  toc: { depth: number; value: string}[];
}

export type UrlEntriesMap = Record<string, FileDetail>

export interface UrlMap {
  globalPrefix: string;
  entries: UrlEntriesMap;
}

export type UserUrlMapFn = (manifest: FSSerialized) => UrlMap

export type Theme = {
  colors: {
    primary: string,
    accent: string,
    border: string,
    textPrimary: string,
    textSecondary: string,
    textTertiary: string,
    backgroundPrimary: string,
    backgroundSecondary: string,
  },
  typography: {
    fontSize: string | number,
    fontFamily: string,
    lineHeight: string | number,
    h1: HeadingConfig,
    h2: HeadingConfig,
    h3: HeadingConfig,
    h4: HeadingConfig,
    h5: HeadingConfig,
    h6: HeadingConfig,
    p: HeadingConfig
  }
}

type HeadingConfig = {
  margin: string | number,
  padding: string | number,
  fontSize: string | number,
  fontWeight: number,
  lineHeight: string | number,
}

type ComponentConfig = {
  customComponent: string;
}

type HeaderConfig = ComponentConfig & {
  logo: {
    imageUrl: string;
    title: string;
  };
  navLinks: {
    alignment: "center" | "left" | "right";
    links: { title: string, url: string }[];
  }
} 

type FooterConfig = ComponentConfig & {
  logo: string;
  copyright: string;
  links: {
    heading: string;
    links: { title: string, url: string }[];
  }[];
}

type SidepanelConfig = ComponentConfig & {
  showSidePanel: boolean;
};

type ContentConfig = ComponentConfig

type TocConfig = ComponentConfig & {
  title: string;
  show: boolean;
}

export type Config = {
  version: string;
  urlMapping: UrlMap;
  layout: "default" | string;
  name: string;
  favicons: {
    iconUrl: {
      "16x16": string;
      "32x32"?: string;
    };
    maskIcon?: string;
  };
  props: {
    header: HeaderConfig;
    sidepanel: SidepanelConfig;
    content: ContentConfig;
    footer: FooterConfig;
    toc: TocConfig;
  };
  theme: Theme;
}

export type SidepanelLinkInfoNode = {
  title: string,
  icon?: string,
  url?: string,
  children: SidepanelLinkInfoNode[],
}


export type TNodeType = "dir" | "file";

/**
  * For each dir/file that gats traversed, one object of `FSSerNode` gets created.
  */
export interface FSSerNode {
  /**
    * Records the type of the node based on if a dir/file that is being traversed.
    */
  nodeType: TNodeType,
  /**
    * Name of the directory or file being traversed
    */
  nodeName: string;
  /**
    * Absolute path of the current file / dir being traversed
    */
  absPath: string;
  /**
    * If `nodeType == dir` this key is not present.
    * If `nodeType == file` this key should be present if the file has extension
    */
  ext?: string;
  children?: FSSerNode[];
  isRoot?: boolean;
  frontmatter?: Record<string, any>;
  pathName?: string;
}

export interface Visitor {
  enter?: (node: FSSerNode, state: any) => Promise<void>;
  exit?: (node: FSSerNode, state: any) => Promise<void>;
}

export type TVisitors = Record<string, Visitor>;

export interface FSSerialized {
  version: 1;
  tree: FSSerNode;
}

export interface ImportedFileData {
  moduleName: string;
  content: string;
  importedPath: string;
}