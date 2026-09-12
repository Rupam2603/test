import React from 'react'
import { usePlatform } from '../hooks/usePlatform'

export function ProductCard({ product, onAddToCart, onSelectProduct }) {
  const { isApp } = usePlatform()

  return (
    <div 
      className={`product-card ${isApp ? 'app-card' : 'web-card'} ${onSelectProduct ? 'clickable-card' : ''}`}
      onClick={() => onSelectProduct && onSelectProduct(product)}
      role={onSelectProduct ? 'button' : undefined}
      tabIndex={onSelectProduct ? 0 : undefined}
    >
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-footer">
          <span className="product-price">₹{product.price}</span>
          
          <button 
            className="add-to-cart-btn"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart ? onAddToCart(product) : alert(`Added ${product.name} to cart!`)
            }}
          >
            {isApp ? 'Add' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

