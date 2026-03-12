import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

interface CastangiaPageProps {
  onBack: () => void;
}

export const CastangiaPage: React.FC<CastangiaPageProps> = ({ onBack }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);
  }, []);

  const suits = [
    {
      id: 'cst-01',
      title: 'Charcoal Super 130\'s Peak Lapel Suit',
      material: "Super 130's Wool",
      description: 'A masterpiece of Neapolitan tailoring, featuring a decisive peak lapel and half-canvas construction for unparalleled drape.'
    },
    {
      id: 'cst-02',
      title: 'Navy Pinstripe Executive Suit',
      material: "Super 130's Wool",
      description: 'Commanding and elegant. Woven in Biella, Italy, this soft-shouldered suit embodies the pinnacle of board-room sophistication.'
    },
    {
      id: 'cst-03',
      title: 'Midnight Blue Wool Tuxedo',
      material: "Super 130's Wool with Silk Faille",
      description: 'The ultimate expression of formal prestige. Accented with pure silk faille lapels for a softer, more luxurious luster than traditional satin.'
    },
    {
      id: 'cst-04',
      title: 'Heather Gray Birdseye Suit',
      material: "Super 130's Wool",
      description: 'A versatile three-season staple. The intricate birdseye weave provides remarkable depth of color and exceptional wrinkle resistance.'
    },
    {
      id: 'cst-05',
      title: 'Espresso Brown Houndstooth Blazer',
      material: "Super 130's Wool & Silk Blend",
      description: 'A striking statement piece featuring a subtle macro-houndstooth pattern, unlined for effortless layering and breathability.'
    }
  ];

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24">
      {/* Refined Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-12">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-navy-800 hover:text-gold-500 transition-colors duration-300"
        >
          <div className="w-10 h-10 rounded-full border border-navy-200 group-hover:border-gold-300 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-medium">Return</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-serif text-5xl md:text-6xl text-navy-900 mb-8 leading-[1.1]">
            <span className="italic block mb-2 text-gold-500">Castangia</span>
            The Pinnacle of Italian Craftsmanship,<br/>Now In Stock.
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
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Placeholder */}
              <div className="w-full aspect-[3/4] bg-white border border-navy-100 mb-8 overflow-hidden relative shadow-sm group-hover:shadow-xl transition-all duration-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/5 transition-colors duration-500 z-10" />
                <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-navy-800/30">
                  Image Coming Soon
                </span>
                
                {/* Subtle overlay logo for placeholder texture */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                  <span className="font-serif italic text-6xl">C</span>
                </div>
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
