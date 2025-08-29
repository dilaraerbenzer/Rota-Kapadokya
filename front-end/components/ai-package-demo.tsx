"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface DemoActivity {
  id: string;
  name: string;
  image: string;
  compatibility: number;
  location: string;
}

// personalized-package.tsx'den mock verilere benzer veriler
const demoActivities: DemoActivity[] = [
  {
    id: "a1",
    name: "Şarap Mahzeni Gezisi",
    image: "/images/sarap-mahzen.png",
    compatibility: 91,
    location: "Kapadokya Bağları",
  },
  {
    id: "a2",
    name: "At Binme Turu",
    image: "/images/at-turu.jpg",
    compatibility: 87,
    location: "Kızılçukur Vadisi",
  },
  {
    id: "a3",
    name: "Balon Turu",
    image: "/images/balon-turu.jpg",
    compatibility: 78,
    location: "Göreme",
  },
    {
    id: "a5",
    name: "ATV Safari",
    image: "/images/atv-turu.jpg",
    compatibility: 52,
    location: "Çavuşin",
  },
];

const getCompatibilityStyle = (compatibility: number): { color: string; text: string; badge: string } => {
  if (compatibility >= 80) return { color: 'text-emerald-400', text: 'Mükemmel Uyum', badge: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' };
  if (compatibility >= 60) return { color: 'text-green-400', text: 'Yüksek Uyum', badge: 'bg-green-500/20 border border-green-500/30 text-green-300' };
  if (compatibility >= 40) return { color: 'text-yellow-400', text: 'Orta Uyum', badge: 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' };
  return { color: 'text-orange-400', text: 'Düşük Uyum', badge: 'bg-orange-500/20 border border-orange-500/30 text-orange-300' };
};

export function AiPackageDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % demoActivities.length);
    }, 3500); // Her 3.5 saniyede bir aktivite değiştir

    return () => clearInterval(interval);
  }, []);

  const currentActivity = demoActivities[currentIndex];
  const compatibilityStyle = getCompatibilityStyle(currentActivity.compatibility);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="p-3 bg-slate-800/40 rounded-lg overflow-hidden min-h-[260px] flex flex-col justify-between relative border border-slate-700/50">
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-sm text-white">Önerilen Aktivite</h4>
           <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${compatibilityStyle.badge}`}>
              {compatibilityStyle.text}
            </Badge>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex-grow flex flex-col items-center text-center"
          >
            <div className="relative w-full h-32 sm:h-36 mb-2.5 rounded-md overflow-hidden shadow-inner border border-slate-600/50">
              <Image
                src={currentActivity.image}
                alt={currentActivity.name}
                fill
                className="object-cover opacity-85"
                priority={currentIndex === 0}
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
               <div className="absolute bottom-1.5 right-1.5 flex items-center bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs text-slate-200">
                <MapPin className="h-3 w-3 mr-1 text-cyan-400" />
                {currentActivity.location}
              </div>
            </div>
            <h5 className="font-medium text-base text-white mb-0.5 leading-tight">{currentActivity.name}</h5>

             <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center text-xs ${compatibilityStyle.color}`}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  <span>{currentActivity.compatibility}% Uyumluluk</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 border-slate-700 text-slate-200 text-xs">
                <p>AI analizine göre tercihlerinize uygunluk oranı.</p>
              </TooltipContent>
            </Tooltip>

          </motion.div>
        </AnimatePresence>
         <div className="flex justify-center space-x-1.5 pt-2.5 mt-auto">
            {demoActivities.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full cursor-pointer ${index === currentIndex ? 'bg-cyan-400' : 'bg-slate-600 hover:bg-slate-500'}`}
                initial={{ width: '8px' }}
                animate={{ width: index === currentIndex ? '20px' : '8px' }}
                transition={{ duration: 0.3 }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
      </div>
    </TooltipProvider>
  );
} 