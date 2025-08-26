import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const HeroSection: React.FC = () => {
  const heroSlides = [
    {
      id: 1,
      title: "Navratri Special Collection 2025",
      subtitle: "Divine Elegance for Every Celebration",
      description: "Discover stunning Lehengas & Chaniya Cholis crafted for the festive season",
      image: "https://m.media-amazon.com/images/S/stores-image-uploads-eu-prod/a/AmazonStores/A21TJRUUN4KGV/daade38c88b6be15d7c06ecfbd96f0b1.w1200.h399.jpg",
      cta: "Shop Navratri Collection",
      badge: "Up to 40% OFF",
      link: "/category/navratri-special"
    },
    {
      id: 2,
      title: "Bridal Lehengas Collection",
      subtitle: "Your Dream Wedding Ensemble",
      description: "Exquisite bridal wear with intricate embroidery and luxurious fabrics",
      image: "https://fabja.wordpress.com/wp-content/uploads/2019/11/latest-bridal-lehenga-choli-collection-at-fabja.jpg?w=1568",
      cta: "Explore Bridal Wear",
      badge: "Free Shipping",
      link: "/category/bridal"
    }
  ];

  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Hero Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>

            {/* Content */}
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-2xl text-white z-10">
                {/* Badge */}
                <div className="inline-flex items-center bg-purple-600/90 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {slide.badge}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <h2 className="text-xl md:text-2xl text-purple-200 mb-4 font-light">
                  {slide.subtitle}
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                  {slide.description}
                </p>

                {/* CTA Button */}
                <Link
                  to={slide.link}
                  className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  {slide.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>

                {/* Features */}
                <div className="flex items-center mt-8 space-x-6 text-sm">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-2 fill-current" />
                    <span>4.8+ Rating</span>
                  </div>
                  <div className="h-4 w-px bg-gray-400"></div>
                  <div>🚚 Free Shipping Above ₹1999</div>
                  <div className="h-4 w-px bg-gray-400"></div>
                  <div>🔄 Easy Returns</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide(currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
      >
        <ArrowRight className="w-6 h-6 rotate-180" />
      </button>
      <button
        onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
      >
        <ArrowRight className="w-6 h-6" />
      </button>
    </section>
  );
};

export default HeroSection;