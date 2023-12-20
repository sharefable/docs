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
    textPrimary: string, 
    textSecondary: string, 
    textTertiary: string, 
    backgroundPrimary: string, 
    backgroundSecondary: string, 
    accent: string,
    border: string,
  },
  typography: {
    fontSize: string | number, 
    fontFamily: string, 
    lineHeight: string | number,
    h1: headingConfigs,
    h2: headingConfigs,
    h3: headingConfigs,
    h4: headingConfigs,
    h5: headingConfigs,
    h6: headingConfigs,
    p: headingConfigs
  }
}

type headingConfigs = {
  margin: string | number,
  padding: string | number,
  fontSize: string | number, 
  fontWeight: number,
  lineHeight: string | number,
}

export type Config = {
  version: string;
  urlMapping: UrlMap;
  props: {
    header: {};
  };
  theme: Theme;
}