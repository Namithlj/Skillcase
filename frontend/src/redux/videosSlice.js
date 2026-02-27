import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../api/api'

export const fetchUploads = createAsyncThunk('videos/fetchUploads', async () => {
  // Try fetching DB-backed videos. If empty, call seed endpoint to import uploads into DB.
  let res = await API.get('/videos');
  if (Array.isArray(res.data) && res.data.length === 0) {
    // seed from uploads
    const seed = await API.get('/videos/seed/all');
    return seed.data;
  }
  return res.data;
});

export const likeVideo = createAsyncThunk('videos/likeVideo', async ({ id, token }) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await API.post(`/videos/${encodeURIComponent(id)}/like`, {}, { headers });
  return { id, like_count: res.data.like_count };
});

const slice = createSlice({
  name: 'videos',
  initialState: { list: [], status: 'idle' },
  reducers: {
    toggleLikeLocal(state, action) {
      const id = action.payload;
      const v = state.list.find(x => x.id === id);
      if (!v) return;
      v.liked = !v.liked;
      v.like_count = (v.like_count || 0) + (v.liked ? 1 : -1);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUploads.pending, state => { state.status = 'loading' })
      .addCase(fetchUploads.fulfilled, (state, action) => { state.status = 'succeeded'; state.list = action.payload })
      .addCase(fetchUploads.rejected, state => { state.status = 'failed' })
      .addCase(likeVideo.fulfilled, (state, action) => {
        const { id, like_count } = action.payload;
        const v = state.list.find(x => x.id === id);
        if (v) v.like_count = like_count;
      })
      .addCase(likeVideo.rejected, (state, action) => {
        // rejection handled in UI; nothing to do here
      })
  }
})

export const { toggleLikeLocal } = slice.actions
export default slice.reducer
