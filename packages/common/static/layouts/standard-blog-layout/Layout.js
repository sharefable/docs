import React from 'react'
import Page from '../../Page';

export default function Layout(props) {
  const {
    headerComp: Header, 
    sidepanelComp: Sidepanel, 
    footerComp: Footer,
    tocComp: Toc,
  } = props;

  return (
    <Page>
    <div className='con'>
      <Header />
      <div className='main-wrapper'>
        <Sidepanel />
        <main className='main-con'>
          {props.children}
        </main>
        <Toc />
      </div>
      <Footer />
    </div>
    </Page>
  )
}