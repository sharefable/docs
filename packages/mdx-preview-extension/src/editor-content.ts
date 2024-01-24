import { Msg } from "@fable-doc/common/dist/cjs/types";
import { EditorContent } from "./types";
import { GITHUB_EDIT_TAB_SELECTOR } from "./utils";

const DOCDEN_CONTENT_SCRIPT_DIV_ID = "docden-1-cm-presence";

function handleEditorContent(){
  window.addEventListener("message", (event) => {
    if (event.data.type === Msg.GET_EDITOR_DATA) {
      const editorElement = document.querySelector(GITHUB_EDIT_TAB_SELECTOR) as any as EditorContent;
      window.postMessage({ type: Msg.EDITOR_DATA, data: editorElement.cmView.view.state.doc.toString() });
    }
  });
}

function createDocDenZeroPx() {
  const div = document.createElement("div");
  div.setAttribute("id", DOCDEN_CONTENT_SCRIPT_DIV_ID);
  document.body.appendChild(div);
}

if (document.getElementById(DOCDEN_CONTENT_SCRIPT_DIV_ID) === null) {
  createDocDenZeroPx();
  handleEditorContent();
}
