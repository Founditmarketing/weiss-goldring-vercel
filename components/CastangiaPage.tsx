import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

interface CastangiaPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export const CastangiaPage: React.FC<CastangiaPageProps> = ({ onBack, onNavigate }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);
  }, []);

  const suits = [
    {
      id: 'cst-01',
      title: 'Grey Sharkskin Suit',
      material: "Super 130's Sharkskin (Wool)",
      description: 'Command attention with the subtle texture and timeless elegance of sharkskin. Crafted from premium Super 130\'s wool for a sophisticated grey hue.',
      imageUrl: '/cas-grey-47667.jpg',
      hoverImageUrl: '/cas-grey-47667-details.jpg'
    },
    {
      id: 'cst-02',
      title: 'Navy Blazer',
      material: "Super 130's 100% Wool",
      description: 'A staple for the modern gentleman\'s wardrobe, featuring unparalleled drape and a lightweight feel.',
      imageUrl: '/cas-blazer-48319.jpg',
      hoverImageUrl: '/cas-blazer-48319-details.jpg'
    },
    {
      id: 'cst-03',
      title: 'Navy Suit',
      material: "Super 130's Wool",
      description: 'The cornerstone of classic menswear, featuring unparalleled Italian construction and the luxurious touch of Super 130\'s wool.',
      imageUrl: '/cas-navy-13479.jpg',
      hoverImageUrl: '/cas-navy-13479-details.jpg'
    },
    {
      id: 'cst-04',
      title: 'Black Suit',
      material: "Super 130's Wool",
      description: 'Sleek, powerful, and undeniably elegant. A masterful silhouette cut from ultra-fine Super 130\'s wool for evening events.',
      imageUrl: '/cas-black-49338.jpg',
      hoverImageUrl: '/cas-black-49338-details.jpg'
    },
    {
      id: 'cst-05',
      title: 'Tuxedo',
      material: "Super 130's Wool",
      description: 'Black tie perfection. Arrive in uncompromising style with this Castangia tuxedo for your next gala or formal event.',
      imageUrl: '/cas-tux-13479.jpg',
      hoverImageUrl: '/cas-tux-13479-details.jpg'
    }
  ];

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24">


      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-gold-500 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Castangia</span>
          <h1 className="font-serif text-5xl md:text-6xl text-navy-900 mb-8 leading-[1.1]">
            The Pinnacle of Italian Craftsmanship
          </h1>
          <p className="font-sans text-[15px] md:text-[17px] text-navy-800/70 max-w-2xl mx-auto tracking-wide leading-relaxed">
            Explore our curated selection of Super 130's wool suits, blazers, and formalwear. Each garment is a testament to over a century of uncompromising sartorial excellence.
          </p>
        </motion.div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {suits.map((suit, index) => (
            <motion.div 
              key={suit.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
              onClick={() => {
                if (suit.id === 'cst-01') { 
                  onNavigate('castangia-sharkskin');
                } else if (suit.id === 'cst-02') { 
                  onNavigate('castangia-blazer');
                } else if (suit.id === 'cst-03') {
                  onNavigate('castangia-navy-suit');
                } else if (suit.id === 'cst-04') {
                  onNavigate('castangia-black-suit');
                } else if (suit.id === 'cst-05') {
                  onNavigate('castangia-tuxedo');
                }
              }}
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Transition View */}
              <div className="w-full aspect-[3/4] bg-white border border-navy-100 mb-8 overflow-hidden relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                <img 
                  src={suit.imageUrl} 
                  alt={suit.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-100 group-hover:opacity-0"
                />
                <img 
                  src={suit.hoverImageUrl} 
                  alt={`${suit.title} Details`} 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1">
                <h3 className="font-serif text-2xl text-navy-900 mb-2 leading-snug group-hover:text-gold-500 transition-colors duration-300">
                  {suit.title}
                </h3>
                
                <p className="font-sans text-[12px] italic tracking-wide text-navy-800/60 mb-4">
                  {suit.material}
                </p>

                <p className="font-sans text-[14px] text-navy-800/70 leading-relaxed mb-8 flex-1">
                  {suit.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-navy-100 flex items-center justify-between">
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-medium text-navy-900 border-b border-transparent group-hover:border-gold-500 group-hover:text-gold-500 transition-all duration-300 pb-1">
                    View Details
                  </span>
                  <div className="w-8 h-[1px] bg-navy-200 group-hover:bg-gold-500 transition-colors duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
