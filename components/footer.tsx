'use client'; // Footer bileşenini Client Component olarak işaretliyoruz

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Import motion as named export from the client wrapper
import { motion } from './motion-client';
import { HeartHandshake, Github } from 'lucide-react'; // İkonlar eklendi

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    // Updated background and border colors to match potential new theme
    <footer className="bg-slate-900/50 border-t border-slate-700/50 mt-auto backdrop-blur-sm py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="mb-4 sm:mb-0 flex items-center"
        >
          <div className="relative h-10 w-10 mr-3">
            <Image
              src="/images/logo.png"
              alt="Halenteck Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start">
              <HeartHandshake className="w-4 h-4 mr-2 text-pink-400" />
              <span>Bilkent Üniversitesi Hackathon Projesi - Takım Halenteck</span>
            </p>
            {/* İsteğe bağlı: GitHub repo linki */}
            {/*
            <a
              href="https://github.com/your-repo-link" // GitHub linkini buraya ekleyin
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-cyan-400 transition-colors duration-200 flex items-center justify-center sm:justify-start mt-1"
            >
              <Github className="w-3 h-3 mr-1.5" />
              Projeyi GitHub'da Görüntüle
            </a>
            */}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xs text-slate-500"
        >
          © {currentYear} Halenteck Tüm hakları saklıdır.
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 