export interface FileDetail {
  fileName: string;
  filePath: string;
}

export type UrlEntriesMap = Record<string, { fileName: string, filePath: string }>

export interface UrlMap {
  globalPrefix: string;
  entries: UrlEntriesMap;
}

export type Config = {
  version: string;
  urlMapping: UrlMap;
  props: {
    header: {};
  };
  theme: {};
}