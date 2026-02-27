import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearAuth } from '../redux/authSlice'

function Icon({ children, title }){ return <span className="nav-icon" title={title} aria-hidden>{children}</span> }

export default function NavBar(){
  const auth = useSelector(s => s.auth)
  const dispatch = useDispatch()
  return (
    <header className="top-header">
      <div className="header-left">
        <Link to="/" className="header-link"><Icon title="Feed">🏠</Icon></Link>
      </div>
      <div className="header-right">
        {auth.user ? (
          <Link to="/profile" className="header-profile" title="Profile"><Icon>{auth.user.username ? auth.user.username[0].toUpperCase() : 'U'}</Icon></Link>
        ) : (
          <Link to="/login" title="Login"><Icon>🔐</Icon></Link>
        )}
      </div>
    </header>
  )
}
