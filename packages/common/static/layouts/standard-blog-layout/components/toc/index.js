import React from "react"
import './index.css'
import { useApplicationContext } from "../../../../application-context";

export default function Toc(props) {  
  const { config } = useApplicationContext()

  return (
    <aside>hello toc!</aside>
  )
}
