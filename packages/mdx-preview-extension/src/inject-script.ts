import { EditorContent, Msg } from "./types";
import { GITHUB_EDIT_TAB_SELECTOR } from "./utils";

window.addEventListener("message", (event) => {
  if (event.data.type === Msg.GET_EDITOR_DATA) {
    const editorElement = document.querySelector(GITHUB_EDIT_TAB_SELECTOR) as any as EditorContent;
    window.postMessage({ type: Msg.EDITOR_DATA, data: editorElement.cmView.view.state.doc.toString() });
  }
});