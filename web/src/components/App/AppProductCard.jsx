import React from 'react'

export function AppProductCard({ product, onAddToCart }) {
  const handleAdd = (e) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    } else {
      alert(`Added ${product.name} to cart!`)
    }
  }

  return (
    <div className="app-deal-product-card">
      {/* Badges Row */}
      <div className="app-deal-badge-row">
        {product.discount && (
          <span className="app-discount-pill-badge">{product.discount}</span>
        )}
        {product.stockBadge && (
          <span className={`app-stock-pill-badge ${product.isLowStock ? 'low-stock' : ''}`}>
            {product.stockBadge}
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="app-deal-image-wrap">
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
          }}
        />
      </div>

      {/* Title */}
      <h3 className="app-deal-title">{product.name}</h3>

      {/* Pack info & Category Tag */}
      <div className="app-deal-meta-row">
        {product.pack && <span className="app-deal-pack-text">{product.pack}</span>}
        {product.tag && <span className="app-deal-tag-pill">{product.tag}</span>}
      </div>

      {/* Price & Plus Add Action Button */}
      <div className="app-deal-footer-row">
        <div className="app-deal-pricing">
          <span className="app-deal-price">₹{product.price}</span>
          {product.mrp && <span className="app-deal-mrp">₹{product.mrp}</span>}
        </div>

        <button 
          className="app-deal-add-plus-btn"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          <span className="app-deal-add-text">ADD</span>
          <span className="app-deal-add-icon">+</span>
        </button>
      </div>
    </div>
  )
}

export default AppProductCard
