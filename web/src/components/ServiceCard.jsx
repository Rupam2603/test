import React from 'react'
import { usePlatform } from '../hooks/usePlatform'

export function ServiceCard({ service, onBook }) {
  const { isApp } = usePlatform()

  return (
    <div className={`service-card ${isApp ? 'app-card' : 'web-card'}`}>
      <div className="service-icon">
        <img src={service.icon} alt={service.name} loading="lazy" />
      </div>
      
      <div className="service-info">
        <h3 className="service-name">{service.name}</h3>
        <p className="service-description">{service.description}</p>
        <div className="service-meta">
          <span className="service-duration">
             {typeof service.duration === 'number' ? `${service.duration} mins` : (service.duration?.includes('min') || service.duration?.includes('hr') || service.duration?.includes('Hour') ? service.duration : `${service.duration} mins`)}
          </span>
          {service.price && <span className="service-price">₹{service.price}</span>}
        </div>
        
        <button 
          className="book-now-btn"
          onClick={() => onBook ? onBook(service) : alert(`Booked appointment for ${service.name}!`)}
        >
          {isApp ? 'Book' : 'Book Now'}
        </button>
      </div>
    </div>
  )
}

export default ServiceCard

