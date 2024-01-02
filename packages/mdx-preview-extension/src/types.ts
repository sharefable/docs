export enum Msg {
    EXTENSION_ACTIVATED = 'extension_activated',
    INVALID_PAGE = 'invalid_page',
    MDX_DATA = 'mdx_data',
    CONFIG_DATA = 'config_data'
}

export interface GithubRepoData {
    owner: string,
    repo: string,
    branch: string,
    path: string
}