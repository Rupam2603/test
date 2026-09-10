import React, { useState } from 'react'
import { APP_QUICK_FILTERS, APP_VISUAL_CATEGORIES } from '../../data/appCatalog'

export function AppCategorySection({ onSelectCategory }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const handleFilterClick = (id) => {
    setActiveFilter(id)
    if (onSelectCategory) onSelectCategory(id)
  }

  return (
    <div className="app-categories-wrapper">
      {/* Quick Icon Strip (Image 1) */}
      <div className="app-quick-filter-strip">
        <div className="app-quick-filter-scroll">
          {APP_QUICK_FILTERS.map(f => {
            const isActive = activeFilter === f.id
            return (
              <button
                key={f.id}
                className={`app-filter-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleFilterClick(f.id)}
              >
                <div className="app-filter-icon-box">
                  {f.id === 'all' ? (
                    <span className="app-grid-icon">⊞</span>
                  ) : (
                    <span>{f.icon}</span>
                  )}
                </div>
                <span className="app-filter-label">{f.label}</span>
                {isActive && <div className="app-active-pink-bar"></div>}
              </button>
            )
          })}
        </div>
        <button className="app-strip-arrow-btn" aria-label="Next categories">
          ›
        </button>
      </div>

      {/* Visual Category Grid (Image 2) */}
      <div className="app-visual-category-container">
        <div className="app-visual-category-grid">
          {APP_VISUAL_CATEGORIES.map(cat => (
            <div 
              key={cat.id} 
              className="app-visual-cat-card"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            >
              <div className="app-visual-cat-img-box">
                <img src={cat.image} alt={cat.title} loading="lazy" />
              </div>
              <h4 className="app-visual-cat-title">{cat.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AppCategorySection

