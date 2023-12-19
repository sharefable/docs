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
    sidepanel: {
      showSidePanel: true
    },
    content: {},
    footer: {},
  },
  theme: {
    colors: {
      primary: "#3730a3",
      textPrimary: "#1e293b",
      textSecondary: "#ffffff",
      textTertiary: "#ffffff",
      backgroundPrimary: "#f3f4f6",
      backgroundSecondary: "#f3f4f6",
      accent: "#c7d2fe",
      border: "#d1d5db",
    },
    typography: {
      fontSize: 16,
      fontFamily: "sans-serif",
      lineHeight: 1.5,
      h1: {
        margin: '0 0 24px 0',
        padding: 0,
        fontSize: '38px',
        fontWeight: 700,
        lineHeight: '48px'
      },
      h2: {
        margin: '0 0 32px 0',
        padding: 0,
        fontSize: '32px',
        fontWeight: 600,
        lineHeight: '36px'
      },
      h3: {
        margin: '0 0 32px 0',
        padding: 0,
        fontSize: '20px',
        fontWeight: 600,
        lineHeight: '26px'
      },
      h4: {
        margin: '0 0 24px 0',
        padding: 0,
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '22px'
      },
      h5: {
        margin: '0 0 24px 0',
        padding: 0,
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '22px'
      },
      h6: {
        margin: '0 0 24px 0',
        padding: 0,
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '22px'
      }
    },
  }
}
