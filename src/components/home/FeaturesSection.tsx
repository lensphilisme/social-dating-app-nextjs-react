'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: HeartIcon,
    title: 'Smart Matching',
    description: 'Our AI-powered algorithm finds compatible matches based on your preferences, interests, and values.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Safe & Secure',
    description: 'Your privacy and safety are our top priorities. All profiles are verified and conversations are encrypted.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: SparklesIcon,
    title: 'Premium Experience',
    description: 'Enjoy a premium dating experience with advanced features, unlimited likes, and priority support.',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Community',
    description: 'Connect with amazing people from around the world. Find love locally or internationally.',
    color: 'from-blue-500 to-cyan-500'
  }
];

export default function FeaturesSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-neutral-900 mb-6">
            Why Choose LoveConnect?
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            We&apos;ve built the most advanced dating platform to help you find meaningful connections 
            and lasting relationships.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-200/50 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
