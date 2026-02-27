import { createSlice } from '@reduxjs/toolkit'

const raw = typeof window !== 'undefined' ? localStorage.getItem('skillcase_auth') : null
const parsed = raw ? JSON.parse(raw) : null
const initialState = { user: parsed?.user || null, token: parsed?.token || null }

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user
      state.token = action.payload.token
      try { localStorage.setItem('skillcase_auth', JSON.stringify(action.payload)) } catch(e) {}
    },
    clearAuth(state) {
      state.user = null
      state.token = null
      try { localStorage.removeItem('skillcase_auth') } catch(e) {}
    }
  }
})

export const { setAuth, clearAuth } = slice.actions
export default slice.reducer
