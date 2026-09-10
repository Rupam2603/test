import { useState, useEffect } from 'react'

function detectInitialPlatform() {
  if (typeof window === 'undefined') return 'web'
  const urlParams = new URLSearchParams(window.location.search)
  const urlPlatform = urlParams.get('platform')
  if (urlPlatform === 'android_app' || window.isAndroidApp === true) {
    return 'android_app'
  }
  try {
    if (sessionStorage.getItem('subhone_platform') === 'android_app') {
      return 'android_app'
    }
  } catch (e) {
    // Ignore storage exceptions
  }
  return 'web'
}

export function usePlatform() {
  const [platform, setPlatform] = useState(detectInitialPlatform)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const detected = detectInitialPlatform()
    if (detected === 'android_app') {
      setPlatform('android_app')
      try {
        sessionStorage.setItem('subhone_platform', 'android_app')
      } catch (e) {}
      document.body.classList.add('android-app')
      document.body.classList.remove('web-browser')
    } else {
      setPlatform('web')
      document.body.classList.add('web-browser')
      document.body.classList.remove('android-app')
    }
    setLoading(false)
  }, [])

  return { platform, loading, isApp: platform === 'android_app' }
}

export default usePlatform
