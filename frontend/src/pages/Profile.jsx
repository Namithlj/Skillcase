import React, { useEffect, useState } from 'react'
import API from '../api/api'
import { useSelector } from 'react-redux'

export default function Profile(){
  const [bookmarks, setBookmarks] = useState([])
  const [status, setStatus] = useState('idle')
  const [uploads, setUploads] = useState([])
  const [form, setForm] = useState({ title: '', file_path: '', external_url: '' })
  const [uploading, setUploading] = useState(false)
  const auth = useSelector(s => s.auth)
  const fileInputRef = React.useRef(null)

  useEffect(()=>{
    let mounted = true
    setStatus('loading')
    API.get('/videos/bookmarks').then(r=>{ if(mounted){ setBookmarks(r.data); setStatus('succeeded') } }).catch(e=>{ if(mounted){ setStatus('failed') } })
    return ()=> mounted = false
  },[])

  useEffect(()=>{
    let mounted = true
    API.get('/uploads').then(r=>{ if(mounted){ setUploads(r.data); if(r.data[0]) setForm(f => ({ ...f, file_path: r.data[0].file_path })) } }).catch(()=>{})
    return ()=> mounted = false
  },[])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!auth.user) return window.location = '/login'
    try{
      const rawExternal = form.external_url && form.external_url.trim() ? form.external_url.trim() : ''
      function convertDriveShareToDirect(url){
        if (!url) return url;
        const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (m1 && m1[1]) return `https://drive.google.com/uc?export=download&id=${m1[1]}`;
        const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (m2 && m2[1]) return `https://drive.google.com/uc?export=download&id=${m2[1]}`;
        return url;
      }
      const chosenExternal = rawExternal ? convertDriveShareToDirect(rawExternal) : '';
      const chosenPath = chosenExternal || form.file_path
      const inferredTitle = form.title || (chosenPath ? chosenPath.split('/').pop() : 'Untitled')
      const payload = chosenExternal ? { title: inferredTitle, external_url: chosenExternal } : { title: inferredTitle, file_path: chosenPath }
      await API.post('/videos', payload)
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Video added — refresh Feed to see it', timeout: 2500 } }))
      setForm({ title: '', file_path: uploads[0]?.file_path || '', external_url: '' })
    }catch(err){
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Add failed', timeout: 2500 } }))
    }
  }

  // handle raw file selection and upload to backend
  async function handleFileSelect(e){
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!auth.user) return window.location = '/login'
    const formData = new FormData();
    formData.append('file', f);
    formData.append('title', form.title || f.name.replace(/\.[^.]+$/, ''));
    try{
      setUploading(true)
      const res = await API.post('/uploads/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      // refresh uploads list
      const list = await API.get('/uploads');
      setUploads(list.data || []);
      setForm(fm => ({ ...fm, file_path: res.data.file_path, title: '' }));
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Upload succeeded', type: 'success' } }))
    }catch(err){
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Upload failed', type: 'error' } }))
    } finally { setUploading(false) }
  }

  const backendOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/,'');

  return (
    <div className="page-content" style={{padding:12}}>
      <h2>Your Bookmarks</h2>
      {status==='loading' && <div>Loading...</div>}
      {status==='succeeded' && bookmarks.length===0 && <div>No bookmarks yet.</div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginTop:12}}>
        {bookmarks.map(v=> (
          <div key={v.id} style={{background:'#0a0a0a',padding:8,borderRadius:8}}>
            <video src={(v.file_path || '').startsWith('http') ? v.file_path : `${backendOrigin}${v.file_path}`} style={{width:'100%',height:140,objectFit:'cover'}} controls />
            <div style={{paddingTop:8}}><strong>{v.title}</strong></div>
          </div>
        ))}
      </div>

      <hr style={{margin:'24px 0'}} />
      <h3>Add a Video</h3>
      {!auth.user && <div>Please <a href="/login">login</a> to add videos.</div>}
      {auth.user && (
        <form onSubmit={handleAdd} style={{display:'grid',gap:8,maxWidth:520}}>
          <label>
            Title
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Optional title" />
          </label>
          <label>
            Google Drive link (paste shareable URL)
            <input value={form.external_url || ''} onChange={e=>setForm(f=>({...f,external_url:e.target.value}))} placeholder="https://drive.google.com/..." />
          </label>
          <div>
            <label style={{display:'block',fontSize:12,opacity:0.9}}>Or upload a raw video from your device</label>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input ref={fileInputRef} type="file" accept="video/*" style={{display:'none'}} onChange={handleFileSelect} />
              <button type="button" className="btn-primary" onClick={()=>fileInputRef.current && fileInputRef.current.click()}>{uploading? 'Uploading...' : 'Choose & Upload'}</button>
              <span className="muted" style={{fontSize:13}}>{uploads.length} local file(s)</span>
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{flex:1}}>
              <label style={{display:'block',fontSize:12,opacity:0.8}}>Or choose a local upload</label>
              <select value={form.file_path} onChange={e=>setForm(f=>({...f,file_path:e.target.value}))} style={{width:'100%'}}>
                <option value="">-- select local file --</option>
                {uploads.map(u=> (
                  <option key={u.id} value={u.file_path}>{u.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button type="submit" className="btn-primary">Add Video</button>
            <button type="button" onClick={()=>{ setForm({ title:'', file_path: uploads[0]?.file_path || '' }) }}>Reset</button>
          </div>
        </form>
      )}
    </div>
  )
}
