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