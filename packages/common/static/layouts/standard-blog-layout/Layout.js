import React, { lazy } from 'react'

export default function Layout(props) {
  const {
    headerComp: Header, 
    sidepanelComp: Sidepanel, 
    footerComp: Footer,
    tocComp: Toc,
    stickyBannerComp: StickyBanner
  } = props;

  return (
    <div className='con'>
      <Header />
      <div className='main-wrapper'>
        <Toc />
        <main className='main-con'>
          <div>Content Header</div> {/* Content header */}
          <div className='content-wrapper'>{props.children}</div> {/* Main Content */}
          <div>Content Footer</div> {/* Content footer */}
        </main>
        <StickyBanner />
        <Sidepanel /> {/* absolutely positioned */}
      </div>
      <Footer />
    </div>
  )
}