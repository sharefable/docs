import React from 'react';
import Layout from "./layouts/bundled-layout/Layout";
import Header from "./layouts/bundled-layout/components/header"
import Sidepanel from "./layouts/bundled-layout/components/sidepanel"
import Footer from "./layouts/bundled-layout/components/footer"
import Toc from './layouts/bundled-layout/components/toc';
import StickyBanner from './layouts/bundled-layout/components/stickyBanner';
import ContentHeader from './layouts/bundled-layout/components/contentHeader';
import ContentFooter from './layouts/bundled-layout/components/contentFooter';
import { getBreadcrumb, getNextPage, getPrevPage } from './utils'
import { useSearchParams } from 'react-router-dom'

const LayoutWrapper = (props) => {
  const config = props.config;
  const manifest = props.manifest;
  const sidePanelLinks = props.sidePanelLinks
  const flatLinks = props.flatLinks

  let [searchParams, setSearchParams] = useSearchParams();

  if (searchParams.get('mini') === '1') {
    return (
      <div style={{ maxWidth: '680px' }} className='main-wrapper'>
        <main className='main-con'>
          <div className='content-wrapper'>{props.children}</div> {/* Main Content */}
        </main>
      </div>
    )
  }

  return (
    <Layout
      config={config}
      headerComp={(props) => <Header
        props={config.props.header}
        manifest={manifest}
        config={config}
        {...props}
      />
      }
      sidepanelComp={(props) => <Sidepanel
        manifest={manifest}
        config={config}
        linksTree={sidePanelLinks}
        {...props}
      />
      }
      footerComp={(props) => <Footer
        props={config.props.footer}
        {...props}
      />
      }
      tocComp={(props) => <Toc
        props={config.props.toc}
        toc={props.entry.toc}
        {...props}
      />
      }
      stickyBannerComp={(props) => <StickyBanner
        props={config.props.stickyBanner}
        {...props}
      />
      }
      frontmatter={props.entry.frontmatter}
      toc={props.entry.toc}
      contentHeaderComp={(props) => <ContentHeader
        props={config.props.contentHeader}
        manifest={manifest}
        config={config}
        linksTree={sidePanelLinks}
        flatLinks={flatLinks}
        pathArray={window.location.pathname.split('/')}
        breadcrumb={getBreadcrumb(window.location.pathname.split('/'), flatLinks, config)}
        homeRoute={homeRoute}
        {...props}
      />
      }
      contentFooterComp={(props) => <ContentFooter
        props={config.props.contentFooter}
        manifest={manifest}
        config={config}
        flatLinks={flatLinks}
        linksTree={sidePanelLinks}
        nextPage={getNextPage(flatLinks.findIndex(link => link.url === window.location.pathname), flatLinks)}
        prevPage={getPrevPage(flatLinks.findIndex(link => link.url === window.location.pathname), flatLinks)}
        {...props}
      />
      }
    >
      {props.children}
    </Layout >
  )
}

export default LayoutWrapper