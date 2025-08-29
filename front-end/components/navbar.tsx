"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Assuming you might want an Image logo later
import { Menu, Home, Info, FileText, Edit, X, LayoutDashboard, ShieldCheck, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import motion, { AnimatePresence } from "./motion-client";
// TODO: Implement MobileMenu component similar to the example if needed
// import dynamic from 'next/dynamic';
// const MobileMenu = dynamic(() => import('./MobileMenu'));

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile menu
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState<number | null>(null); // For link hover animation

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menu items for this project
  const menuItems = [
    { href: "/about", label: "Hakkımızda", icon: Info },
    { href: "/dashboard", label: "İstatistik Paneli", icon: LayoutDashboard },
    { href: "/admin", label: "Yönetim Paneli", icon: ShieldCheck },
    { href: "/terms", label: "Kullanım Şartları", icon: FileText },
    { href: "/form", label: "Rezervasyon Yap", icon: Edit },
  ];

  return (
    <header
      // Scroll durumuna göre arkaplan ve stil değişimi güncellendi
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      {/* max-w-* kaldırılıp padding ayarlandı, tam genişlik için */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center space-x-2 group">
                <motion.div whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  {/* Logo.png kullanımı */}
                  <div className="relative h-10 w-10">
                    <Image
                      src="/images/logo.png"
                      alt="Halenteck Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </motion.div>
                 <motion.span
                   className="font-semibold text-lg text-slate-300 group-hover:text-white transition-colors duration-300"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.2, duration: 0.5 }}
                 >
                   RotaKapadokya
                   <span className="block text-xs text-cyan-400">Halenteck Hackathon Projesi</span>
                 </motion.span>
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1">
             <div className="flex justify-center space-x-1 lg:space-x-2">
               {menuItems.map((item, index) => (
                 <motion.div
                   key={item.href}
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 * index, duration: 0.4 }}
                   onHoverStart={() => setIsHovered(index)}
                   onHoverEnd={() => setIsHovered(null)}
                 >
                   <Link
                     href={item.href}
                     className="relative flex items-center space-x-1 px-2.5 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 group"
                   >
                     <item.icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors duration-200" />
                     <span>{item.label}</span>
                     {/* Animated underline - Gradient güncellendi */}
                      <motion.span
                       className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400" // Yeni gradient
                       initial={{ scaleX: 0 }}
                       animate={{ scaleX: isHovered === index ? 1 : 0, originX: 0.5 }}
                       transition={{ duration: 0.3, ease: "easeOut" }}
                     />
                   </Link>
                 </motion.div>
               ))}
             </div>
           </nav>

          {/* Right Area: User Profile & Mobile Menu Button */}
          <div className="flex items-center shrink-0 justify-end space-x-3">
            {/* Hotel Profile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex items-center space-x-3 pl-3 border-l border-slate-700"
            >
              <div className="text-right mr-1">
                <p className="text-sm font-medium text-white">Kapadokya Hotel</p>
                <p className="text-xs text-slate-400">Arda</p>
              </div>
              <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-cyan-500/50">
                <Image
                  src="/images/kapadokya.png"
                  alt="Otel Profili"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
            
            {/* Mobile Menu Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              {/* Mobile Profile Button (Only on mobile) */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="md:hidden mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative overflow-hidden rounded-full w-9 h-9"
                >
                  <div className="relative h-7 w-7 rounded-full overflow-hidden">
                    <Image
                      src="/images/kapadokya.png"
                      alt="Otel Profili"
                      fill
                      className="object-cover"
                    />
                  </div>
                </Button>
              </motion.div>
              
              {/* Mobile Menu Button */}
               <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="md:hidden">
                 <Button
                   variant="ghost"
                   size="icon"
                   className="relative overflow-hidden rounded-full w-9 h-9"
                   onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Toggle directly
                 >
                   <AnimatePresence initial={false} mode="wait">
                       <motion.div
                         key={isMobileMenuOpen ? "close" : "menu"} // Key change triggers animation
                         initial={{ rotate: -90, opacity: 0 }}
                         animate={{ rotate: 0, opacity: 1 }}
                         exit={{ rotate: 90, opacity: 0 }}
                         transition={{ duration: 0.2 }}
                       >
                         {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                       </motion.div>
                   </AnimatePresence>
                   <span className="sr-only">Toggle menu</span>
                 </Button>
               </motion.div>
             </motion.div>
          </div>
        </div>
      </div>

       {/* TODO: Implement actual Mobile Menu component based on isMobileMenuOpen state */}
       <AnimatePresence>
         {isMobileMenuOpen && (
             <motion.div
                 // Simple placeholder for mobile menu area
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 // Mobil menü arkaplanı ve border güncellendi
                 className="md:hidden border-t border-slate-700/50 bg-slate-900/95"
             >
                 <nav className="flex flex-col space-y-1 px-2 py-3">
                     {/* Otel profili - mobil */}
                     <div className="flex items-center space-x-3 px-3 py-3 mb-2 border-b border-slate-700/40">
                       <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-cyan-500/50">
                         <Image
                           src="/images/kapadokya.png"
                           alt="Otel Profili"
                           fill
                           className="object-cover"
                         />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-white">Kapadokya Hotel</p>
                         <p className="text-xs text-slate-400">Arda</p>
                       </div>
                     </div>
                     
                     {menuItems.map((item) => (
                         <Link
                             key={item.href}
                             href={item.href}
                             // Mobil menü link renkleri güncellendi
                             className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
                             onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                         >
                             <item.icon className="h-5 w-5 text-slate-400" />
                             <span>{item.label}</span>
                         </Link>
                     ))}
                 </nav>
             </motion.div>
         )}
       </AnimatePresence>
     </header>
   );
 };

 export default Navbar;

 {/* Add this to globals.css if you need the spin-once animation for theme toggle */}
 /*
 @keyframes spin-once {
   from {
     transform: rotate(0deg);
   }
   to {
     transform: rotate(180deg);
   }
 }
 
 .animate-spin-once {
   animation: spin-once 0.3s ease-in-out;
 }
 */ 