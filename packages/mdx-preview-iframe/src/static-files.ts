export const indexCss = `html {
  font-size: var(--font-size);
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: var(--font-family);
  line-height: var(--line-height);
  background-color: var(--background-primary-color);
  color: var(--text-primary-color);
}

a {
  text-decoration: none;
  color: var(--text-tertiary-color);
  line-height: var(--line-height);
}

blockquote {
  border-left: 5px solid var(--accent-color);
  padding: 10px 20px;
  margin: 0 0 10px 0;
}

a:hover {
  background-color: var(--accent-color);
  color: var(--primary-color);
}

a:active {
  color: var(--primary-color);
}

h1 {
  margin: var(--h1-margin);
  padding: var(--h1-padding);
  font-size: var(--h1-font-size);
  line-height: var(--h1-line-height);
  font-weight: var(--h1-font-weight);
}

h2 {
  margin: var(--h2-margin);
  padding: var(--h2-padding);
  font-size: var(--h2-font-size);
  line-height: var(--h2-line-height);
  font-weight: var(--h2-font-weight);
}

h3 {
  margin: var(--h3-margin);
  padding: var(--h3-padding);
  font-size: var(--h3-font-size);
  line-height: var(--h3-line-height);
  font-weight: var(--h3-font-weight);
}

h4 {
  margin: var(--h4-margin);
  padding: var(--h4-padding);
  font-size: var(--h4-font-size);
  line-height: var(--h4-line-height);
  font-weight: var(--h4-font-weight);
}

h5 {
  margin: var(--h5-margin);
  padding: var(--h5-padding);
  font-size: var(--h5-font-size);
  line-height: var(--h5-line-height);
  font-weight: var(--h5-font-weight);
}

h6 {
  margin: var(--h6-margin);
  padding: var(--h6-padding);
  font-size: var(--h6-font-size);
  line-height: var(--h6-line-height);
  font-weight: var(--h6-font-weight);
}

p, li {
  margin: var(--p-margin);
  padding: var(--p-padding);
  font-size: var(--p-font-size);
  line-height: var(--p-line-height);
  font-weight: var(--p-font-weight);
}

.con {
  display: flex;
  flex-direction: column;
}

.main-wrapper {
  scroll-margin-top: 100px;
  display: flex;
  flex-grow: 1;
  align-items: stretch;
}

.main-con {
  flex: 3;
  width: 100%;
}

h1 a,
h2 a,
h3 a,
h4 a,
h5 a,
h6 a {
  background-color: transparent !important;
}


h1,
h2,
h3,
h4,
h5,
h6 {
  scroll-margin-top: 6.9rem;
}

a .icon {
  opacity: 0;
  transition: all 0.2s ease-in;
}

a .icon:hover {
  opacity: 1;
}

a .icon-link::after {
  content: '🔗';
  font-size: 1rem;
  vertical-align: middle;
}
`;
