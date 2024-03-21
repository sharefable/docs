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
  orderOfPages: [],
  props: {
    header: {
      logo: {
        imageUrl: 'https://sharefable.com/fable_footer-logo.svg',
        title: 'Fable Docs',
      },
      navLinks: {
        links: [
          { title: 'Offerings', url: 'https://sharefable.com' },
          { title: 'Projects', url: '#' },
          { title: 'About us', url: '#' },
          { title: 'Pricing', url: '#' },
          { title: 'Resources', url: '#' },
        ]
      },
      cta: { title: "Get a demo", link: "#"}
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
          "heading": "Company",
          "links": [
            { "title": "About us", "url": "#" },
            { "title": "Careers", "url": "#" },
            { "title": "Partners", "url": "#" },
            { "title": "Contact us", "url": "#" }
          ]
        },
        {
          "heading": "Resources",
          "links": [
            { "title": "Blog", "url": "#" },
            { "title": "Case studies", "url": "#" },
            { "title": "Webinars", "url": "#" },
            { "title": "Ebooks", "url": "#" }
          ]
        },
        {
          "heading": "Support",
          "links": [
            { "title": "Contact Us", "url": "#" },
            { "title": "FAQ", "url": "#" },
            { "title": "Support center", "url": "#" }
          ]
        }
      ]
    },
    toc: {
      title: "In this article"
    },
    stickyBanner: {
      title: "Engage your audience with compelling content tailored to their needs.",
      href: "#",
      cta: "Get a demo"
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
      primary: "#124559",
      textPrimary: "#0b090a",
      textSecondary: "#e9ecef",
      textTertiary: "#f8f9fa",
      backgroundPrimary: "#fff",
      backgroundSecondary: "#f3f4f6",
      accent: "#89b0ae",
      border: "#e2e2e2",
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
