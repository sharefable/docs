import { EditorContent, Msg } from "./types";

export default function injectScript() {
    // window.addEventListener(Msg.GET_EDITOR_DATA, listener)

    // function listener({ target }: { target: any }) {
    //     console.log(target);
    //     if (target.cmView) {
    //         console.log('viewed', target.cmView)
    //         window.dispatchEvent(new CustomEvent(Msg.EDITOR_DATA, { detail: target.cmView.view}));
    //     }
    // }
}


window.addEventListener('message', (event) => {
    if (event.data.type === Msg.GET_EDITOR_DATA) {
        const editorElement = document.querySelector('.cm-content') as any as EditorContent
        window.postMessage({ type: Msg.EDITOR_DATA, data: editorElement.cmView.view.state.doc.toString()})
    }
})


injectScript()