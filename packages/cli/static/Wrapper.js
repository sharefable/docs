import React, { useEffect } from "react";


export default function Wrapper(props) {
  console.log(props.frontmatter)
  console.log(typeof props.frontmatter)
  useEffect(() => {
    function generateHeadTag(obj) {
      const head = document.head;
      const tags = {
        meta: [
          {
            name: 'description',
            content: obj.description,
          },
          {
            property: 'og:title',
            content: obj.title,
          },
          {
            property: 'og:image',
            content: obj?.url,
          },
          {
            property: 'og:description',
            content: obj.description
          },
          {
            property: 'og:type',
            content: 'website'
          },
          {
            property: 'og:url',
            content: obj?.url
          },
          {
            name: 'twitter:card',
            content: 'summary_large_image'
          },
          {
            property: 'twitter:domain',
            content: obj?.url
          },
          {
            property: 'twitter:url',
            content: obj?.url
          },
          {
            name: 'twitter:title',
            content: obj.title
          },
          {
            name: 'twitter:description',
            content: obj.description
          },
          {
            name: 'twitter:image',
            content: obj?.url
          },
        ],
      }
      const generatedTags = tags.meta.filter(tag => typeof tag.content === 'string').map((tag) => {
        const meta = document.createElement('meta');
        Object.entries(tag).forEach(([key, value]) => {
          meta.setAttribute(key, value);
        })
        return meta;
      })
      console.log(generatedTags)
      head.append(...generatedTags);
    };
    generateHeadTag(props)
  }, [props])

  return (
    <>
      {props.children}
    </>
  )
}
