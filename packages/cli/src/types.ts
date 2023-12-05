export interface FileDetail {
  fileName: string;
  filePath: string;
}

export type UrlEntriesMap = Record<string, { fileName: string, filePath: string }>

export interface UserUrlMap {
  globalPrefix: string;
  entries: UrlEntriesMap;
}
