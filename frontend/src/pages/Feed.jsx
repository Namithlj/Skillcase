import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUploads, toggleLikeLocal, likeVideo } from '../redux/videosSlice'
import './Feed.css'
import API from '../api/api'

import { motion, AnimatePresence } from 'framer-motion'


function VideoCard({ video, onOpenComments, onActiveChange }){
  const ref = useRef()
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth.token)
  const nav = useNavigate()
  const backendOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

  function convertDriveShareToDirect(url){
    if (!url) return url;
    try{
      // common Drive share formats: /file/d/ID/..., open?id=ID, id=ID
      const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (m1 && m1[1]) return `https://drive.google.com/uc?export=download&id=${m1[1]}`;
      const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (m2 && m2[1]) return `https://drive.google.com/uc?export=download&id=${m2[1]}`;
      return url;
    }catch(e){ return url }
  }

  let src = '';
  if (video.external_url && video.external_url.trim()){
    const u = video.external_url.trim();
    src = (u.startsWith('http') ? convertDriveShareToDirect(u) : u);
  } else {
    const fp = video.file_path || '';
    src = fp.startsWith('http') ? convertDriveShareToDirect(fp) : `${backendOrigin}${fp}`;
  }
  let loadError = false
  useEffect(()=>{
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          el.play().catch((err)=>{ console.warn('play failed', err); });
          if (onActiveChange) onActiveChange(el);
        } else {
          el.pause();
          el.currentTime = 0;
        }
      })
    }, { threshold: 0.75 });
    io.observe(el);
    return () => io.disconnect();
  },[])

  // center click toggles play/pause
  const togglePlay = (e) => {
    e.stopPropagation();
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(()=>{}); else el.pause();
  }

  return (
    <motion.div className="video-card" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.35}}>
      <video
        ref={ref}
        className="video"
        src={src}
        loop
        muted
        playsInline
        onError={(e)=>{ console.error('Video load error', src, e); }}
      />
      <div className="center-toggle" onClick={togglePlay} aria-hidden></div>
      <div className="overlay">
        <div className="actions">
          <button
            className={video.liked? 'liked':''}
            onClick={async (e)=>{
              e.stopPropagation();
              if (!token) return nav('/login');
              // optimistic toggle
              dispatch(toggleLikeLocal(video.id));
              try {
                await dispatch(likeVideo({ id: video.id, token })).unwrap();
              } catch (err) {
                // revert on failure
                dispatch(toggleLikeLocal(video.id));
                alert(err?.response?.data?.error || err?.message || 'Like failed (login required)');
              }
            }}
          >{video.like_count || 0} ❤️</button>
          <button className="add-overlay" onClick={(e)=>{ e.stopPropagation(); if(!token) return nav('/login'); nav('/profile') }}>➕</button>
          <button onClick={(e)=>{ e.stopPropagation(); if(!token) return nav('/login'); onOpenComments && onOpenComments(video); }}>💬</button>
          <button onClick={async (e)=>{ e.stopPropagation(); if(!token) return nav('/login');
            try{
              await API.post(`/videos/${encodeURIComponent(video.id)}/bookmark`);
              window.dispatchEvent(new CustomEvent('showToast',{detail:{message:'Bookmarked', type:'success'}}));
            }catch(err){ window.dispatchEvent(new CustomEvent('showToast',{detail:{message: err?.response?.data?.error || 'Bookmark failed', type:'error'}})) }
          }}>🔖</button>
        </div>
      </div>
      <div className="info-box">
        <div className="info-title">{video.title}</div>
        <div className="info-meta">Uploaded by • {video.uploader_name || 'Creator'}</div>
      </div>
    </motion.div>
  )
}

export default function Feed(){
  const dispatch = useDispatch();
  const videos = useSelector(s => s.videos.list);
  const status = useSelector(s => s.videos.status);
  const [activeCommentsFor, setActiveCommentsFor] = useState(null)
  const [activeEl, setActiveEl] = useState(null)

  const openComments = (video) => setActiveCommentsFor(video)
  const closeComments = () => setActiveCommentsFor(null)

  useEffect(()=>{ dispatch(fetchUploads()) },[dispatch]);

  useEffect(()=>{
    const onKey = (e)=>{
      if (e.code === 'Space'){
        e.preventDefault();
        if (!activeEl) return;
        if (activeEl.paused) activeEl.play().catch(()=>{}); else activeEl.pause();
      }
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[activeEl]);

  return (
    <div className="feed">
      {status==='loading' && <div className="loader">Loading...</div>}
      <AnimatePresence initial={false} mode="wait">
        {videos.map(v => <VideoCard key={v.id} video={v} onOpenComments={openComments} onActiveChange={el=>setActiveEl(el)} />)}
      </AnimatePresence>

      <AnimatePresence>
        {activeCommentsFor && (
          <CommentsSheet video={activeCommentsFor} onClose={closeComments} />
        )}
      </AnimatePresence>
    </div>
  )
}

function CommentsSheet({ video, onClose }){
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  useEffect(()=>{
    let mounted = true
    API.get(`/videos/${encodeURIComponent(video.id)}/comments`).then(r=>{ if(mounted) setComments(r.data) }).catch(()=>{})
    return ()=> mounted = false
  },[video.id])

  async function post(){
    try{
      const res = await API.post(`/videos/${encodeURIComponent(video.id)}/comment`, { content: text })
      setComments(prev => [res.data, ...prev])
      setText('')
    }catch(err){ alert(err?.response?.data?.error || 'Comment failed') }
  }

  return (
    <motion.div className="comments-sheet" initial={{y:300, opacity:0}} animate={{y:0, opacity:1}} exit={{y:300, opacity:0}} transition={{type:'spring', stiffness:300, damping:30}}>
      <div className="sheet-header">
        <button onClick={onClose}>Close</button>
        <h3>{video.title}</h3>
      </div>
      <div className="sheet-body">
        <div className="comments-list">
          {comments.map(c=> (
            <div key={c.id} className="comment-item"><strong>{c.username}</strong>: {c.content}</div>
          ))}
        </div>
      </div>
      <div className="sheet-footer">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..." />
        <button onClick={post}>Send</button>
      </div>
    </motion.div>
  )
}
