import React from 'react'
import Header from './components/header'

export default function Layout(props) {
  return (
    <>
      <Header props={props.config.props.header} />
      <div>
        {/* <Sidepanel theme={config.theme} links={SidpanelLinks} /> */}
        <main>
          {props.children}
        </main>
      </div>
      {/* <Footer /> */}
    </>

  )
}