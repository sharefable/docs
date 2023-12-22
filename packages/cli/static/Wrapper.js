import React, { useEffect } from "react";

export default function Wrapper(props) {
  console.log(props.frontmatter)
  console.log(typeof props.frontmatter)
  // useEffect(() => {

  // }, [props])

  return (
    <>
      {props.children}
    </>
  )
}