import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

interface CastangiaSharkskinSuitPageProps {
  onBack: () => void;
  onBook: () => void;
}

export const CastangiaSharkskinSuitPage: React.FC<CastangiaSharkskinSuitPageProps> = ({ onBack, onBook }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState('/cas-grey-47667.jpg');

  // Hidden tags for potential backend/search use
  const productTags = [
    'Castangia', 'Suit', 'Grey', 'Sharkskin', 'Super 180s', 'Wool', 'Business', 'Formal', 'Y211/133'
  ];

  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24" data-tags={productTags.join(', ')}>
      
      {/* Breadcrumbs / Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-8">
        <div className="flex items-center gap-3 text-navy-800/60 font-sans text-[10px] uppercase tracking-[0.2em]">
          <button 
            onClick={onBack}
            className="hover:text-gold-500 transition-colors"
          >
            Collections
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-navy-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Castangia Grey Sharkskin Suit</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Column: Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 flex flex-col gap-6"
          >
            {/* Primary Large Image */}
            <div className="w-full aspect-[3/4] sm:aspect-square lg:aspect-[3/4] bg-white border border-navy-100 relative overflow-hidden group">
              <img 
                src={activeImage} 
                alt="Castangia Grey Sharkskin Suit" 
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              <div 
                className={`aspect-square bg-white border cursor-pointer transition-colors overflow-hidden relative ${activeImage === '/cas-grey-47667.jpg' ? 'border-gold-500 opacity-100' : 'border-navy-100 opacity-60 hover:opacity-100'}`}
                onClick={() => setActiveImage('/cas-grey-47667.jpg')}
              >
                <img 
                  src="/cas-grey-47667.jpg" 
                  alt="Sharkskin Suit Main" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div 
                className={`aspect-square bg-white border cursor-pointer transition-colors overflow-hidden relative ${activeImage === '/cas-grey-47667-details.jpg' ? 'border-gold-500 opacity-100' : 'border-navy-100 opacity-60 hover:opacity-100'}`}
                onClick={() => setActiveImage('/cas-grey-47667-details.jpg')}
              >
                <img 
                  src="/cas-grey-47667-details.jpg" 
                  alt="Sharkskin Texture Details" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Product Details */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-1/2 flex flex-col pt-4 lg:pt-12"
          >
            <div className="border-b border-navy-100 pb-8 mb-8">
              <h2 className="font-serif italic text-xl text-gold-500 mb-3">Castangia</h2>
              <h1 className="font-serif text-4xl md:text-5xl text-navy-900 leading-[1.1] mb-6">
                Grey Sharkskin Suit
              </h1>
              <p className="font-sans text-[13px] tracking-wide text-navy-800/60 uppercase">
                Super 180's Sharkskin
              </p>
            </div>

            <div className="prose prose-sm max-w-none text-navy-800/80 mb-10">
              <p className="font-sans text-[15px] leading-relaxed">
                Command attention with the subtle texture and timeless elegance of sharkskin. This Castangia suit is crafted from premium Super 180's wool, delivering a sophisticated grey hue that is both versatile and distinctive.
              </p>
            </div>

            <div className="mb-12">
              <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] text-navy-900 font-medium mb-4">
                Specifications
              </h3>
              <ul className="space-y-3 font-sans text-[14px] text-navy-800/70">
                <li className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-navy-50">
                  <span className="sm:w-1/3 font-medium text-navy-900 mb-1 sm:mb-0">Style</span>
                  <span>47667/003</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-navy-50">
                  <span className="sm:w-1/3 font-medium text-navy-900 mb-1 sm:mb-0">Fabric</span>
                  <span>Super 180's Sharkskin (Wool)</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-navy-50">
                  <span className="sm:w-1/3 font-medium text-navy-900 mb-1 sm:mb-0">Model</span>
                  <span>Y211/133</span>
                </li>
              </ul>
            </div>

            <div className="mt-auto pt-8 flex gap-4">
              <button 
                onClick={onBook}
                className="flex-1 bg-navy-900 hover:bg-gold-500 text-white transition-colors duration-500 py-4 px-8 font-sans text-[12px] uppercase tracking-[0.2em]"
              >
                Request Fitting
              </button>
              <a 
                href="tel:+13184439200"
                className="flex-[0.5] border border-navy-200 hover:border-gold-300 text-navy-900 hover:text-gold-500 flex items-center justify-center text-center transition-colors duration-500 py-4 px-8 font-sans text-[12px] uppercase tracking-[0.2em]"
              >
                Inquire
              </a>
            </div>
            
            <p className="font-sans text-[10px] uppercase tracking-wider text-navy-800/40 text-center mt-6">
              Complimentary Alterations Included
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
};
