import React, { useEffect, useRef } from "react";

export default function Wrapper(props) {
  const flagRef = useRef(false)

  useEffect(() => {
    if (flagRef.current) return

    function generateHeadTag(obj) {
      const head = document.head;
      const tags = {
        meta: [
          {
            name: 'description',
            content: obj?.description,
            id: 'description',
          },
          {
            property: 'og:description',
            content: obj?.ogDescription || obj?.description,
            id: 'og-description',
          },
          {
            property: 'og:title',
            content: obj?.ogTitle || obj?.title,
            id: 'og-title',
          },
          {
            property: 'og:image',
            content: obj?.ogImage,
            id: 'og-image',
          },
          {
            property: 'og:type',
            content: 'website',
            id: 'og-type',
          },
          {
            property: 'og:url',
            content: obj?.ogUrl,
            id: 'og-url',
          },
          {
            name: 'twitter:card',
            content: 'summary_large_image',
            id: 'twitter-card',
          },
          {
            property: 'twitter:url',
            content: obj?.twitterUrl,
            id: 'twitter-url',
          },
          {
            name: 'twitter:title',
            content: obj?.twitterTitle || obj?.title,
            id: 'twitter-title',
          },
          {
            name: 'twitter:description',
            content: obj?.twitterDescription || obj?.description,
            id: 'twitter-description',
          },
          {
            name: 'twitter:image',
            content: obj?.twitterImage || obj?.ogImage,
            id: 'twitter-image',
          },
        ],
      }

      const generatedTags = tags.meta
        .filter(tag => typeof tag.content === 'string')
        .filter(tag => !document.getElementById(tag.id))
        .map((tag) => {
          const meta = document.createElement('meta');
          Object.entries(tag).forEach(([key, value]) => {
            meta.setAttribute(key, value);
          })
          return meta;
        })

      head.append(...generatedTags);

      document.title = obj?.title || props.config?.name || "Fable Docs"

      flagRef.current = true
    };

    const generateFavicons = (config) => {
      const favicons = [
        { rel: 'icon', type: 'image/png', sizes: '16x16', key: 'iconUrl', id: 1 },
        { rel: 'icon', type: 'image/png', sizes: '32x32', key: 'iconUrl', id: 2 },
        { rel: 'mask-icon', sizes: '32x32', key: 'maskIcon', id: 4 },
        { rel: 'shortcut icon', key: 'iconUrl', id: 7 },
      ]

      const createElement = (tag, attributes) => {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'key') {
            element.setAttribute(key, value);
          }
        });
        return element;
      };

      const generatedFavicons = favicons
      console.log(props.config, config)
        .map((favicon) => {
          if (config?.favicons?.[favicon.key]) {
            const sizes = favicon.sizes;
            let href = ''

            if (typeof config.favicons[favicon.key] === 'string')
              href = config.favicons[favicon.key];
            else
              href = config.favicons[favicon.key]?.[sizes] || config.favicons[favicon.key]?.['16x16'] || '';

            const link = createElement('link', { ...favicon, href });
            return link;
          }
          return null;
        })
        .filter(Boolean)

      document.head.append(...generatedFavicons)
    }

    generateHeadTag(props.frontmatter)
    generateFavicons(props.config)
  }, [props.frontmatter, props.config])

  return (
    <>
      {props.children}
    </>
  )
}
