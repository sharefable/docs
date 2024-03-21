import React from "react"
import './index.css'

export default function StickyBanner(props) {
  return (
    <div className="sticky-banner-wrapper">
      <div className="sticky-banner-title">{props.props.title}</div>
      <a className="sticky-banner-cta" href={props.props.href}>{props.props.cta}</a>
    </div>
  );
};