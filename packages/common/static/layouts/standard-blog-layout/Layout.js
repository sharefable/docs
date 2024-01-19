import React, { lazy } from 'react'

export default function Layout(props) {
  const {
    headerComp: Header, 
    sidepanelComp: Sidepanel, 
    footerComp: Footer,
    tocComp: Toc,
  } = props;

  return (
    <div className='con'>
      <Header />
      <div className='main-wrapper'>
        <Sidepanel />
        {props.children}
        {props.config.props.toc.show && <Toc />}
      </div>
      <Footer />
    </div>
  )
}