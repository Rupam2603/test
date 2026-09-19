import React from 'react'

export function AppServiceCard({ service, onBook }) {
  return (
    <div className="app-catalog-card app-service-card">
      <div className="app-card-media service-media">
        <img src={service.icon} alt={service.name} loading="lazy" />
      </div>
      
      <div className="app-card-content">
        <h3 className="app-card-title">{service.name}</h3>
        <p className="app-card-description">{service.description}</p>
        
        <div className="app-service-meta">
          <span className="app-service-duration">
             {typeof service.duration === 'number' ? `${service.duration} mins` : (service.duration?.includes('min') || service.duration?.includes('hr') || service.duration?.includes('Hour') ? service.duration : `${service.duration} mins`)}
          </span>
          {service.price && <span className="app-card-price">₹{service.price}</span>}
        </div>
        
        <div className="app-card-footer">
          <button 
            className="app-action-btn book-btn"
            onClick={() => onBook ? onBook(service) : alert(`Booked appointment for ${service.name}!`)}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppServiceCard

