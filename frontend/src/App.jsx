import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import NavBar from './components/NavBar'
import './global.css'

export default function App(){
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Feed/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/profile" element={<Profile/>} />
      </Routes>
    </>
  )
}
