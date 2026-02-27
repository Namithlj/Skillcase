import React, { useState } from 'react'
import API from '../api/api'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAuth } from '../redux/authSlice'
import '../global.css'

export default function Register(){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()
  const dispatch = useDispatch()
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState(null)

  async function submit(e){
    e.preventDefault()
    try{
      setStatus('loading')
      const res = await API.post('/auth/register', { username, email, password })
      // auto-login: persist token if returned
      if (res.data?.token) {
        dispatch(setAuth(res.data))
        localStorage.setItem('skillcase_auth', JSON.stringify(res.data))
        setMsg({ type: 'success', text: 'Registered and logged in — redirecting...' })
        setStatus('succeeded')
        setTimeout(()=> nav('/'), 900)
        return
      }
      setMsg({ type: 'success', text: 'Registered — please login' })
      setStatus('succeeded')
      setTimeout(()=> nav('/login'), 900)
    }catch(err){
      setStatus('failed')
      setMsg({ type: 'error', text: err?.response?.data?.error || 'Register failed' })
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={submit}>
        <h2>Create account</h2>
        {msg && <div className={msg.type==='error' ? 'error-msg' : 'success-msg'}>{msg.text}</div>}
        <input className="auth-input" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="auth-input" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="auth-input" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" type="submit" disabled={status==='loading'}>{status==='loading' ? 'Registering…' : 'Create account'}</button>
      </form>
    </div>
  )
}
