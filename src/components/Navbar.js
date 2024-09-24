import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <div id="nav" > <nav>
    <div id="l-nav">
         <Link to="/">Home</Link>
    <Link to="/contact">Contact</Link>
    </div>
   <div id="r-nav">
   <Link to="/signin">Sign In</Link>
   </div>
  
 
  </nav></div>
  )
}
