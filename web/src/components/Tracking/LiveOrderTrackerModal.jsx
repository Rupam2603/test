import React, { useState, useEffect, useMemo, useRef } from 'react'
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { DEFAULT_HUB_COORDS } from '../../hooks/useCurrentLocation'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API || ''

function PolylineOverlay({ pathCoords, riderCoords }) {
  const map = useMap()
  const lineRef = useRef(null)

  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return

    if (lineRef.current) {
      lineRef.current.setMap(null)
    }

    const polyline = new window.google.maps.Polyline({
      path: [
        { lat: DEFAULT_HUB_COORDS.lat, lng: DEFAULT_HUB_COORDS.lng },
        riderCoords,
        pathCoords
      ],
      geodesic: true,
      strokeColor: '#059669',
      strokeOpacity: 0.85,
      strokeWeight: 5,
      map
    })

    lineRef.current = polyline

    return () => {
      if (lineRef.current) lineRef.current.setMap(null)
    }
  }, [map, pathCoords, riderCoords])

  return null
}

export function LiveOrderTrackerModal({
  isOpen,
  onClose,
  userLocation,
  order = {
    id: 'SO-89240',
    itemsSummary: 'Volini Pain Relief Gel & Dettol Antiseptic Liquid',
    amount: 200,
    etaMins: 8
  }
}) {
  // 10-minute delivery countdown timer (seconds remaining)
  const [secondsLeft, setSecondsLeft] = useState(495) // starts at 8 mins 15s
  const [riderProgress, setRiderProgress] = useState(0.45) // 0 to 1 along path
  const [hasMapError, setHasMapError] = useState(false)

  const customerLocation = useMemo(() => ({
    lat: userLocation?.lat || 22.5535,
    lng: userLocation?.lng || 88.3512
  }), [userLocation])

  // Compute live interpolated rider position between Hub and Customer
  const riderLocation = useMemo(() => {
    const lat = DEFAULT_HUB_COORDS.lat + (customerLocation.lat - DEFAULT_HUB_COORDS.lat) * riderProgress
    const lng = DEFAULT_HUB_COORDS.lng + (customerLocation.lng - DEFAULT_HUB_COORDS.lng) * riderProgress
    return { lat, lng }
  }, [customerLocation, riderProgress])

  const mapCenter = useMemo(() => ({
    lat: (customerLocation.lat + DEFAULT_HUB_COORDS.lat) / 2,
    lng: (customerLocation.lng + DEFAULT_HUB_COORDS.lng) / 2
  }), [customerLocation])

  // Live timer tick and smooth rider movement
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 30) return 30 // keep at arriving stage
        return prev - 1
      })
      setRiderProgress(prev => Math.min(0.92, prev + 0.003))
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen])

  // ESC key to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const distanceKm = Math.max(0.4, (2.1 * (1 - riderProgress))).toFixed(1)

  return (
    <div className="tracker-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tracker-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header HUD Bar */}
        <div className="tracker-hud-header">
          <div className="tracker-brand-badge">
            <span className="pulse-dot"></span>
            <div className="badge-text-group">
              <span className="fast-tag"> 10-MIN EXPRESS DELIVERY</span>
              <h3 className="tracker-heading">Live Order GPS Tracking</h3>
            </div>
          </div>

          <div className="tracker-eta-pill">
            <span className="eta-caption">ESTIMATED ARRIVAL</span>
            <div className="eta-timer-display">
              <span className="timer-digits">{formattedTime}</span>
              <span className="timer-unit">MINS</span>
            </div>
          </div>

          <button type="button" className="tracker-close-btn" onClick={onClose} aria-label="Close live tracker">
            
          </button>
        </div>

        {/* Map View Area */}
        <div className="tracker-map-wrapper">
          {GOOGLE_MAPS_KEY && !hasMapError ? (
            <APIProvider apiKey={GOOGLE_MAPS_KEY} onError={() => setHasMapError(true)}>
              <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={mapCenter}
                defaultZoom={15}
                mapId="DEMO_MAP_ID"
                disableDefaultUI={true}
                zoomControl={true}
                gestureHandling="greedy"
              >
                {/* Pharmacy Hub Marker */}
                <AdvancedMarker position={DEFAULT_HUB_COORDS}>
                  <div className="map-marker-hub" title="SubhOne Express Hub">
                    <span className="marker-icon"></span>
                    <span className="marker-label">Hub #04</span>
                  </div>
                </AdvancedMarker>

                {/* Rider Moving Marker */}
                <AdvancedMarker position={riderLocation}>
                  <div className="map-marker-rider" title="Express Delivery Partner">
                    <div className="rider-scooter-pulse"></div>
                    <span className="rider-avatar-icon"></span>
                    <span className="rider-eta-tag">{formattedTime}</span>
                  </div>
                </AdvancedMarker>

                {/* Customer Exact Location Marker */}
                <AdvancedMarker position={customerLocation}>
                  <div className="map-marker-customer" title="Your Exact Delivery Location">
                    <div className="customer-radar-pulse"></div>
                    <span className="customer-pin-icon"></span>
                    <span className="customer-tag">Delivery Spot</span>
                  </div>
                </AdvancedMarker>

                {/* Polyline Route */}
                <PolylineOverlay pathCoords={customerLocation} riderCoords={riderLocation} />
              </Map>
            </APIProvider>
          ) : (
            /* Fallback Radar Map if Key unavailable or restricted in test */
            <div className="tracker-fallback-map">
              <div className="radar-grid-bg">
                <div className="radar-sweep-beam"></div>
                <div className="radar-concentric-circle c1"></div>
                <div className="radar-concentric-circle c2"></div>
                <div className="radar-concentric-circle c3"></div>

                {/* Route Track line */}
                <div className="fallback-route-track"></div>

                {/* Hub Point */}
                <div className="fallback-hub-point">
                  <span className="fallback-icon"></span>
                  <span className="point-caption">SubhOne Hub</span>
                </div>

                {/* Moving Rider Point */}
                <div 
                  className="fallback-rider-point"
                  style={{
                    left: `${25 + riderProgress * 45}%`,
                    top: `${60 - riderProgress * 25}%`
                  }}
                >
                  <div className="rider-ping"></div>
                  <span className="fallback-icon"></span>
                  <span className="point-caption">Rider ({distanceKm} km)</span>
                </div>

                {/* Customer Point */}
                <div className="fallback-customer-point">
                  <div className="radar-beacon"></div>
                  <span className="fallback-icon"></span>
                  <span className="point-caption">You</span>
                </div>
              </div>
            </div>
          )}

          {/* Floating Live Tracking Metric Card */}
          <div className="tracker-floating-metrics-card">
            <div className="metric-row">
              <div className="metric-col">
                <span className="metric-title">DISTANCE</span>
                <span className="metric-val">{distanceKm} km away</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-col">
                <span className="metric-title">SPEED</span>
                <span className="metric-val">34 km/h (EV)</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-col">
                <span className="metric-title">GUARANTEE</span>
                <span className="metric-val green-text"> On Time (10m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Details: Delivery Partner & Destination */}
        <div className="tracker-footer-dock">
          {/* Driver Card */}
          <div className="tracker-rider-profile">
            <div className="rider-avatar-wrap">
              <img 
                src="/banners/modern_slide4_delivery.jpg" 
                alt="Delivery Partner"
                className="rider-img"
              />
              <span className="rider-online-badge"></span>
            </div>

            <div className="rider-info-col">
              <div className="rider-name-row">
                <h4 className="rider-name">Rajesh Kumar</h4>
                <span className="rider-rating"> 4.9 (1,420 orders)</span>
              </div>
              <p className="rider-vehicle">Electric Scooter • WB 02 AX 8841</p>
              <div className="rider-safety-pills">
                <span className="safety-pill"> Temperature 98.4°F</span>
                <span className="safety-pill"> Insulated Cold Bag</span>
              </div>
            </div>

            <div className="rider-action-group">
              <button 
                type="button" 
                className="rider-call-btn"
                onClick={() => alert('Connecting to Delivery Partner Rajesh (+91 98310 99881)...')}
                title="Call Delivery Partner"
              >
                 Call
              </button>
              <button 
                type="button" 
                className="rider-chat-btn"
                onClick={() => alert('Opening live chat with delivery dispatch...')}
                title="Message Partner"
              >
                 Chat
              </button>
            </div>
          </div>

          {/* Destination & Order Summary strip */}
          <div className="tracker-dest-strip">
            <div className="dest-info">
              <span className="dest-icon"></span>
              <div className="dest-text-wrap">
                <span className="dest-label">EXACT DELIVERY ADDRESS</span>
                <p className="dest-address">{userLocation?.address || 'Park Street, Kolkata, WB 700016'}</p>
              </div>
            </div>
            <div className="order-items-badge">
              <span className="order-no">Order #{order.id}</span>
              <span className="order-items">{order.itemsSummary}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveOrderTrackerModal
