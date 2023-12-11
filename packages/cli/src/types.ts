export interface FileDetail {
  fileName: string;
  filePath: string;
}

export type UrlEntriesMap = Record<string, { fileName: string, filePath: string }>

export interface UrlMap {
  globalPrefix: string;
  entries: UrlEntriesMap;
}

export type Theme = {
  colors: {
    primary: string, 
    text: string, 
    background: string, 
    accent: string,
    border: string,
  },
  typography: {
    fontSize: string | number, 
    fontFamily: string, 
    lineHeight: string | number,
  }
}

export type Config = {
  version: string;
  urlMapping: UrlMap;
  props: {
    header: {};
  };
  theme: Theme;
}