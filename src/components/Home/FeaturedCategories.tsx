import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const FeaturedCategories: React.FC = () => {
  const categories = [
    {
      id: 1,
      name: 'Lehengas',
      description: 'Elegant traditional wear',
      image: 'https://res.cloudinary.com/dqawfzocy/image/upload/v1754492863/WhatsApp_Image_2025-08-06_at_17.32.12_05f83817_grxelt.jpg',
      link: '/category/lehengas',
      badge: '500+ Designs'
    },
    {
      id: 2,
      name: 'Chaniya Choli',
      description: 'Perfect for Navratri',
      image: 'https://res.cloudinary.com/dqawfzocy/image/upload/v1754492871/WhatsApp_Image_2025-08-06_at_17.32.20_b340c222_kc7dz1.jpg',
      link: '/category/chaniya-choli',
      badge: 'Festival Special'
    },
    {
      id: 3,
      name: 'Gowns',
      description: 'Modern ethnic fusion',
      image: 'https://res.cloudinary.com/dqawfzocy/image/upload/v1754492876/WhatsApp_Image_2025-08-06_at_17.32.27_547156dd_bh2yye.jpg',
      link: '/category/gowns',
      badge: 'Trending Now'
    },
    {
      id: 4,
      name: 'Sarees',
      description: 'Timeless elegance',
      image: 'https://res.cloudinary.com/dqawfzocy/image/upload/v1754492223/WhatsApp_Image_2025-08-06_at_17.32.05_b83d1f6f_n2ibys.jpg',
      link: '/category/sarees',
      badge: 'Premium Collection'
    },
    {
      id: 5,
      name: 'Kurta Sets',
      description: 'Comfortable & stylish',
      image: 'https://res.cloudinary.com/dqawfzocy/image/upload/v1754492846/WhatsApp_Image_2025-08-06_at_17.32.08_6cd198d0_zmfamo.jpg',
      link: '/category/kurta-sets',
      badge: 'Everyday Wear'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full flex justify-between opacity-10">
        <Sparkles className="text-purple-400 w-24 h-24 -ml-6 -mt-6" />
        <Sparkles className="text-purple-400 w-24 h-24 -mr-6 -mt-6 transform rotate-45" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center bg-purple-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Explore Collections
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-playfair">
            Featured Categories
          </h2>
          <div className="w-20 h-1 bg-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our curated collection of ethnic wear, perfect for every occasion and celebration
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {/* Badge */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                {category.badge}
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="font-semibold text-xl mb-1.5 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 mb-3">
                  {category.description}
                </p>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                  <span className="text-sm font-medium">Explore Collection</span>
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link
            to="/categories"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            View All Categories
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;