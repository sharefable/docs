import React, { lazy } from 'react'
import MainComponent from './MainComponent';

const LazyMainComponent = lazy(()=> import('./MainComponent'));

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
        <LazyMainComponent>
          {props.children}
        </LazyMainComponent>
        {props.config.props.toc.show && <Toc />}
      </div>
      <Footer />
    </div>
  )
}