import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { addToCart } from '../../store/slices/cartSlice';
import { fetchFeaturedProducts, Product } from '../../store/slices/productSlice';
import ProductCard from '../Product/ProductCard';

const FeaturedProducts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { featuredProducts, isLoading } = useAppSelector(state => state.products);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    dispatch(fetchFeaturedProducts(8));
  }, [dispatch]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === Math.ceil(featuredProducts.length / 4) - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.ceil(featuredProducts.length / 4) - 1 : prevIndex - 1
    );
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-100 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-100 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-2 rounded-full"></div>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-playfair">
              Curated Collection
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
              Handpicked collection of our best-selling ethnic wear
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded-full mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-full w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded-full w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-100 rounded-full filter blur-3xl opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-2 rounded-full"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-playfair">
            Curated Collection
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
            Handpicked collection of our best-selling ethnic wear, crafted with love and attention to detail
          </p>
        </div>

        {/* Products Grid - Desktop */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Products Carousel - Mobile & Tablet */}
        <div className="lg:hidden relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {featuredProducts.map((product) => (
                <div key={product._id} className="w-full flex-shrink-0 px-3">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {(isHovered || window.innerWidth < 1024) && featuredProducts.length > 0 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {[...Array(Math.ceil(featuredProducts.length / 4))].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-purple-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link
            to="/products"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl group"
          >
            <span className="mr-2">Explore All Collections</span>
            <ShoppingBag className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;