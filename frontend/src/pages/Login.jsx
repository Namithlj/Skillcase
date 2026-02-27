import React, { useState } from 'react'
import API from '../api/api'
import { useDispatch } from 'react-redux'
import { setAuth } from '../redux/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import '../global.css'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const nav = useNavigate()
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState(null)

  async function submit(e){
    e.preventDefault()
    try{
      setStatus('loading')
      const res = await API.post('/auth/login', { email, password })
      dispatch(setAuth(res.data))
      // persist
      localStorage.setItem('skillcase_auth', JSON.stringify(res.data))
      setMsg({ type: 'success', text: 'Logged in — redirecting...' })
      setStatus('succeeded')
      setTimeout(()=> nav('/'), 600)
    }catch(err){
      setStatus('failed')
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Login failed' })
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={submit}>
        <h2>Welcome back</h2>
        {msg && <div className={msg.type==='error' ? 'error-msg' : 'success-msg'}>{msg.text}</div>}
        <input className="auth-input" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="auth-input" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" type="submit" disabled={status==='loading'}>{status==='loading' ? 'Signing in…' : 'Sign in'}</button>
        <div style={{marginTop:12}}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </form>
    </div>
  )
}
