"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Sparkles,
  Users,
  Tag,
  Briefcase,
  Building,
  Bot,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AiPackageDemo } from "@/components/ai-package-demo"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function HomePage() {
  // Daha düzgün mouse hareketi için useMotionValue ve useSpring kullanıyoruz
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Spring efekti ile daha yumuşak hareket
  const springX = useSpring(mouseX, { damping: 50, stiffness: 100 })
  const springY = useSpring(mouseY, { damping: 50, stiffness: 100 })
  
  const [activeFeature, setActiveFeature] = useState(0)
  const [showSplash, setShowSplash] = useState(true)
  
  // Animasyon durumunu izlemek için bu ref'i kullanacağız
  const gradientAnimationActive = useRef(false)

  const features = [
    {
      title: "Yapay Zeka Destekli Öneriler",
      description: "Müşteri profillerini analiz ederek kişiselleştirilmiş tur, etkinlik ve hizmet önerileri sunun.",
      icon: <Sparkles className="h-12 w-12 text-blue-300" />,
      link: "/features/ai-recommendations",
      color: "from-blue-700/50 to-cyan-600/50",
      stats: "Dönüşüm Artışı",
      external: false,
    },
    {
      title: "İstatistik Paneli",
      description: "Rezervasyonlar, gelirler ve müşteri davranışları hakkında detaylı analizlere ulaşın.",
      icon: <LayoutDashboard className="h-12 w-12 text-teal-300" />,
      link: "/dashboard",
      color: "from-teal-700/50 to-green-600/50",
      stats: "Veri Odaklı Kararlar",
      external: false,
    },
    {
      title: "Yönetim Paneli",
      description: "Tüm rezervasyonları, kullanıcıları ve sistem ayarlarını tek bir yerden yönetin.",
      icon: <ShieldCheck className="h-12 w-12 text-amber-300" />,
      link: "/admin",
      color: "from-amber-700/50 to-orange-600/50",
      stats: "Tam Kontrol",
      external: false,
    },
  ]

  // Splash ekranını 3.5 saniye sonra gizlemek için
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3500)
    
    return () => clearTimeout(timer)
  }, [])

  // Mouse hareketi için yeni ve daha iyi yaklaşım
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Çok sık güncelleme yapmamak için eşik değeri
      const threshold = 15;
      const dx = Math.abs(e.clientX - mouseX.get());
      const dy = Math.abs(e.clientY - mouseY.get());
      
      // Sadece belirli bir eşik değerini aştığında güncelle
      if (dx > threshold || dy > threshold) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Arka plan animasyonunu başlat ve sadece bir kez çalıştır
  useEffect(() => {
    // Gradyan animasyonu sadece bir kez başlasın
    if (!gradientAnimationActive.current) {
      gradientAnimationActive.current = true;
    }
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [features.length])

  // Splash ekranı bileşeni
  const SplashScreen = () => (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black"
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: [1, 1, 0]
      }}
      transition={{ 
        duration: 3, 
        times: [0, 0.7, 1] 
      }}
    >
      <div className="flex items-center justify-center">
        {/* Teknopark logosu (soldan gelecek) */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-30 w-60 md:h-36 md:w-72"
        >
          <Image
            src="/images/teknopark.png"
            alt="Teknopark Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
        
        {/* & işareti (ortada) */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-3 md:mx-6"
        >
          <span className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
            &
          </span>
        </motion.div>
        
        {/* Halenteck logosu (sağdan gelecek) */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-24 w-48 md:h-32 md:w-64"
        >
          <Image
            src="/images/logo.png"
            alt="Halenteck Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </div>
      
      {/* Büyüme ve saydamlaşma efekti için arka planda ek bir element */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 5, 10],
          opacity: [0, 0.3, 0]
        }}
        transition={{ 
          duration: 3,
          times: [0, 0.5, 1],
          delay: 1.5
        }}
      />
    </motion.div>
  )

  return (
    <>
      {/* AnimatePresence ve Splash Screen */}
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
          {/* Arkaplan gradyanı - yeniden başlamayan, daha yumuşak hareket eden */}
          <motion.div
            className="absolute inset-0 z-0 opacity-50"
            style={{ 
              x: springX.get() / 100, 
              y: springY.get() / 100 
            }}
          >
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(51,65,85,0.15),transparent_70%)]"
              animate={gradientAnimationActive.current ? {
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              } : {}}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                repeatDelay: 0
              }}
            />
          </motion.div>

          <FloatingElement
            icon={<Building className="h-10 w-10 text-blue-400 opacity-30" />}
            position={{ top: "15%", left: "10%" }}
            duration={10}
          />
          <FloatingElement
            icon={<Tag className="h-8 w-8 text-purple-400 opacity-30" />}
            position={{ bottom: "20%", right: "10%" }}
            duration={12}
          />
          <FloatingElement
            icon={<Sparkles className="h-6 w-6 text-cyan-400 opacity-30" />}
            position={{ top: "20%", right: "15%" }}
            duration={11}
          />
          <FloatingElement
            icon={<LayoutDashboard className="h-9 w-9 text-teal-400 opacity-30" />}
            position={{ top: "35%", right: "25%" }}
            duration={14}
          />
          <FloatingElement
            icon={<Bot className="h-5 w-5 text-gray-400 opacity-20" />}
            position={{ bottom: "30%", left: "25%" }}
            duration={11}
          />
          <FloatingElement
            icon={<ShieldCheck className="h-7 w-7 text-amber-400 opacity-30" />}
            position={{ top: "60%", left: "15%" }}
            duration={13}
          />

          <div className="flex-grow relative z-10 px-4 py-8 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col lg:flex-row items-center justify-between py-16 md:py-24"
            >
              <div className="lg:w-1/2 space-y-6 mb-10 lg:mb-0 text-center lg:text-left">
                <Badge
                  variant="outline"
                  className="px-4 py-1 text-sm text-cyan-300 border-cyan-500/50 animate-pulse bg-cyan-900/20"
                >
                  RotaKapadokya ile Keşfedin ✨
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="block">Yapay Zeka ile</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                    Kapadokya Deneyiminizi Planlayın
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0">
                  RotaKapadokya, oteller ve acentalar için geliştirilmiş yapay zeka destekli platformdur. Müşteri memnuniyetini artırın, gelirinizi optimize edin ve Kapadokya operasyonlarınızı kolaylaştırın.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6 justify-center lg:justify-start">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-600/30 text-white text-xl py-7 px-10 transition-all duration-300 font-bold"
                      style={{ letterSpacing: '0.5px' }}
                    >
                      <Link href="/form" className="flex items-center">
                        <Sparkles className="mr-3 h-6 w-6 animate-pulse" />
                        <span>Rezervasyon Sistemini Dene</span>
                      </Link>
                    </Button>
                  </motion.div>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-800/50 text-xl py-7 px-10 transition-all duration-300 hover:border-cyan-500 hover:text-cyan-200"
                  >
                    <Link href="/about">
                      Daha Fazla Bilgi
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2 relative mt-12 lg:mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-800/30 to-cyan-700/30 rounded-lg blur-2xl opacity-70" />
                  <Card className="bg-slate-800/60 backdrop-blur-lg border-slate-700/50 overflow-hidden relative shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 to-black/30 rounded-lg" />
                    <CardHeader className="relative border-b border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bot className="h-6 w-6 text-cyan-400" />
                          <CardTitle className="text-lg">AI Öneri Paneli (Örnek)</CardTitle>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                          <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative pt-4 px-4 pb-4">
                      <AiPackageDemo />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="py-16"
            >
              <div className="text-center mb-12">
                <Badge
                  variant="outline"
                  className="px-4 py-1 text-sm text-blue-300 border-blue-500/50 mb-4 bg-blue-900/20"
                >
                  PLATFORM ÖZELLİKLERİ
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  RotaKapadokya ile İşletmenizi Güçlendirin
                </h2>
                <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                  Yapay zeka destekli araçlarımızla operasyonel verimliliği artırın, gelirinizi maksimize edin ve Kapadokya misafirlerinize unutulmaz deneyimler sunun.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ y: -8, scale: 1.03 }}
                    className={`h-full transition-all duration-300 rounded-lg ${index === activeFeature ? "ring-2 ring-cyan-500/60 scale-105 shadow-xl shadow-cyan-700/10" : "ring-1 ring-slate-700/50"}`}
                  >
                    <Link
                      href={feature.link}
                      className="h-full block"
                      target={feature.external ? "_blank" : undefined}
                      rel={feature.external ? "noopener noreferrer" : undefined}
                    >
                      <Card className="bg-slate-800/50 backdrop-blur-md border border-transparent h-full transition-all duration-300 hover:bg-slate-800/80 hover:border-slate-700 overflow-hidden shadow-lg flex flex-col">
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-lg opacity-30 group-hover:opacity-40 transition-opacity`} />
                        <CardHeader className="relative pb-3">
                          <div className="flex justify-between items-start">
                            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-700">{feature.icon}</div>
                            <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">{feature.stats}</Badge>
                          </div>
                          <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="relative flex-grow">
                          <p className="text-sm text-slate-300 mb-4">{feature.description}</p>
                        </CardContent>
                        <CardFooter className="relative pt-0 pb-4">
                          <div className="flex items-center text-sm font-medium text-cyan-400 group">
                            <span>{feature.external ? "Ziyaret Et" : "Detayları Keşfet"}</span>
                            {feature.external ? (
                              <ExternalLink className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="my-16"
            >
              <Card className="bg-gradient-to-r from-blue-900/50 via-slate-900/50 to-purple-900/50 backdrop-blur-lg border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.1),_transparent_50%)] opacity-50" />
                <CardContent className="relative p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white">Devrime Katılmaya Hazır mısınız?</h3>
                      <p className="text-slate-300 max-w-xl">
                        Yapay zeka destekli çözümlerimizle işletmenizi nasıl bir üst seviyeye taşıyabileceğinizi keşfedin. Ücretsiz başlayın veya bir demo talep edin.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-600/20 text-white text-lg py-3 px-6 transition-all duration-300 hover:scale-105">
                        <Link href="/register">
                          Ücretsiz Kaydolun
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-800/50 text-lg py-3 px-6 transition-all duration-300 hover:border-cyan-500 hover:text-cyan-200"
                      >
                        <Link href="/demo">
                          Demo Talep Edin
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </TooltipProvider>
    </>
  )
}

function FloatingElement({
  icon,
  position,
  duration,
}: {
  icon: React.ReactNode
  position: React.CSSProperties
  duration: number
}) {
  return (
    <motion.div
      className="absolute z-0"
      style={position}
      animate={{
        y: ["0%", Math.random() > 0.5 ? "15%" : "-15%", "0%"],
        x: ["0%", Math.random() > 0.5 ? "5%" : "-5%", "0%"],
        rotate: [0, Math.random() * 10 - 5, Math.random() * 10 - 5, 0],
        scale: [1, 1.05, 0.95, 1],
      }}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
      }}
    >
      {icon}
    </motion.div>
  )
}