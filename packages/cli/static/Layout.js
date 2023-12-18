import React, { useState } from 'react'
import Header from './components/header'
import Sidepanel from './components/sidepanel'
import sidePanelLinks from "./sidepanel-links.json"

export default function Layout(props) {
  const [showSidePanel, setShowSidePanel] = useState(false)

  const handleShowSidePanel = (updatedShowSidePanel)=>{
    setShowSidePanel(props.config.props.sidepanel.showSidePanel && updatedShowSidePanel)
  }

  return (
    <div className='con'>
      <Header
        showSidePanel={showSidePanel}
        showHamburgerMenu={props.config.props.sidepanel.showSidePanel}
        setShowSidePanel={setShowSidePanel}
        props={props.config.props.header}
      />
      <div className='main-wrapper'>
        <Sidepanel setShowSidePanel={setShowSidePanel} showSidePanel={showSidePanel && props.config.props.sidepanel.showSidePanel} linksTree={sidePanelLinks} />
        <main className='main-con'>
          {props.children}
        </main>
      </div>
      {/* <Footer /> */}
    </div>

  )
}