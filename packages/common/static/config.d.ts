export let version: string;
export namespace urlMapping {
    let globalPrefix: string;
    let entries: {};
}
export namespace props {
    namespace header {
        namespace logo {
            let imageUrl: string;
            let title: string;
        }
        namespace navLinks {
            let alignment: string;
            let links: {
                title: string;
                url: string;
            }[];
        }
    }
    namespace sidepanel {
        let showSidePanel: boolean;
    }
    let content: {};
    namespace footer {
        let logo_1: string;
        export { logo_1 as logo };
        export let copyright: string;
        let links_1: {
            heading: string;
            links: {
                title: string;
                url: string;
            }[];
        }[];
        export { links_1 as links };
    }
}
export namespace theme {
    namespace colors {
        let primary: string;
        let textPrimary: string;
        let textSecondary: string;
        let textTertiary: string;
        let backgroundPrimary: string;
        let backgroundSecondary: string;
        let accent: string;
        let border: string;
    }
    namespace typography {
        let fontSize: number;
        let fontFamily: string;
        let lineHeight: number;
        namespace h1 {
            export let margin: string;
            export let padding: number;
            let fontSize_1: string;
            export { fontSize_1 as fontSize };
            export let fontWeight: number;
            let lineHeight_1: string;
            export { lineHeight_1 as lineHeight };
        }
        namespace h2 {
            let margin_1: string;
            export { margin_1 as margin };
            let padding_1: number;
            export { padding_1 as padding };
            let fontSize_2: string;
            export { fontSize_2 as fontSize };
            let fontWeight_1: number;
            export { fontWeight_1 as fontWeight };
            let lineHeight_2: string;
            export { lineHeight_2 as lineHeight };
        }
        namespace h3 {
            let margin_2: string;
            export { margin_2 as margin };
            let padding_2: number;
            export { padding_2 as padding };
            let fontSize_3: string;
            export { fontSize_3 as fontSize };
            let fontWeight_2: number;
            export { fontWeight_2 as fontWeight };
            let lineHeight_3: string;
            export { lineHeight_3 as lineHeight };
        }
        namespace h4 {
            let margin_3: string;
            export { margin_3 as margin };
            let padding_3: number;
            export { padding_3 as padding };
            let fontSize_4: string;
            export { fontSize_4 as fontSize };
            let fontWeight_3: number;
            export { fontWeight_3 as fontWeight };
            let lineHeight_4: string;
            export { lineHeight_4 as lineHeight };
        }
        namespace h5 {
            let margin_4: string;
            export { margin_4 as margin };
            let padding_4: number;
            export { padding_4 as padding };
            let fontSize_5: string;
            export { fontSize_5 as fontSize };
            let fontWeight_4: number;
            export { fontWeight_4 as fontWeight };
            let lineHeight_5: string;
            export { lineHeight_5 as lineHeight };
        }
        namespace h6 {
            let margin_5: string;
            export { margin_5 as margin };
            let padding_5: number;
            export { padding_5 as padding };
            let fontSize_6: string;
            export { fontSize_6 as fontSize };
            let fontWeight_5: number;
            export { fontWeight_5 as fontWeight };
            let lineHeight_6: string;
            export { lineHeight_6 as lineHeight };
        }
        namespace p {
            let margin_6: string;
            export { margin_6 as margin };
            let padding_6: number;
            export { padding_6 as padding };
            let fontSize_7: string;
            export { fontSize_7 as fontSize };
            let fontWeight_6: number;
            export { fontWeight_6 as fontWeight };
            let lineHeight_7: string;
            export { lineHeight_7 as lineHeight };
        }
    }
}
