"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Ticket } from 'lucide-react';

interface TourSuggestion {
  id: number;
  title: string;
  image: string;
  description: string;
}

const tourSuggestions: TourSuggestion[] = [
  { id: 1, title: 'Balon Turu', image: '/images/balon-turu.jpg', description: 'Gün doğumu manzarasıyla Kapadokya\'yı keşfedin.' },
  { id: 2, title: 'ATV Safari', image: '/images/atv-turu.jpg', description: 'Vadilerde macera dolu bir sürüş deneyimi.' },
  { id: 3, title: 'Yeraltı Şehri Turu', image: '/images/yeralti.png', description: 'Tarihi yeraltı şehirlerinin gizemini çözün.' },
  { id: 4, title: 'At Turu', image: '/images/at-.jpg', description: "Güzel Atlar Diyarı'nı at sırtında gezin." },
  { id: 5, title: 'Yerel Yemek Atölyesi', image: '/images/yerel-yemek-atolyesi.jpg', description: 'Kapadokya mutfağının sırlarını öğrenin.' },
];

export function AiTourSuggestions() {
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prevIndex) => (prevIndex + 1) % tourSuggestions.length);
    }, 4000); // Her 4 saniyede bir öneri değiştir

    return () => clearInterval(interval);
  }, []);

  const currentSuggestion = tourSuggestions[currentSuggestionIndex];

  return (
    <div className="p-4 bg-slate-800/30 rounded-lg overflow-hidden min-h-[250px] flex flex-col justify-center items-center relative">
       <div className="absolute top-3 right-3 flex items-center text-xs text-cyan-300 bg-cyan-900/50 px-2 py-1 rounded">
        <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
        <span>AI Önerisi</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSuggestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full flex flex-col items-center text-center"
        >
          <div className="relative w-full h-40 sm:h-48 mb-3 rounded-md overflow-hidden shadow-md border border-slate-700/50">
            <Image
              src={currentSuggestion.image}
              alt={currentSuggestion.title}
              layout="fill"
              objectFit="cover"
              className="opacity-90"
              priority={currentSuggestionIndex === 0} // İlk görseli öncelikli yükle
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <h4 className="font-semibold text-base sm:text-lg text-white mb-1">{currentSuggestion.title}</h4>
          <p className="text-xs sm:text-sm text-slate-300 px-2">{currentSuggestion.description}</p>
        </motion.div>
      </AnimatePresence>
       <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 mt-3">
        {tourSuggestions.map((_, index) => (
          <motion.div
            key={index}
            className={`h-1.5 rounded-full ${index === currentSuggestionIndex ? 'bg-cyan-400' : 'bg-slate-600'}`}
            initial={{ width: '8px' }}
            animate={{ width: index === currentSuggestionIndex ? '24px' : '8px' }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
} 