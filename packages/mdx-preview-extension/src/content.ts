import { Msg } from "./types";
import { GITHUB_EDIT_TAB_SELECTOR, injectPreviewDivFromBlob, injectPreviewDivFromEdit, isGithubMdxPage } from "./utils";

const DOCDEN_EDIT_PAGE_BUTTON = "docden-edit-page-button";
const DOCDEN_EVENT_LISTNER_DIV_ID = "docden-0-cm-presence";
type styleDeclaration = Partial<CSSStyleDeclaration> & { [propName: string]: string };

const MAX_POLL_ITERATIONS_PREVIEW_BUTTON = 20;
let pollIterationsPreviewButton = 0;

let timeoutId: NodeJS.Timeout;
const processPage = () => {
  const isGithubPage = isGithubMdxPage(window.location.href);
  if (isGithubPage.isValid && isGithubPage.isEditPage) {
    const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR);
    sourceDiv!.dispatchEvent(new CustomEvent(Msg.GET_EDITOR_DATA, {
      bubbles: true
    }));

    window.postMessage({ type: Msg.GET_EDITOR_DATA });

    const observer = new MutationObserver(handleContentUpdate);
    const observerConfig = {
      characterData: true,
      childList: true,
      subtree: true
    };
    observer.observe(sourceDiv!, observerConfig);
  } else if (isGithubPage.isValid && !isGithubPage.isEditPage) {
    const divId = "copilot-button-positioner";
    const docDiv = document.getElementById(divId);
    const textAreaContent = docDiv!.querySelector("textarea")!.value;
    injectPreviewDivFromBlob(textAreaContent);
  } else {
    chrome.runtime.sendMessage({ type: Msg.INVALID_PAGE, message: isGithubPage.message });
  }
};

const handleContentUpdate = (mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      window.postMessage({ type: Msg.GET_EDITOR_DATA });
    }, 1000);
  });
};

const previewButtonStyle: styleDeclaration = {
  height: "32px",
  minWidth: "max-content",
  backgroundColor: "rgb(35, 134, 54)",
  color: "white",
  fontWeight: "500",
  fontSize: "14px",
  borderRadius: "6px",
  borderWidth: "1px",
  padding: "0px 12px",
  borderColor: "rgba(240, 246, 252, 0.1)",
  marginLeft: "8px",
  transition: "color 80ms cubic - bezier(0.65, 0, 0.35, 1) 0s, fill, background - color, border - color",
  gap: "8px"
};

function insertPreviewButtonInEditPage() {
  const previewButton = document.createElement("button");
  for (const i in previewButtonStyle)
    (previewButton.style as styleDeclaration)[i] = previewButtonStyle[i];

  previewButton.id = DOCDEN_EDIT_PAGE_BUTTON;
  previewButton.textContent = "Preview MDX";
  previewButton.addEventListener("click", processPage);

  const intervalId = setInterval(() => {
    const destinaationH1 = document.querySelector("h1[data-testid=\"screen-reader-heading\"]");
    pollIterationsPreviewButton++;

    if (destinaationH1 || pollIterationsPreviewButton > MAX_POLL_ITERATIONS_PREVIEW_BUTTON) clearInterval(intervalId);

    if (destinaationH1 && document.getElementById(DOCDEN_EDIT_PAGE_BUTTON) === null) {
      const parentElementContainer = destinaationH1!.parentElement!.getElementsByTagName("div")[0];
      const parentElement = parentElementContainer.lastElementChild;
      parentElement!.appendChild(previewButton);
    }
  }, 100);
}

function insertPreviewButton() {
  const isGithubEditPage = isGithubMdxPage(window.location.href).isEditPage;
  if (isGithubEditPage && document.getElementById(DOCDEN_EDIT_PAGE_BUTTON) === null) {
    insertPreviewButtonInEditPage();
  }
}

function createDocDenZeroPx() {
  const div = document.createElement("div");
  div.setAttribute("id", DOCDEN_EVENT_LISTNER_DIV_ID);
  document.body.appendChild(div);
}

if (document.getElementById(DOCDEN_EVENT_LISTNER_DIV_ID) === null) {
  createDocDenZeroPx();
  window.addEventListener("message", (event) => {
    if (event.data.type === Msg.EDITOR_DATA) {
      injectPreviewDivFromEdit(event.data.data);
    }
  });
}

insertPreviewButton();