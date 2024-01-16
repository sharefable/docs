export const pictureIcon = `
<style>
  @media (prefers-color-scheme: dark) {
    .fable-picture-icon {
      fill: #C9D1D9;
    }
  }

  .fable-label:hover {
    background-color: var(--button-invisible-bgColor-hover, var(--color-action-list-item-default-hover-bg));
  }

</style>

<label 
  class="fable-label"
  style="
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--borderRadius-medium, 0.375rem);
    padding: 0rem 0.5rem;
    transition: all 0.15s ease-in;
    cursor: pointer;
  "
>
  <div 
    style="
      border: var(--borderWidth-thin, max(1px, 0.0625rem)) solid var(--borderColor-default, var(--color-border-default));
      border-radius: var(--borderRadius-medium, 0.375rem);
      padding: 16px;
      background-color: var(--overlay-bgColor, var(--color-canvas-overlay)); 
      opacity: 0;
      transform: translate(-50%, -100%); 
      left: 50%;
      position: absolute;
      width: 330px;
      color: var(--fgColor-default, var(--color-fg-default));
      transition: all 0.2s ease-in;
      pointer-events: none;
    "
    class="fable-picture-dialogue"
  >
    Link to uploaded image copied to clipboard!
  </div>
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
`;