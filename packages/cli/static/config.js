module.exports = {
  version: "1.0.0",
  urlMapping: {
    globalPrefix: "/",
    entries: {},
  },
  props: {
    header: {
      logo: {
        imageUrl: 'https://sharefable.com/fable-logo.svg',
        title: 'Fable Docs',
      },
      navLinks: {
        alignment: 'center',
        links: [
          { title: 'Visit Fable', url: 'https://sharefable.com' }
        ]
      }
    },
    sidepanel: {},
    content: {},
    footer: {},
  },
  theme: {
    colors: {
      primary: "#4338ca", 
      text: "#1e293b", 
      background: "#f3f4f6", 
      accent: "#a5b4fc",
      border: "#94a3b8",
    },
    typography: {
      fontSize: 16, 
      fontFamily: "sans-serif", 
      lineHeight: 1.5,
    },
  }
}
