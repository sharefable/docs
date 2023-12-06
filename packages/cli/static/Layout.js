import React from 'react'
import Header from './components/header'
import Sidepanel from './components/sidepanel'
import sidePanelLinks from "./sidepanel-links.json"

export default function Layout(props) {
  return (
    <>
      <Header props={props.config.props.header} />
      <div>
        <Sidepanel linksTree={sidePanelLinks} />
        <main>
          {props.children}
        </main>
      </div>
      {/* <Footer /> */}
    </>

  )
}