import React from 'react'

export default function Layout(props) {
  const {headerComp: Header, sidepanelComp: Sidepanel, footerComp: Footer} = props;

  return (
    <div className='con'>
      <Header />
      <div className='main-wrapper'>
        <Sidepanel />
        <main className='main-con'>
          {props.children}
        </main>
      </div>
      <Footer />
    </div>

  )
}