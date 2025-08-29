"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Users, 
  Code, 
  Target, 
  Award, 
  Sparkles, 
  Building, 
  Package, 
  Star, 
  Cpu,
  Map,
  BarChart,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

// Metadata tanımını client component içinde yer almayacak şekilde ayrı bir dosyada yapmalısınız
// Veya metadata.js olarak ayrı bir dosyada tanımlayabilirsiniz

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Dilara Erbenzer",
      role: "Yapay Zeka & Veri Eğitimi",
      avatar: "/images/team/dilara.jpeg", // varsayılan avatar (eğer yoksa)
      color: "from-purple-600 to-blue-600",
      icon: <Cpu className="h-8 w-8 text-purple-300" />,
      skills: [
        { name: "Python", color: "text-blue-400" },
        { name: "Google Colab", color: "text-orange-400" },
        { name: "Veri Analizi", color: "text-green-400" },
        { name: "Makine Öğrenmesi", color: "text-purple-400" }
      ]
    },
    {
      name: "Arda Faruk Yurtbilir",
      role: "Front End & Tasarım & Back End",
      avatar: "/images/team/arda.jpg", // varsayılan avatar (eğer yoksa)
      color: "from-blue-600 to-cyan-600",
      icon: <Code className="h-8 w-8 text-blue-300" />,
      skills: [
        { name: "React", color: "text-cyan-400" },
        { name: "TypeScript", color: "text-blue-400" },
        { name: "UI/UX", color: "text-pink-400" },
        { name: "Next.js", color: "text-white" }
      ]
    },
    {
      name: "Gökay Nuray",
      role: "Back End & Connections",
      avatar: "/images/team/gokay.jpeg", // varsayılan avatar (eğer yoksa)
      color: "from-emerald-600 to-teal-600",
      icon: <Building className="h-8 w-8 text-emerald-300" />,
      skills: [
        { name: "Node.js", color: "text-green-400" },
        { name: "Supabase", color: "text-emerald-400" },
        { name: "API İntegrasyonu", color: "text-yellow-400" },
        { name: "Veritabanı", color: "text-blue-400" }
      ]
    }
  ];

  // Özellikler kısmı
  const features = [
    {
      title: "Yapay Zeka Destekli Öneriler",
      description: "Müşteri profillerini analiz ederek kişiselleştirilmiş tur, etkinlik ve hizmet önerileri.",
      icon: <Sparkles className="h-6 w-6 text-cyan-400" />,
    },
    {
      title: "Otomatik Teklif Oluşturma",
      description: "Müşterilere özel otomatik fiyat teklifleri hazırlama ve gönderme sistemi.",
      icon: <Package className="h-6 w-6 text-purple-400" />,
    },
    {
      title: "İstatistik Paneli",
      description: "Rezervasyonlar, gelirler ve müşteri davranışları hakkında detaylı analizler.",
      icon: <BarChart className="h-6 w-6 text-emerald-400" />,
    },
    {
      title: "Lokasyon Bazlı Öneriler",
      description: "Kapadokya bölgesindeki özel destinasyonlar için akıllı rota planlaması.",
      icon: <Map className="h-6 w-6 text-amber-400" />,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white min-h-screen">
      {/* Hero bölümü */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(51,65,85,0.25),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge
              variant="outline"
              className="inline-block px-4 py-1 text-sm text-cyan-300 border-cyan-500/50 mb-8 bg-cyan-900/20"
            >
              Bilkent Üniversitesi Hackathon Projesi
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="block">Hakkımızda:</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                RotaKapadokya
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Yapay zeka ile güçlendirilmiş, Kapadokya'nın eşsiz güzelliklerini keşfetmenize yardımcı olan yenilikçi turizm platformu.
            </p>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                Her adımda, sana özel bir Kapadokya.
              </span>
          </motion.div>
        </div>
      </div>

      {/* İçerik bölümü */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Misyon ve Vizyon */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 h-full shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
              
              <h2 className="flex items-center text-2xl font-bold mb-6 text-cyan-400">
                <Target className="h-6 w-6 mr-3" /> Projemizin Amacı
              </h2>
              
              <p className="text-slate-300 leading-relaxed mb-6">
                RotaKapadokya, Kapadokya bölgesindeki oteller ve seyahat acentaları için tasarlanmış, yapay zeka destekli bir rezervasyon ve öneri sistemidir. 
              </p>
              
              <p className="text-slate-300 leading-relaxed">
                Projemiz, müşteri profillerini derinlemesine analiz ederek kişiselleştirilmiş öneriler sunar, otomatik teklifler oluşturur ve bölgedeki turizm işletmelerinin operasyonel verimliliğini artırır. Kapadokya'nın eşsiz doğal ve kültürel mirasını ziyaretçilere en iyi şekilde tanıtmayı ve turizm deneyimini zenginleştirmeyi hedefliyoruz.
              </p>
              
              <div className="mt-8 flex items-center">
                <Badge variant="outline" className="text-slate-400 border-slate-700 bg-slate-800/50">
                  Bilkent Hackathon Projesi
                </Badge>
              </div>
            </div>
          </motion.div>
          
          {/* Özellikler Listesi */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 h-full shadow-xl relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
              
              <h2 className="flex items-center text-2xl font-bold mb-6 text-purple-400">
                <Award className="h-6 w-6 mr-3" /> Platform Özellikleri
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                    className="flex flex-col"
                  >
                    <div className="flex items-start mb-2">
                      <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700 mr-3">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed pl-12">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Takım Bölümü */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold inline-flex items-center">
              <GraduationCap className="mr-3 h-8 w-8 text-amber-400" />
              <span>Geliştirici Takım: <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">Halenteck</span></span>
            </h2>
            <p className="text-slate-300 mt-4 max-w-3xl mx-auto">
              Bilkent Üniversitesi öğrencileri tarafından kurulan Halenteck ekibi, RotaKapadokya projesiyle Hackathon'a katılmıştır.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.2) }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-xl h-full group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-10 transition-all duration-300`}></div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-700 mr-4">
                        {member.avatar ? (
                          <Image 
                            src={member.avatar} 
                            alt={member.name} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-white">
                            {member.icon}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{member.name}</h3>
                        <p className="text-sm text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="text-slate-300 text-sm leading-relaxed mt-4">
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill, idx) => (
                          <span key={idx} className={`${skill.color} text-xs font-medium bg-slate-900/70 px-2 py-1 rounded-md`}>
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Teknolojiler Bölümü */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-teal-500/10 to-green-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="flex items-center text-2xl font-bold mb-6 text-teal-400">
                <Code className="h-6 w-6 mr-3" /> Kullanılan Teknolojiler
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <TechBadge name="Next.js" />
                <TechBadge name="React" />
                <TechBadge name="TypeScript" />
                <TechBadge name="Tailwind CSS" />
                <TechBadge name="Supabase" />
                <TechBadge name="Framer Motion" />
                <TechBadge name="OpenAI API" />
                <TechBadge name="Vercel" />
                <TechBadge name="Google Colab" />
              </div>
              
              <p className="text-slate-300 mt-6 leading-relaxed">
                RotaKapadokya, modern web teknolojileri ve yapay zeka kütüphaneleri kullanılarak geliştirilmiş, performans ve kullanıcı deneyimini ön planda tutan bir platformdur. Projemiz, açık kaynak teknolojiler ve bulut tabanlı hizmetlerle desteklenmektedir.
              </p>
            </div>
          </div>
        </motion.div>

        {/* İletişim Bölümü */}
      </div>
    </div>
  );
};

// Teknoloji rozeti bileşeni
const TechBadge = ({ name }) => (
  <motion.div 
    whileHover={{ 
      backgroundColor: "rgba(30, 41, 59, 0.9)",
      borderColor: "rgba(100, 116, 139, 0.6)"
    }}
    transition={{ duration: 0.2 }}
    className="bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-3 flex items-center justify-center"
  >
    <span className="text-white font-medium">{name}</span>
  </motion.div>
);

export default AboutPage;