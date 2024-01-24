export enum Msg {
    EXTENSION_ACTIVATED = "extension_activated",
    INVALID_PAGE = "invalid_page",
    MDX_DATA = "mdx_data",
    CONFIG_DATA = "config_data",
    GET_EDITOR_DATA = "get_editor_data",
    EDITOR_DATA = "editor_data",
    IMPORTS_DATA = "imports_data"
}

export interface GithubRepoData {
    owner: string,
    repo: string,
    branch: string,
    path: string
}

export interface EditorContent {
    cmView: {
        view: {
            state: {
                doc: {
                    lineAt: (pos: number) => {
                        number: number;
                        from: number;
                        text: string;
                    };
                };
                selection: {
                    main: {
                        from: number;
                        to: number;
                        head: number;
                    };
                };
                sliceDoc: (from: number, to: number) => string;
            };
            dispatch: (changes: any) => void;
        };
    };
}

export interface ImportPath {
    content: string;
    path: string;
}