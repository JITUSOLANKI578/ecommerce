import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Share2, Truck, Shield, RotateCcw, Ruler } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addToCart } from '../store/slices/cartSlice';
import { fetchProductById } from '../store/slices/productSlice';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');


  // Redux: fetch product by id
  const { currentProduct: product, isLoading, error } = useAppSelector(state => state.products);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedSize(product.variants[0].size);
      setSelectedColor(product.variants[0].color);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} />;
  }

  // Remove old useEffect for mock data


  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    dispatch(addToCart({
      product,
      quantity,
      selectedSize,
      selectedColor
    }));
  };

  const calculateDiscount = () => {
    if (!product?.comparePrice || !product?.basePrice) return 0;
    return Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100);
  };

  // Safe access to product properties with fallbacks
  const productImages = product?.images || [];
  const productVariants = product?.variants || [];
  const productTags = product?.tags || [];
  const productSizes = product?.sizes || [];
  const productColors = product?.colors || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={productImages[selectedImage]?.url || '/placeholder-image.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              <div className="flex space-x-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium ml-1">{product.ratings}</span>
                    <span className="text-gray-600 ml-1">({product.reviews} reviews)</span>
                  </div>
                  <button className="flex items-center text-gray-600 hover:text-purple-600">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </button>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl font-bold text-purple-600">
                    ₹{product.discountPrice || product.price}
                  </span>
                  {product.discountPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.price}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                        {calculateDiscount()}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants && product.variants.map((variant, idx) => (
                    <button
                      key={variant._id || idx}
                      onClick={() => {
                        setSelectedSize(variant.size);
                        setSelectedColor(variant.color);
                        setSelectedImage(0);
                      }}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedSize === variant.size
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Color: {selectedColor}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants && product.variants.map((variant, idx) => (
                    <button
                      key={variant._id || idx}
                      onClick={() => {
                        setSelectedColor(variant.color);
                        setSelectedSize(variant.size);
                        setSelectedImage(0);
                      }}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedColor === variant.color
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium px-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="border border-purple-600 text-purple-600 hover:bg-purple-50 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors">
                    <Heart className="w-5 h-5 mr-2" />
                    Wishlist
                  </button>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-green-600 mr-2" />
                    Free shipping above ₹1999
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <RotateCcw className="w-5 h-5 text-blue-600 mr-2" />
                    Easy 7-day return
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-purple-600 mr-2" />
                    Secure payment
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Ruler className="w-5 h-5 text-orange-600 mr-2" />
                    Size guide available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t">
            <div className="container mx-auto px-6 lg:px-8">
              {/* Tab Headers */}
              <div className="flex space-x-8 border-b">
                {['description', 'specifications', 'reviews', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 font-medium text-sm capitalize transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="py-8">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {product.description}
                    </div>
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Fabric:</span>
                          <span className="ml-2 text-gray-600">{product.fabric}</span>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <span className="ml-2 text-gray-600">{product.category}</span>
                        </div>
                        <div>
                          <span className="font-medium">Available Sizes:</span>
                          <span className="ml-2 text-gray-600">{product.sizes.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium">Available Colors:</span>
                          <span className="ml-2 text-gray-600">{product.colors.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl font-bold text-purple-600">{product.ratings}</div>
                        <div>
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(product.ratings)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-gray-600">Based on {product.reviews} reviews</div>
                        </div>
                      </div>
                      {/* Mock reviews */}
                      <div className="space-y-4">
                        <div className="border-b pb-4">
                          <div className="flex items-center mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">Priya S.</span>
                          </div>
                          <p className="text-gray-700">
                            Beautiful lehenga! The quality exceeded my expectations. Perfect for Navratri celebrations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Shipping & Returns</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Shipping Information:</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>Free shipping on orders above ₹1999</li>
                          <li>Standard delivery: 5-7 business days</li>
                          <li>Express delivery: 2-3 business days (additional charges apply)</li>
                          <li>Cash on Delivery available</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Return Policy:</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>7-day return policy</li>
                          <li>Items must be unworn and in original condition</li>
                          <li>Return shipping costs will be borne by customer</li>
                          <li>Refund processed within 5-7 business days</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;