'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { StarIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'New York, USA',
    image: '/images/user.png',
    text: 'I found my soulmate on LoveConnect! The matching algorithm is incredible and the community is so welcoming.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    location: 'London, UK',
    image: '/images/user.png',
    text: 'The best dating app I\'ve ever used. The interface is beautiful and the features are amazing.',
    rating: 5
  },
  {
    name: 'Emma Wilson',
    location: 'Sydney, Australia',
    image: '/images/user.png',
    text: 'LoveConnect helped me find meaningful connections. I highly recommend it to anyone looking for love.',
    rating: 5
  }
];

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-neutral-900 mb-6">
            Success Stories
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Join thousands of happy couples who found love through LoveConnect.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 lg:p-12">
            <div className="flex items-center justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-6 h-6 text-accent-500 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl lg:text-2xl text-neutral-700 text-center mb-8 leading-relaxed">
              "{testimonials[currentTestimonial].text}"
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <img
                src={testimonials[currentTestimonial].image}
                alt={testimonials[currentTestimonial].name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="font-bold text-neutral-900">{testimonials[currentTestimonial].name}</div>
                <div className="text-neutral-600">{testimonials[currentTestimonial].location}</div>
              </div>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-primary-500' : 'bg-neutral-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
