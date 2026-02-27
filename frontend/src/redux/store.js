import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import videosReducer from './videosSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer,
  }
})
