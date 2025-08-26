import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import FeaturedCategories from '../components/Home/FeaturedCategories';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import TestimonialsSection from '../components/Home/TestimonialsSection';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <TestimonialsSection />
    </div>
  );
};

export default Home;