import React from "react"
import './index.css'

export default function Footer(props) {
  const footerLogoUrl = props.props.logo // string
  const copyrightText = props.props.copyright // string
  const links = props.props.link // Array<{ heading: string, links: Array<{title: string, link: string}> }>
  
  return (
    <footer>
      i am footer
    </footer>
  )
}
