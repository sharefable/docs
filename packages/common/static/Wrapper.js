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
            content: obj?.ogDescription,
            id: 'og-description',
          },
          {
            property: 'og:title',
            content: obj?.ogTitle,
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
            property: 'twitter:domain',
            content: obj?.twitterDomain,
            id: 'twitter-domain',
          },
          {
            property: 'twitter:url',
            content: obj?.twitterUrl,
            id: 'twitter-url',
          },
          {
            name: 'twitter:title',
            content: obj?.twitterTitle,
            id: 'twitter-title',
          },
          {
            name: 'twitter:description',
            content: obj?.twitterDescription,
            id: 'twitter-description',
          },
          {
            name: 'twitter:image',
            content: obj?.twitterImage,
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

      document.title = obj.title

      flagRef.current = true
    };

    generateHeadTag(props.frontmatter)
  }, [props.frontmatter])

  return (
    <>
      {props.children}
    </>
  )
}