import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { addToCart } from '../../store/slices/cartSlice';
import { Product } from '../../store/slices/productSlice';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showQuickView = true, 
  className = '' 
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.variants || product.variants.length === 0) {
      return;
    }

    const firstVariant = product.variants[0];
    
    dispatch(addToCart({
      productId: product._id,
      variantId: firstVariant._id,
      quantity: 1
    }));
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Handle guest wishlist or show login modal
      return;
    }
    
    setIsWishlisted(!isWishlisted);
  };

  const calculateDiscount = () => {
    if (!product.comparePrice || product.basePrice >= product.comparePrice) return 0;
    return Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100);
  };

  const getMinPrice = () => {
    if (!product.variants || product.variants.length === 0) return product.basePrice;
    return Math.min(...product.variants.map(v => v.discountPrice || v.price));
  };

  const getMaxPrice = () => {
    if (!product.variants || product.variants.length === 0) return product.basePrice;
    return Math.max(...product.variants.map(v => v.price));
  };

  const minPrice = getMinPrice();
  const maxPrice = getMaxPrice();
  const discount = calculateDiscount();
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  return (
    <div className={`group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 ${className}`}>
      {/* Product Image */}
      <Link to={`/product/${product.slug || product._id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          <img
            src={primaryImage?.url}
            alt={primaryImage?.alt || product.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                {discount}% OFF
              </div>
            )}
            {product.isNewArrival && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                NEW
              </div>
            )}
            {product.isBestSeller && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                BESTSELLER
              </div>
            )}
            {product.totalStock <= product.lowStockThreshold && product.totalStock > 0 && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                LOW STOCK
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                isWishlisted 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            
            {showQuickView && (
              <Link
                to={`/product/${product.slug || product._id}`}
                className="bg-white/90 hover:bg-white text-gray-700 hover:text-purple-600 p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
              >
                <Eye className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={product.totalStock === 0}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg ${
                product.totalStock === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {product.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {product.totalStock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold">
                Out of Stock
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        {/* Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {product.averageRating.toFixed(1)} ({product.totalReviews})
            </span>
          </div>
          
          {product.category && (
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Product Name */}
        <Link
          to={`/product/${product.slug || product._id}`}
          className="block text-lg font-semibold text-gray-800 hover:text-purple-600 mb-3 line-clamp-2 transition-colors duration-300"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-4">
          {minPrice === maxPrice ? (
            <>
              <span className="text-xl font-bold text-purple-600">
                ₹{minPrice.toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > minPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.comparePrice.toLocaleString()}
                </span>
              )}
            </>
          ) : (
            <span className="text-xl font-bold text-purple-600">
              ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <p className="flex items-center">
            <span className="font-medium">Fabric:</span>
            <span className="ml-2">{product.fabric}</span>
          </p>
          {product.variants && product.variants.length > 0 && (
            <p className="flex items-center">
              <span className="font-medium">Colors:</span>
              <span className="ml-2">{[...new Set(product.variants.map(v => v.color))].length} available</span>
            </p>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;