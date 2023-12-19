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
      primary: "#3730a3",
      text: "#1e293b",
      textPrimary: "#1e293b",
      background: "#f3f4f6",
      accent: "#c7d2fe",
      border: "#d1d5db",
      textSecondary: "#fff",
    },
    typography: {
      fontSize: 16,
      fontFamily: "sans-serif",
      lineHeight: 1.5,
    },
  }
}
