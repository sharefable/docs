module.exports = {
  version: "1.0.0",
  urlMapping: {
    globalPrefix: "",
    baseUrl: "",
    entries: {},
  },
  name: 'Fable Docs',
  favicons: {
    iconUrl: {
      '16x16': 'https://sharefable.com/favicon.png'
    }
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
      },
      cta: { title: "CTA Title", link: "#"}
    },
    sidepanel: {
      showSidePanel: true
    },
    content: {},
    footer: {
      logo: 'https://sharefable.com/fable_footer-logo.svg',
      copyright: 'Fable © 2024',
      links: [
        {
          heading: 'Solutions',
          links: [{ title: 'Solution 1', url: '#' }, { title: 'Solution 2', url: '#' }]
        },
        {
          heading: 'Products',
          links: [{ title: 'Product 1', url: '#' }, { title: 'Product 2', url: '#' }]
        },
      ]
    },
    toc: {
      title: "In this article"
    },
    stickyBanner: {
      title: "Sample Title",
      href: "#",
      cta: "Sample CTA"
    },
    contentHeader: {
      show: true,
    },
    contentFooter: {
      show: true,
    }
  },
  theme: {
    colors: {
      primary: "#3730a3",
      textPrimary: "#1e293b",
      textSecondary: "#fff",
      textTertiary: "#000",
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
        margin: '0 0 1.5rem 0',
        padding: 0,
        fontSize: '2.375rem',
        fontWeight: 700,
        lineHeight: '3rem'
      },
      h2: {
        margin: '0 0 2rem 0',
        padding: 0,
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: '2.25rem'
      },
      h3: {
        margin: '2rem 0 2rem 0',
        padding: 0,
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: '1.625rem'
      },
      h4: {
        margin: '0 0 1.5rem 0',
        padding: 0,
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: '1.375rem'
      },
      h5: {
        margin: '0 0 1.5rem 0',
        padding: 0,
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: '1.375rem'
      },
      h6: {
        margin: '0 0 1.5rem 0',
        padding: 0,
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: '1.375rem'
      },
      p: {
        margin: '0 0 1.5rem 0',
        padding: 0,
        fontSize: '1.125rem',
        fontWeight: 400,
        lineHeight: '1.625rem'
      }
    },
  }
}
