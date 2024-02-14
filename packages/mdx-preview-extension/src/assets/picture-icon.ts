export const pictureIcon = `
<style>
  @media (prefers-color-scheme: dark) {
    .fable-picture-icon {
      fill: #C9D1D9;
    }
  }

  .fable-image-upload-btn:hover {
    background-color: var(--button-invisible-bgColor-hover, var(--color-action-list-item-default-hover-bg));
  }

  .fable-image-upload-btn {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--borderRadius-medium, 0.375rem);
    padding: 0rem 0.5rem;
    transition: all 0.15s ease-in;
    cursor: pointer;
    height: 100%;
  }

  .fable-picture-dialogue {
    border: var(--borderWidth-thin, max(1px, 0.0625rem)) solid var(--borderColor-default, var(--color-border-default));
    border-radius: var(--borderRadius-medium, 0.375rem);
    padding: 16px;
    background-color: var(--overlay-bgColor, var(--color-canvas-overlay)); 
    opacity: 0;
    transform: translate(-40%, -175%); 
    left: 50%;
    position: absolute;
    width: 390px;
    color: var(--fgColor-default, var(--color-fg-default));
    transition: all 0.2s ease-in;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .fable-image-link {
    border: var(--borderWidth-thin, max(1px, 0.0625rem)) solid var(--borderColor-default, var(--color-border-default));
    border-radius: var(--borderRadius-medium, 0.375rem);
    white-space: nowrap;
    overflow: auto;
    padding: 0.3rem 0.5rem;
    scrollbar-width: thin;
  }

  #fable-dialogue-message {
    margin-top: 0.3rem;
  }

  #fable-image-link-wrapper {
    align-items: center;
    gap: 0.75rem;
    display: none;
  }
</style>

<div style="position: relative; height: 100%;">
  <label 
    class="fable-image-upload-btn"
    id="fable-image-upload-btn"
  >
    <input 
      type="file" 
      name="img" 
      style="display: none" 
      class="fable-picture-icon"
      accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
    />
    <svg
      fill="#24292F"
      aria-hidden="true" 
      height="16" 
      viewBox="0 0 16 16" 
      version="1.1" 
      width="16"
      class="fable-picture-icon"
    >
      <path d="M16 13.25A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75ZM1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h.94l.03-.03 6.077-6.078a1.75 1.75 0 0 1 2.412-.06L14.5 10.31V2.75a.25.25 0 0 0-.25-.25Zm12.5 11a.25.25 0 0 0 .25-.25v-.917l-4.298-3.889a.25.25 0 0 0-.344.009L4.81 13.5ZM7 6a2 2 0 1 1-3.999.001A2 2 0 0 1 7 6ZM5.5 6a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0Z"></path>
    </svg>
  </label>  

  <div class="fable-picture-dialogue">

    <div class="Overlay-actionWrap" id="fable-dialogue-close-btn" style="position: absolute; right: 16px; top: 16px; display: none;">
      <button aria-label="Close" type="button" class="close-button Overlay-closeButton">
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
        </svg>
      </button>
    </div>

    <div id="fable-dialogue-message">Uploading image...</div>

      <div id="fable-image-link-wrapper">
        <div class="fable-image-link"></div>

        <clipboard-copy aria-label="Copy" data-copy-feedback="Copied!" value="feat-conversation-tab" data-view-component="true" class="Link--onHover js-copy-branch color-fg-muted d-inline-block ml-1" tabindex="0" role="button">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy" style="display: inline-block;">
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
          </svg>
          <svg style="display: none;" aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check color-fg-success">
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
          </svg>
        </clipboard-copy>
      </div>    
    </div>
  </div>
`;