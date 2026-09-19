import React from 'react'

export function ProductDetails({ product, onBack, onAddToCart }) {

  if (!product) return null

  return (
    <section className="product-details-section">
      <div className="product-details-header">
        <button className="back-btn" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </div>

      <div className="product-details-container">
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
          {product.featurePill && (
            <span className="product-details-pill">{product.featurePill}</span>
          )}
        </div>
        
        <div className="product-details-info">
          <h1 className="product-details-title">{product.name}</h1>
          <p className="product-details-brand">Brand: <span>{product.brand}</span></p>
          
          <div className="product-details-meta">
            <div className="rating-badge"> {product.rating}</div>
            <span className="reviews-count">({product.reviewsCount} reviews)</span>
          </div>

          <div className="product-details-pricing">
            <span className="current-price">₹{product.price}</span>
            {product.mrp && <span className="mrp-price">₹{product.mrp}</span>}
            {product.discount && <span className="discount-tag">{product.discount}</span>}
          </div>

          <p className="product-details-pack">Pack size: {product.pack}</p>

          <div className="product-details-stock">
            <span className="stock-label">Availability: </span>
            <span className={(product.stock !== undefined ? product.stock : 15) > 0 ? "stock-in" : "stock-out"}>
              {(product.stock !== undefined ? product.stock : 15) > 0 ? `${product.stock !== undefined ? product.stock : 15} items in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="product-details-description">
            <h3>About this product</h3>
            <p>{product.details || product.description || 'No description available for this product.'}</p>
          </div>

          <button 
            className="product-details-add-btn" 
            onClick={() => onAddToCart(product)}
            disabled={(product.stock !== undefined ? product.stock : 15) <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  )
}

export default ProductDetails
