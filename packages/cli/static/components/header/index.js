import React from "react"
// import './index.css' // TODO Add css loader in webpack config

export default function Header(props) {
  let linkAlignment = 'flex-start'

  switch (props.props.navLinks.alignment) {
    case 'left':
      linkAlignment = 'flex-start'
      break;
    case 'center':
      linkAlignment = 'center'
      break;
    case 'right':
      linkAlignment = 'flex-end'
      break;
    default:
      linkAlignment = 'flex-start'
      break;
  }

  return (
    <header
      className="header-con"
      style={{
        border: '2px solid gray',
        margin: '0px',
        padding: '8px',
        display: 'flex',
        gap: '1rem'
      }}>

      <img
        src={props.props.logo.imageUrl}
        height={20}
      />

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: linkAlignment,
        width: '100%'
      }}>
        {props.props.navLinks.links.map((link, idx) => (
          <a key={idx} href={link.url}>{link.title}</a>
        ))}
      </div>
    </header>
  )
}