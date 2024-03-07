import React, { lazy } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function Layout(props) {
  let [searchParams, setSearchParams] = useSearchParams();
  
  const {
    headerComp: Header, 
    sidepanelComp: Sidepanel, 
    footerComp: Footer,
    tocComp: Toc,
    stickyBannerComp: StickyBanner,
    contentHeaderComp: ContentHeader,
    contentFooterComp: ContentFooter,
  } = props;

  if (searchParams.get('mini')) {
    return (
      <div style={{ maxWidth: '680px' }} className='main-wrapper'>
        <main className='main-con'>
          <div className='content-wrapper'>{props.children}</div> {/* Main Content */}
        </main>
      </div>
    )
  }

  return (
    <div className='con'>
      <Header />
      <div className='main-wrapper'>
        <Toc />
        <main className='main-con'>
          <ContentHeader />
          <div className='content-wrapper'>{props.children}</div> {/* Main Content */}
          <ContentFooter />
        </main>
        <StickyBanner />
        <Sidepanel /> {/* absolutely positioned */}
      </div>
      <Footer />
    </div>
  )
}