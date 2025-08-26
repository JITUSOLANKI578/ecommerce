import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      location: 'Mumbai, Maharashtra',
      rating: 5,
      comment: 'Absolutely stunning lehenga! The quality is exceptional and it arrived perfectly packed. Wore it for Navratri and received so many compliments. Ambika has become my go-to for ethnic wear!',
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      product: 'Royal Purple Navratri Lehenga'
    },
    {
      id: 2,
      name: 'Ananya Patel',
      location: 'Ahmedabad, Gujarat',
      rating: 5,
      comment: 'The chaniya choli I ordered was exactly as shown in the pictures. The mirror work is beautiful and the fabric quality is superb. Fast delivery and excellent customer service!',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      product: 'Blue Chaniya Choli Set'
    },
    {
      id: 3,
      name: 'Neha Singh',
      location: 'Delhi, NCR',
      rating: 5,
      comment: 'Ordered my wedding lehenga from Ambika and it was perfect! The embroidery work is intricate and the fit was exactly as per measurements. Thank you for making my special day even more beautiful!',
      image: 'https://images.pexels.com/photos/4974360/pexels-photo-4974360.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      product: 'Elegant Red Bridal Lehenga'
    },
    {
      id: 4,
      name: 'Kavya Reddy',
      location: 'Bangalore, Karnataka',
      rating: 5,
      comment: 'Great variety and amazing quality! I have ordered multiple times from Ambika and have never been disappointed. The customer service is prompt and helpful. Highly recommended!',
      image: 'https://images.pexels.com/photos/4974920/pexels-photo-4974920.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      product: 'Pink Indo-Western Gown'
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Ambika for their ethnic wear needs
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 text-purple-200">
              <Quote className="w-12 h-12" />
            </div>

            {/* Testimonial Content */}
            <div className="text-center">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Comment */}
              <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic">
                "{testimonials[currentTestimonial].comment}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Customer Image */}
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-purple-100"
                />
                
                {/* Customer Details */}
                <div className="text-center md:text-left">
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[currentTestimonial].location}
                  </p>
                  <p className="text-sm text-purple-600 font-medium mt-1">
                    Purchased: {testimonials[currentTestimonial].product}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-purple-100 hover:bg-purple-200 text-purple-600 p-3 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-purple-100 hover:bg-purple-200 text-purple-600 p-3 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-purple-600' : 'bg-purple-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">10K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">4.8⭐</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">500+</div>
            <div className="text-gray-600">Designs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">99%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;