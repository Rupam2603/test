import React from 'react'
import { usePlatform } from './hooks/usePlatform'
import WebInterface from './interfaces/WebInterface'
import AppInterface from './interfaces/AppInterface'
import './index.css'

function App() {
  const { platform, loading, isApp } = usePlatform()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading SubhOne Health...</p>
      </div>
    )
  }

  return isApp ? <AppInterface /> : <WebInterface />
}

export default App
