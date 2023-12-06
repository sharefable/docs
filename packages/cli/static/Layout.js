import React, { useState } from 'react'
import Header from './components/header'
import Sidepanel from './components/sidepanel'
import sidePanelLinks from "./sidepanel-links.json"
import './index.css'

export default function Layout(props) {
  const [showSidePanel, setShowSidePanel] = useState(false)

  return (
    <div className='con'>
      <Header
        showSidePanel={showSidePanel}
        setShowSidePanel={setShowSidePanel}
        props={props.config.props.header}
      />
      <div className='main-wrapper'>
        <Sidepanel showSidePanel={showSidePanel} linksTree={sidePanelLinks} />
        <main className='main-con'>
          {props.children}
        </main>
      </div>
      {/* <Footer /> */}
    </div>

  )
}