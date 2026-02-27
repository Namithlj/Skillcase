import React, { useEffect, useState } from 'react'

export default function Toast(){
  const [toasts, setToasts] = useState([])

  useEffect(()=>{
    function handler(e){
      const t = { id: Date.now() + Math.random(), message: e.detail?.message || '', type: e.detail?.type || 'info' }
      setToasts(prev => [t, ...prev])
      setTimeout(()=>{ setToasts(prev => prev.filter(x => x.id !== t.id)) }, 2500)
    }
    window.addEventListener('showToast', handler)
    return ()=> window.removeEventListener('showToast', handler)
  },[])

  if (!toasts.length) return null
  return (
    <div style={{position:'fixed',right:16,top:64,zIndex:200,display:'flex',flexDirection:'column',gap:8}}>
      {toasts.map(t=> (
        <div key={t.id} style={{padding:'8px 12px',borderRadius:8,background:t.type==='error'? 'rgba(255,30,30,0.12)':'rgba(0,200,120,0.08)',color:'#fff',backdropFilter:'blur(6px)'}}>{t.message}</div>
      ))}
    </div>
  )
}
