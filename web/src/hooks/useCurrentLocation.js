import { useState, useEffect, useCallback } from 'react'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API || ''

// Default central hub (Kolkata Central Express Dark Store)
export const DEFAULT_HUB_COORDS = {
  lat: 22.5726,
  lng: 88.3639,
  name: 'SubhOne Express Hub #04',
  address: 'Central Park Street Micro-Fulfillment Center, Kolkata'
}

export function useCurrentLocation() {
  const [location, setLocation] = useState(() => {
    try {
      const cached = sessionStorage.getItem('subhone_user_location')
      if (cached) return JSON.parse(cached)
    } catch {}
    return {
      lat: 22.5535,
      lng: 88.3512,
      address: 'Park Street, Kolkata, WB 700016',
      shortName: 'Park Street, Kolkata',
      pincode: '700016',
      isExact: false,
      accuracyMeters: null,
      loading: false,
      error: null
    }
  })

  const reverseGeocode = async (lat, lng) => {
    if (!GOOGLE_MAPS_KEY) {
      return {
        address: `Near ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Kolkata)`,
        shortName: 'Kolkata Central',
        pincode: '700016'
      }
    }
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`
      )
      if (!res.ok) throw new Error('Geocoding response not ok')
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        const first = data.results[0]
        const formatted = first.formatted_address
        const comp = first.address_components || []
        const route = comp.find(c => c.types.includes('route'))?.long_name || ''
        const streetNumber = comp.find(c => c.types.includes('street_number'))?.long_name || ''
        const sublocality = comp.find(c => c.types.includes('sublocality') || c.types.includes('neighborhood'))?.long_name || ''
        const locality = comp.find(c => c.types.includes('locality'))?.long_name || 'Kolkata'
        const administrativeArea = comp.find(c => c.types.includes('administrative_area_level_1'))?.long_name || 'West Bengal'
        const postal = comp.find(c => c.types.includes('postal_code'))?.long_name || '700016'

        const streetLine = [streetNumber, route].filter(Boolean).join(' ') || sublocality || 'Park Street'
        const short = sublocality ? `${sublocality}, ${locality}` : locality

        return {
          address: formatted,
          shortName: short,
          street: streetLine,
          city: locality,
          state: administrativeArea,
          pincode: postal
        }
      }
    } catch (e) {
      console.warn('Google Reverse Geocoding fallback:', e.message)
    }

    return {
      address: 'Park Street Crossing, Kolkata, West Bengal 700016',
      shortName: 'Park Street, Kolkata',
      street: 'Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016'
    }
  }

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false
      }))
      return
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        const geoInfo = await reverseGeocode(latitude, longitude)
        const newLoc = {
          lat: latitude,
          lng: longitude,
          address: geoInfo.address,
          shortName: geoInfo.shortName,
          street: geoInfo.street,
          city: geoInfo.city,
          state: geoInfo.state,
          pincode: geoInfo.pincode,
          isExact: true,
          accuracyMeters: Math.round(accuracy),
          loading: false,
          error: null
        }
        setLocation(newLoc)
        try {
          sessionStorage.setItem('subhone_user_location', JSON.stringify(newLoc))
          localStorage.setItem('subhone_delivery_address', JSON.stringify(newLoc))
        } catch {}
      },
      (err) => {
        console.warn('Geolocation error:', err.message)
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: err.code === 1 ? 'Location access denied. Using default address.' : 'GPS signal weak. Using default address.'
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }, [])

  const selectAddress = useCallback((addr) => {
    const customLoc = {
      lat: addr.lat || 22.5535,
      lng: addr.lng || 88.3512,
      address: addr.formatted || [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', '),
      shortName: addr.label ? `${addr.label} (${addr.city || 'Kolkata'})` : (addr.city || 'Delivery Address'),
      street: addr.line1 || '',
      city: addr.city || 'Kolkata',
      state: addr.state || 'West Bengal',
      pincode: addr.pincode || '700016',
      isExact: false,
      accuracyMeters: null,
      loading: false,
      error: null
    }
    setLocation(customLoc)
    try {
      sessionStorage.setItem('subhone_user_location', JSON.stringify(customLoc))
      localStorage.setItem('subhone_delivery_address', JSON.stringify(customLoc))
    } catch {}
  }, [])

  // Auto detect once if not already detected
  useEffect(() => {
    if (!location.isExact && !location.error) {
      detectLocation()
    }
  }, [detectLocation])

  return {
    location,
    detectLocation,
    selectAddress,
    setLocation
  }
}

export default useCurrentLocation
