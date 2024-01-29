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

export enum ElementId {
    IFARME_CONTAINER = "fable-preview-mjs",
    EMBED_IFRAME = "fable-embed-iframe",
    DOCDEN_EDIT_PAGE_BUTTON = "docden-edit-page-button",
    DOCDEN_EVENT_LISTNER_DIV_ID = "docden-0-cm-presence",
    DOCDEN_DRAGGER_DIV = "docden-dragger-div"
}