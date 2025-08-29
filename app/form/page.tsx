"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  CalendarIcon, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  User, 
  Users, 
  Bed, 
  MapPin, 
  Mail, 
  Phone,
  CreditCard,
  Globe,
  Building,
  Palmtree,
  Plane,
  Sparkles,
  Bot,
  Tag,
  ShieldCheck,
  LayoutDashboard,
  Heart,
  Coffee,
  Camera,
  BadgePercent,
  RefreshCw,
  Clock,
  UserCircle2,
  ChevronDown,
  CheckCircle2,
  LucideHeart,
  Cloud, 
Droplets, 
ThermometerSun, 
ThermometerSnowflake
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Schema definition for form validation
const travelerSchema = z.object({
  fullName: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır" }).optional(),
  gender: z.enum(["male", "female"]),
  age: z.string().min(1, { message: "Yaş bilgisi gereklidir" }),
  isMainTraveler: z.boolean().default(false),
});

const formSchema = z.object({
  // Step 1: Personal information
  firstName: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır" }),
  lastName: z.string().min(2, { message: "Soyisim en az 2 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  phone: z.string().min(10, { message: "Geçerli bir telefon numarası giriniz" }),
  country: z.string().min(2, { message: "Ülke giriniz" }),
  city: z.string().min(2, { message: "Şehir giriniz" }),
  idType: z.enum(["tc", "passport"]),
  idNumber: z.string().min(5, { message: "Geçerli bir kimlik numarası giriniz" }),
  
  // Step 2: Trip information
  checkInDate: z.date({ required_error: "Giriş tarihi seçiniz" }),
  checkOutDate: z.date({ required_error: "Çıkış tarihi seçiniz" }),
  adults: z.string().min(1, { message: "Yetişkin sayısı giriniz" }),
  children: z.string().default("0"),
  roomType: z.string({ required_error: "Oda tipi seçiniz" }),
  
  // Step 3: Preferences
  budget: z.string().optional(),
  interests: z.array(z.string()).default([]),
  specialRequests: z.string().optional(),
  additionalPackage: z.boolean().default(false),
  
  // Step 4: Travelers information
  gender: z.enum(["male", "female"]).optional(),
  age: z.string().optional(),
  travelers: z.array(travelerSchema).optional(),
});

export default function CappadociaBookingForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [travelers, setTravelers] = useState([]);
  type WeatherData = {
    date: string;
    day: string;
    icon: string;
    description: string;
    status: string;
    degree: string;
    min: string;
    max: string;
    night: string;
    humidity: string;
  };
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  // Hava durumu tipi tanımı

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "Türkiye",
      city: "",
      idType: "tc",
      idNumber: "",
      adults: "2",
      children: "0",
      roomType: "",
      budget: "standard",
      interests: [],
      specialRequests: "",
      additionalPackage: false,
      gender: "male",
      age: "",
      travelers: [],
    },
  });
  
  // Form watch values
  const additionalPackage = form.watch("additionalPackage");
  const idType = form.watch("idType");
  const adultsCount = parseInt(form.watch("adults") || "1");
  const childrenCount = parseInt(form.watch("children") || "0");
  
  // Mouse movement effect for parallax
  useEffect(() => {
    const handleMouseMove = (e: React.MouseEvent<HTMLElement> | MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  // This effect has been moved to the nextStep function for Step 2
  // to immediately show travelers in Step 2 rather than waiting for effect to run
  
  // Handle next step navigation
  const nextStep = async () => {
    let fieldsToValidate: string[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "email", "phone", "country", "city", "idType", "idNumber"];
    } else if (step === 2) {
      fieldsToValidate = ["checkInDate", "checkOutDate", "adults", "roomType"];
      
      // When continuing from Step 2, update or create travelers based on adults/children counts
      const totalTravelers = adultsCount + childrenCount;
      let newTravelers = [...travelers];
      
      // Initialize or update travelers array right when step 2 is completed
      if (newTravelers.length !== totalTravelers) {
        // Keep existing travelers if possible
        if (newTravelers.length < totalTravelers) {
          // Add new travelers
          for (let i = newTravelers.length; i < totalTravelers; i++) {
            const isAdult = i < adultsCount;
            newTravelers.push({
              id: `traveler-${i + 1}`,
              fullName: i === 0 ? `${form.watch("firstName")} ${form.watch("lastName")}` : "",
              gender: i === 0 ? form.watch("gender") || "male" : "male",
              age: i === 0 ? form.watch("age") || "" : "",
              isMainTraveler: i === 0,
              isAdult: isAdult,
            });
          }
        } else {
          // Remove excess travelers, but keep the main traveler
          newTravelers = newTravelers.slice(0, totalTravelers);
        }
        
        setTravelers(newTravelers);
      }
      
    } else if (step === 3) {
      // Only validate budget if additionalPackage is selected
      fieldsToValidate = additionalPackage ? ["budget"] : [];
    } else if (step === 4) {
      fieldsToValidate = ["gender", "age"];
      
      // Update main traveler info
      const updatedTravelers = [...travelers];
      if (updatedTravelers.length > 0) {
        updatedTravelers[0] = {
          ...updatedTravelers[0],
          fullName: `${form.watch("firstName")} ${form.watch("lastName")}`,
          gender: form.watch("gender") || "male",
          age: form.watch("age") || "",
          isMainTraveler: true,
        };
        setTravelers(updatedTravelers);
      }
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      if (step < 4) {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };
  
  // Handle previous step navigation
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Update travelers information
  const updateTraveler = (index: number, field: string, value: string) => {
    const updatedTravelers = [...travelers];
    if (updatedTravelers[index]) {
      updatedTravelers[index] = { ...updatedTravelers[index], [field]: value };
      setTravelers(updatedTravelers);
    }
  };

  // Hava durumu verilerini çek
  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`/api/weather?city=uçhisar`);
      const data = await response.json();
      if (data && data.result) {
        setWeatherData(data.result || []);
      }
    } catch (error) {
      console.error('Hava durumu alınırken hata oluştu:', error);
    }
  };

  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState("");
  
  // Loading animation messages
  const loadingMessages = [
    { text: "Sizin için en iyi etkinlikleri buluyoruz", icon: <Camera className="text-cyan-400" size={40} /> },
    { text: "Kapadokya'daki özel fırsatlar kontrol ediliyor", icon: <Tag className="text-pink-400" size={40} /> },
    { text: "Yerel deneyimler bulunuyor", icon: <Coffee className="text-amber-400" size={40} /> },
    { text: "Tarihi yerler için gezi rehberi hazırlanıyor", icon: <Building className="text-indigo-400" size={40} /> },
    { text: "Sizin için en uygun tercihleri araştırıyoruz", icon: <Sparkles className="text-purple-400" size={40} /> },
  ];
  
  // Durum ikonunu belirle
const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'clear':
        return <ThermometerSun className="text-yellow-400" size={36} />;
      case 'rainy':
        return <Droplets className="text-blue-400" size={36} />;
      case 'cloudy':
        return <Cloud className="text-gray-400" size={36} />;
      case 'snowy':
        return <ThermometerSnowflake className="text-blue-200" size={36} />;
      default:
        return <Cloud className="text-gray-400" size={36} />;
    }
  };

  // Yükleme ekranı görüntülendiğinde hava durumu verilerini çek
useEffect(() => {
    if (showLoadingScreen) {
      fetchWeatherData();
    }
  }, [showLoadingScreen]);

  // Handle form submission
 // handleSubmit fonksiyonunda yapılacak değişikliklerin ilgili kısmı

const handleSubmit = async () => {
    try {
      const values = form.getValues();
      setIsSubmitting(true);
      
      // Show loading screen if additionalPackage is selected
      if (additionalPackage) {
        setShowLoadingScreen(true);
        
        // Start message rotation
        let messageIndex = 0;
        setCurrentLoadingMessage(loadingMessages[messageIndex].text);
        
        const messageInterval = setInterval(() => {
          messageIndex = (messageIndex + 1) % loadingMessages.length;
          setCurrentLoadingMessage(loadingMessages[messageIndex].text);
        }, 3000);
        
        // Hazırla veriyi API isteği için
        const apiData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          country: values.country,
          city: values.city,
          idType: values.idType,
          idNumber: values.idNumber,
          adults: values.adults,
          children: values.children || "0",
          roomType: values.roomType,
          checkInDate: values.checkInDate,
          checkOutDate: values.checkOutDate,
          budget: values.budget,
          interests: values.interests,
          specialRequests: values.specialRequests,
          gender: values.gender,
          age: values.age,
          travelers: travelers
        };
        
        // API'ye POST isteği gönder
        try {
          const response = await fetch('/api/packages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
          });
          
          if (!response.ok) {
            throw new Error(`API isteği başarısız: ${response.status}`);
          }
          
          // API yanıtını al
          const responseData = await response.json();
          
          // Hava durumu verilerini al
          let weatherData = [];
          try {
            const weatherResponse = await fetch(`/api/weather?city=uçhisar`);
            const weatherResult = await weatherResponse.json();
            if (weatherResult && weatherResult.result) {
              weatherData = weatherResult.result || [];
            }
          } catch (weatherError) {
            console.error('Hava durumu alınırken hata oluştu:', weatherError);
          }
          
          // Recommendation sayfasına yönlendirme
          // Form verileri, API yanıtı ve hava durumu verilerini birlikte gönderiyoruz
          setTimeout(() => {
            clearInterval(messageInterval);
            window.location.href = `/recommendations?data=${encodeURIComponent(JSON.stringify({
              formData: apiData,
              predictResult: responseData,
              weatherData: weatherData
            }))}`;
          }, 8000);
          
        } catch (error) {
          console.error("API hatası:", error);
          // Hata durumunda yine de yönlendir
          setTimeout(() => {
            clearInterval(messageInterval);
            window.location.href = "/recommendations";
          }, 8000);
        }
      } else {
        // API için veriyi hazırla (özel paket olmayan seçenek için)
        const apiData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          country: values.country,
          city: values.city,
          idType: values.idType,
          idNumber: values.idNumber,
          adults: values.adults,
          children: values.children || "0",
          roomType: values.roomType,
          checkInDate: values.checkInDate,
          checkOutDate: values.checkOutDate,
          gender: values.gender,
          age: values.age,
          travelers: travelers
        };
        
        // API'ye POST isteği gönder
        try {
          const response = await fetch('/api/packages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
          });
          
          if (!response.ok) {
            throw new Error(`API isteği başarısız: ${response.status}`);
          }
          
          // API yanıtını al
          const responseData = await response.json();
          
          // Yönlendirme
          setTimeout(() => {
            window.location.href = `/packages?data=${encodeURIComponent(JSON.stringify({
              formData: apiData,
              predictResult: responseData
            }))}`;
          }, 1500);
          
        } catch (error) {
          console.error("API hatası:", error);
          // Hata durumunda yine de yönlendir
          setTimeout(() => {
            window.location.href = "/packages";
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setIsSubmitting(false);
      setShowLoadingScreen(false);
    }
  };
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  const floatingIcons = [
    { icon: <Plane size={30} />, position: { top: "15%", left: "5%" }, duration: 10, color: "text-blue-400" },
    { icon: <Palmtree size={25} />, position: { top: "25%", right: "8%" }, duration: 12, color: "text-cyan-400" },
    { icon: <Camera size={20} />, position: { bottom: "20%", left: "10%" }, duration: 14, color: "text-purple-400" },
    { icon: <Coffee size={18} />, position: { bottom: "35%", right: "12%" }, duration: 11, color: "text-pink-400" },
    { icon: <Heart size={15} />, position: { top: "65%", left: "8%" }, duration: 16, color: "text-red-400" },
    { icon: <Bot size={22} />, position: { top: "40%", right: "15%" }, duration: 13, color: "text-indigo-400" },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      
      {/* Loading overlay for AI recommendations */}
      {showLoadingScreen && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center relative w-3/4 px-6" // max-w-2xl yerine w-3/4 kullanarak ekranın 3/4'ünü kaplar
      >
      {/* Float eden ikonlar */}
      {/* Her mesaj için farklı float ikonları */}
      {loadingMessages.map((message, idx) => (
        <AnimatePresence key={`float-${idx}`}>
          {currentLoadingMessage === message.text && (
            <>
              <motion.div 
                initial={{ opacity: 0, x: -40, y: -20 }}
                animate={{ opacity: 0.6, x: -60, y: -40 }}
                exit={{ opacity: 0, x: -80, y: -60 }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                className="absolute text-blue-400"
              >
                <Camera size={20} />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 40, y: -30 }}
                animate={{ opacity: 0.5, x: 60, y: -50 }}
                exit={{ opacity: 0, x: 80, y: -70 }}
                transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                className="absolute text-purple-400"
              >
                <Sparkles size={18} />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -30, y: 40 }}
                animate={{ opacity: 0.7, x: -50, y: 60 }}
                exit={{ opacity: 0, x: -70, y: 80 }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                className="absolute text-cyan-400"
              >
                <Coffee size={16} />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50, y: 30 }}
                animate={{ opacity: 0.6, x: 70, y: 50 }}
                exit={{ opacity: 0, x: 90, y: 70 }}
                transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                className="absolute text-pink-400"
              >
                <Bot size={22} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      ))}

      <div className="relative w-28 h-28 mb-8">
        {loadingMessages.map((message, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ 
              opacity: currentLoadingMessage === message.text ? 1 : 0,
              scale: currentLoadingMessage === message.text ? 1 : 0.8,
              rotate: currentLoadingMessage === message.text ? 0 : -10
            }}
            transition={{ duration: 0.8 }}
          >
            {message.icon}
          </motion.div>
        ))}
      </div>
      
      {/* Mesaj kutusu */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative p-6 rounded-xl bg-gradient-to-r from-slate-800/80 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 shadow-lg shadow-blue-900/20 mb-8 min-h-[100px] w-full flex items-center justify-center" // min-h-[80px] yerine min-h-[100px] ve w-full ekledim
        >
        {/* Animasyonlu parıltılar */}
        <motion.div 
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            background: [
              "radial-gradient(circle at 30% 40%, rgba(59,130,246,0.1), transparent 70%)",
              "radial-gradient(circle at 70% 60%, rgba(147,51,234,0.1), transparent 70%)",
              "radial-gradient(circle at 30% 40%, rgba(59,130,246,0.1), transparent 70%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />

        {/* Mesaj metni */}
        <div className="h-10 flex items-center justify-center">
          {loadingMessages.map((message) => (
            <motion.p
              key={message.text}
              className="text-2xl font-medium text-white absolute w-full" // text-xl yerine text-2xl yaparak yazıyı büyüttüm
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: currentLoadingMessage === message.text ? 1 : 0,
                y: currentLoadingMessage === message.text ? 0 : 20
              }}
              transition={{ duration: 0.8 }}
            >
              {message.text}
            </motion.p>
          ))}
        </div>
      </motion.div>
      
      <div className="mt-4 flex items-center space-x-2">
        <motion.div
          className="w-3 h-3 rounded-full bg-blue-500"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-purple-500"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-cyan-500"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-pink-500"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
        />
      </div>

            {/* Hava Durumu Gösterimi */}
            {weatherData.length > 0 && (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.25 }}
    className="mt-12 w-full max-w-xl"
  >
    <h3 className="text-center text-cyan-300 mb-4 font-medium text-lg">Uçhisar için 3 Günlük Hava Durumu</h3>
    <div className="grid grid-cols-3 gap-5">
      {weatherData.slice(0, 3).map((weather, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: index * 0.45 + 0.3
          }}
          className="bg-slate-800/80 border border-slate-700 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-900/20 hover:border-cyan-700/40 transition-all"
        >
          <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">{weather.date}</p>
              <h3 className="text-xl font-semibold">{weather.day}</h3>
            </div>
            {getStatusIcon(weather.status)}
          </div>
          
          <div className="p-4">
            <p className="flex items-center justify-center text-cyan-300 text-lg font-medium mb-3">
              {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
            </p>
            
            <div className="bg-slate-700/60 p-3 rounded-lg mb-3">
              <p className="text-slate-400 text-xs mb-1 text-center">Sıcaklık</p>
              <p className="text-2xl font-bold text-center">{weather.degree}°C</p>
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <ThermometerSun size={16} className="text-orange-400 mr-1" />
                <span>Max: <strong>{weather.max}°C</strong></span>
              </div>
              <div className="flex items-center">
                <ThermometerSnowflake size={16} className="text-blue-400 mr-1" />
                <span>Min: <strong>{weather.min}°C</strong></span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)}
          </motion.div>
        </div>
      )}
      {/* Background effects */}
      <motion.div
        className="absolute inset-0 z-0 opacity-50"
        animate={{
          x: mousePosition.x / 100,
          y: mousePosition.y / 100,
        }}
        transition={{ type: "spring", damping: 40 }}
      >
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </motion.div>
      
      {/* Floating Elements */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={`floating-${index}`}
          className={`absolute z-0 ${item.color} opacity-20`}
          style={item.position}
          animate={{
            y: ["0%", Math.random() > 0.5 ? "15%" : "-15%", "0%"],
            x: ["0%", Math.random() > 0.5 ? "5%" : "-5%", "0%"],
            rotate: [0, Math.random() * 10 - 5, Math.random() * 10 - 5, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: item.duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          {item.icon}
        </motion.div>
      ))}
      
      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Header with animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 text-center"
        >
          <Badge
            variant="outline"
            className="px-4 py-1 text-sm text-cyan-300 border-cyan-500/50 mb-3 bg-cyan-900/20 animate-pulse"
          >
            RotaKapadokya ile Keşfedin ✨
          </Badge>
          
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 mb-4">
            Kapadokya Seyahat Rezervasyonu
          </h1>
          
          <p className="text-slate-300 max-w-2xl mx-auto">
            Yapay zeka destekli platformumuz ile unutulmaz bir Kapadokya deneyimi için tüm detayları özelleştirin.
          </p>
          
          {/* Progress header */}
          <div className="mt-10 relative">
            <div className="absolute h-1 bg-slate-700 top-1/2 left-0 right-0 transform -translate-y-1/2 z-0"></div>
            <div className="flex justify-between items-center relative z-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      i === step ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30" : 
                      i < step ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30" : 
                      "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {i < step ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      i
                    )}
                  </motion.div>
                  <span className={`mt-2 text-sm ${
                    i === step ? "font-medium text-cyan-300" : 
                    i < step ? "text-green-400" : "text-slate-400"
                  }`}>
                    {i === 1 ? "Kişisel Bilgiler" : 
                     i === 2 ? "Tatil Detayları" : 
                     i === 3 ? "Tercihler" : 
                     "Müşteri Bilgileri"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Form card with glass effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="backdrop-blur-lg bg-slate-900/60 border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-slate-900/20 rounded-lg"></div>
            <CardContent className="p-6 sm:p-8 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                >
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                          <User className="h-5 w-5 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-200">Kişisel Bilgiler</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">İsim</label>
                          <Input 
                            placeholder="İsminizi girin" 
                            {...form.register("firstName")}
                            className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                          {form.formState.errors.firstName && (
                            <p className="text-sm text-red-400">{form.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">Soyisim</label>
                          <Input 
                            placeholder="Soyisminizi girin" 
                            {...form.register("lastName")}
                            className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                          {form.formState.errors.lastName && (
                            <p className="text-sm text-red-400">{form.formState.errors.lastName.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">E-posta</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input 
                              placeholder="E-posta adresinizi girin" 
                              {...form.register("email")}
                              className="bg-slate-800/80 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          {form.formState.errors.email && (
                            <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">Telefon</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input 
                              placeholder="Telefon numaranızı girin" 
                              {...form.register("phone")}
                              className="bg-slate-800/80 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          {form.formState.errors.phone && (
                            <p className="text-sm text-red-400">{form.formState.errors.phone.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">Ülke</label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input 
                              placeholder="Ülkenizi girin" 
                              {...form.register("country")}
                              className="bg-slate-800/80 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          {form.formState.errors.country && (
                            <p className="text-sm text-red-400">{form.formState.errors.country.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">Şehir</label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input 
                              placeholder="Şehrinizi girin" 
                              {...form.register("city")}
                              className="bg-slate-800/80 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          {form.formState.errors.city && (
                            <p className="text-sm text-red-400">{form.formState.errors.city.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-900/20 border border-blue-900/40 rounded-lg">
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-slate-300">Kimlik Tipi</label>
                          <RadioGroup
                            defaultValue={idType}
                            onValueChange={(value) => form.setValue("idType", value)}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="tc" id="tc" className="border-slate-600 text-blue-500" />
                              <Label htmlFor="tc" className="text-white cursor-pointer">TC Kimlik No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="passport" id="passport" className="border-slate-600 text-blue-500" />
                              <Label htmlFor="passport" className="text-white cursor-pointer">Pasaport No</Label>
                            </div>
                          </RadioGroup>
                          
                          <div className="space-y-2 mt-3">
                            <label className="block text-sm font-medium text-slate-300">
                              {idType === "tc" ? "TC Kimlik Numarası" : "Pasaport Numarası"}
                            </label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                              <Input 
                                placeholder={idType === "tc" ? "11 haneli TC Kimlik numaranızı giriniz" : "Pasaport Numarası"}
                                {...form.register("idNumber")}
                                className="bg-slate-800/80 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            {form.formState.errors.idNumber && (
                              <p className="text-sm text-red-400">{form.formState.errors.idNumber.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Trip Information */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                          <Palmtree className="h-5 w-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-200">Tatil Detayları</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">Giriş Tarihi</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                                {form.watch("checkInDate") ? (
                                  format(form.watch("checkInDate"), "PPP", { locale: tr })
                                ) : (
                                  <span className="text-slate-400">Tarih seçin</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-800 border border-slate-700">
                              <Calendar
                                mode="single"
                                selected={form.watch("checkInDate")}
                                onSelect={(date) => {
                                  form.setValue("checkInDate", date);
                                  // Reset checkout date if it's before checkin
                                  const checkOut = form.watch("checkOutDate");
                                  if (checkOut && date && checkOut <= date) {
                                    form.setValue("checkOutDate", undefined);
                                  }
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="bg-slate-800 text-white border-slate-700"
                              />
                            </PopoverContent>
                          </Popover>
                          {form.formState.errors.checkInDate && (
                            <p className="text-sm text-red-400">{form.formState.errors.checkInDate.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">Çıkış Tarihi</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700 hover:text-white disabled:bg-slate-900 disabled:text-slate-500"
                                disabled={!form.watch("checkInDate")}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
                                {form.watch("checkOutDate") ? (
                                  format(form.watch("checkOutDate"), "PPP", { locale: tr })
                                ) : (
                                  <span className="text-slate-400">Tarih seçin</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-800 border border-slate-700">
                              <Calendar
                                mode="single"
                                selected={form.watch("checkOutDate")}
                                onSelect={(date) => form.setValue("checkOutDate", date)}
                                disabled={(date) => {
                                  const checkIn = form.watch("checkInDate");
                                  return !checkIn || date <= checkIn;
                                }}
                                initialFocus
                                className="bg-slate-800 text-white border-slate-700"
                              />
                            </PopoverContent>
                          </Popover>
                          {!form.watch("checkInDate") && (
                            <p className="text-xs text-amber-400">Önce giriş tarihi seçin.</p>
                          )}
                          {form.formState.errors.checkOutDate && (
                            <p className="text-sm text-red-400">{form.formState.errors.checkOutDate.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">Yetişkin Sayısı</label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Select
                              onValueChange={(value) => form.setValue("adults", value)}
                              defaultValue={form.watch("adults")}
                            >
                              <SelectTrigger className="w-full pl-10 bg-slate-800/80 border-slate-700 text-white focus:ring-blue-500">
                                <SelectValue placeholder="Seçiniz" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <SelectItem key={`adult-${n}`} value={String(n)} className="text-white focus:bg-slate-700 focus:text-white">
                                    {n}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {form.formState.errors.adults && (
                            <p className="text-sm text-red-400">{form.formState.errors.adults.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">Çocuk Sayısı</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Select
                              onValueChange={(value) => form.setValue("children", value)}
                              defaultValue={form.watch("children")}
                            >
                              <SelectTrigger className="w-full pl-10 bg-slate-800/80 border-slate-700 text-white focus:ring-blue-500">
                                <SelectValue placeholder="Seçiniz" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                {[0, 1, 2, 3, 4].map((n) => (
                                  <SelectItem key={`child-${n}`} value={String(n)} className="text-white focus:bg-slate-700 focus:text-white">
                                    {n}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Show customer profiles immediately in Step 2 */}
                      {adultsCount > 0 && (
                        <div className="mt-8 pt-4 border-t border-slate-700/50">
                          <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center">
                            <Users className="h-5 w-5 mr-2 text-cyan-400" />
                            Müşteri Bilgileri Önizleme
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Main customer card */}
                            <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/30 rounded-lg p-4 border border-blue-500/30 shadow-lg shadow-blue-900/5">
                              <div className="flex items-center mb-3">
                                <Avatar className="h-10 w-10 mr-3 bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-indigo-300/50">
                                  <AvatarFallback className="text-white font-medium">
                                    {form.watch("gender") === "male" ? "E" : "K"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-slate-200">
                                    {form.watch("firstName") || "Adınız"} {form.watch("lastName") || "Soyadınız"}
                                  </p>
                                  <p className="text-xs text-slate-400">Ana Müşteri</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional adults */}
                            {Array.from({length: adultsCount - 1}).map((_, index) => (
                              <div key={`adult-preview-${index}`} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                                <div className="flex items-center mb-3">
                                  <Avatar className="h-10 w-10 mr-3 bg-gradient-to-br from-cyan-500 to-blue-500 border-2 border-slate-300/30">
                                    <AvatarFallback className="text-white font-medium">Y{index+2}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-slate-300">Yetişkin {index+2}</p>
                                    <p className="text-xs text-slate-400">Bilgiler son adımda doldurulacak</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Children */}
                            {Array.from({length: childrenCount}).map((_, index) => (
                              <div key={`child-preview-${index}`} className="bg-gradient-to-br from-amber-800/20 to-slate-900/50 rounded-lg p-4 border border-amber-700/30">
                                <div className="flex items-center mb-3">
                                  <Avatar className="h-10 w-10 mr-3 bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-slate-300/30">
                                    <AvatarFallback className="text-white font-medium">Ç{index+1}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-slate-300">Çocuk {index+1}</p>
                                    <p className="text-xs text-slate-400">Bilgiler son adımda doldurulacak</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <p className="text-xs text-slate-400 mt-3">
                            Bu müşteri profilleri son adımda daha detaylı şekilde düzenlenebilecektir.
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Oda Tipi</label>
                        <div className="relative">
                          <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <Select
                            onValueChange={(value) => form.setValue("roomType", value)}
                            defaultValue={form.watch("roomType")}
                          >
                            <SelectTrigger className="w-full pl-10 bg-slate-800/80 border-slate-700 text-white focus:ring-blue-500">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              <SelectItem value="standard" className="text-white focus:bg-slate-700 focus:text-white">
                                <div className="flex items-center space-x-2">
                                  <span>Standart</span>
                                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">En Ekonomik</Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="deluxe" className="text-white focus:bg-slate-700 focus:text-white">
                                <div className="flex items-center space-x-2">
                                  <span>Deluxe</span>
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Popüler</Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="suite" className="text-white focus:bg-slate-700 focus:text-white">
                                <div className="flex items-center space-x-2">
                                  <span>Suit</span>
                                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Premium</Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="family" className="text-white focus:bg-slate-700 focus:text-white">Aile Odası</SelectItem>
                              <SelectItem value="cave" className="text-white focus:bg-slate-700 focus:text-white">
                                <div className="flex items-center space-x-2">
                                  <span>Mağara Oda</span>
                                  <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">Kapadokya Özel</Badge>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {form.formState.errors.roomType && (
                          <p className="text-sm text-red-400">{form.formState.errors.roomType.message}</p>
                        )}
                      </div>
                      
                      <div className="p-5 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-lg mt-4 shadow-lg shadow-indigo-900/5">
                        <div className="flex items-start space-x-4">
                          <div className="mt-0.5">
                            <Checkbox 
                              id="additionalPackage" 
                              checked={additionalPackage}
                              onCheckedChange={(checked) => 
                                form.setValue("additionalPackage", checked === true)
                              }
                              className="border-slate-600 text-blue-500 focus:ring-blue-500 h-5 w-5"
                            />
                          </div>
                          <div>
                            <label 
                              htmlFor="additionalPackage" 
                              className="text-base text-cyan-300 font-medium cursor-pointer flex items-center"
                            >
                              <Sparkles className="h-4 w-4 mr-2 text-cyan-400" />
                              Özel paket ve indirim önerileri istiyorum
                            </label>
                            <p className="text-sm text-slate-300 mt-2">
                              Yapay zeka ile oluşturulan size özel indirimli paketler ve etkinlik önerilerinden yararlanın. 
                              Kapadokya'daki deneyiminizi kişiselleştirin.
                            </p>
                            
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              <div className="flex flex-col items-center bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Tag className="h-5 w-5 text-purple-400 mb-1" />
                                <span className="text-xs text-slate-300 text-center">Sadece sizin için seçilmiş özel fırsatlar.</span>
                              </div>
                              <div className="flex flex-col items-center bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Building className="h-5 w-5 text-blue-400 mb-1" />
                                <span className="text-xs text-slate-300 text-center">Anlık hava durumu ve doluluğa göre öneriler</span>
                              </div>
                              <div className="flex flex-col items-center bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Coffee className="h-5 w-5 text-amber-400 mb-1" />
                                <span className="text-xs text-slate-300 text-center">Benzer Misafir Tercihlerinden Öğrenen Tavsiyeler</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Preferences */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                          <Sparkles className="h-5 w-5 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-200">Tercihleriniz</h2>
                      </div>
                      
                      {additionalPackage ? (
                        <>
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-300">Bütçe Aralığınız</label>
                            <Select
                              onValueChange={(value) => form.setValue("budget", value)}
                              defaultValue={form.watch("budget")}
                            >
                              <SelectTrigger className="w-full bg-slate-800/80 border-slate-700 text-white focus:ring-blue-500">
                                <SelectValue placeholder="Bütçe aralığı seçin" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="economy" className="text-white focus:bg-slate-700 focus:text-white">
                                  <div className="flex items-center">
                                    <span>Ekonomik (0 - 1500 TL)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="standard" className="text-white focus:bg-slate-700 focus:text-white">
                                  <div className="flex items-center">
                                    <span>Standart (1500 - 3500 TL)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="premium" className="text-white focus:bg-slate-700 focus:text-white">
                                  <div className="flex items-center">
                                    <span>Premium (3500 - 7000 TL)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="luxury" className="text-white focus:bg-slate-700 focus:text-white">
                                  <div className="flex items-center">
                                    <span>Lüks (7000+ TL)</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-400">
                              Bütçenize uygun paket ve fırsatlar için tahmini bir aralık seçin
                            </p>
                          </div>
                          
                          <div className="space-y-3 mt-6">
                            <label className="block text-sm font-medium text-slate-300">İlgi Alanlarınız</label>
                            <p className="text-xs text-slate-400">
                              Size en uygun aktiviteleri önerebilmemiz için ilgi alanlarınızı seçin
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                              {[
                                { id: "macera", label: "Macera & Adrenalin", icon: <RefreshCw size={14} /> },
                                { id: "kultur", label: "Kültür & Tarih", icon: <Building size={14} /> },
                                { id: "doga", label: "Doğa & Manzara", icon: <Palmtree size={14} /> },
                                { id: "gastronomi", label: "Gastronomi & Lezzet", icon: <Coffee size={14} /> },
                                { id: "relax", label: "Dinlenme & Spa", icon: <Heart size={14} /> },
                                { id: "eglence", label: "Eğlence & Gece Hayatı", icon: <BadgePercent size={14} /> },
                                { id: "aile", label: "Aile Dostu", icon: <Users size={14} /> },
                                { id: "romantik", label: "Romantik", icon: <LucideHeart size={14} /> },
                                { id: "su", label: "Su Sporları", icon: <Plane size={14} /> },
                              ].map((interest) => (
                                <div
                                  key={interest.id}
                                  className={`
                                    flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200
                                    ${form.watch("interests")?.includes(interest.id) 
                                      ? "bg-blue-900/30 border-blue-500/40 shadow-md" 
                                      : "bg-slate-800/50 border-slate-700 hover:bg-slate-800/80"}
                                  `}
                                  onClick={() => {
                                    const currentInterests = form.watch("interests") || [];
                                    if (currentInterests.includes(interest.id)) {
                                      form.setValue(
                                        "interests",
                                        currentInterests.filter((i) => i !== interest.id)
                                      );
                                    } else {
                                      form.setValue("interests", [...currentInterests, interest.id]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={form.watch("interests")?.includes(interest.id)}
                                    className="border-slate-600 text-blue-500 focus:ring-blue-500 mr-2"
                                    onCheckedChange={() => {}}
                                  />
                                  <div className="flex items-center">
                                    <span className="text-sm text-slate-200 mr-2">{interest.label}</span>
                                    <span className="text-blue-400">{interest.icon}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-6">
                            <label className="block text-sm font-medium text-slate-300">Özel İstekleriniz</label>
                            <Textarea
                              placeholder="Örneğin: Balayı çiftiyiz, vejetaryen yemek tercihi, alerjiler, ulaşım talebi vb."
                              rows={4}
                              {...form.register("specialRequests")}
                              className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="text-xs text-slate-400">
                              Varsa özel durumlarınızı veya taleplerinizi buraya yazabilirsiniz.
                            </p>
                          </div>
                          
                          {/* AI Recommendation Feature */}
                          <div className="p-4 mt-6 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start space-x-4">
                              <div className="p-2 bg-blue-500/20 rounded-full">
                                <Bot className="h-5 w-5 text-cyan-400" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-cyan-300 flex items-center">
                                  <span>Yapay Zeka Önerileri</span>
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-cyan-900/70 text-cyan-300 rounded-full">Yeni</span>
                                </h3>
                                <p className="text-xs text-slate-300 mt-1">
                                  Tercihlerinize göre kişiselleştirilmiş aktivite, konaklama ve gezilecek yer önerileri size sonraki adımda sunulacaktır.
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center p-8 text-center">
                          <div className="p-4 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-full mb-4">
                            <Sparkles className="h-10 w-10 text-slate-400" />
                          </div>
                          <h3 className="text-xl font-medium text-slate-300 mb-3">Özel paket önerisi seçmediniz</h3>
                          <p className="text-slate-400 max-w-lg">
                            Eğer yapay zeka destekli özel paket ve indirim önerileri almak isterseniz, önceki adımda bu seçeneği işaretleyebilirsiniz.
                          </p>
                          <Button
                            onClick={() => {
                              form.setValue("additionalPackage", true);
                              setStep(2);
                            }}
                            variant="outline"
                            className="mt-6 bg-transparent border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            Geri Dön ve Seç
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Step 4: Customer Information */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                          <Users className="h-5 w-5 text-amber-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-200">Misafir Bilgileri</h2>
                      </div>

                      {/* Main Traveler Profile */}
                      <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-900/40">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-indigo-300">
                              <AvatarFallback className="text-white font-medium">
                                {form.watch("gender") === "male" ? "E" : "K"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-medium text-slate-200">
                                {form.watch("firstName")} {form.watch("lastName")}
                              </h3>
                              <p className="text-sm text-slate-400">Ana Yolcu</p>
                            </div>
                          </div>
                          <Badge className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300">
                            Doğrulandı
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">Cinsiyet</label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div
                                className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all ${
                                  form.watch("gender") === "male"
                                    ? "bg-gradient-to-br from-blue-600/40 to-blue-800/40 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
                                    : "bg-slate-800/60 border border-slate-700 hover:bg-slate-800"
                                }`}
                                onClick={() => form.setValue("gender", "male")}
                              >
                                <Avatar className="h-14 w-14 mb-2 bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-blue-300/50">
                                  <AvatarFallback className="text-white font-bold text-lg">E</AvatarFallback>
                                </Avatar>
                                <span className={`font-medium ${form.watch("gender") === "male" ? "text-blue-300" : "text-slate-300"}`}>
                                  Erkek
                                </span>
                              </div>

                              <div
                                className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all ${
                                  form.watch("gender") === "female"
                                    ? "bg-gradient-to-br from-pink-600/40 to-purple-800/40 border-2 border-pink-500/50 shadow-lg shadow-pink-500/20"
                                    : "bg-slate-800/60 border border-slate-700 hover:bg-slate-800"
                                }`}
                                onClick={() => form.setValue("gender", "female")}
                              >
                                <Avatar className="h-14 w-14 mb-2 bg-gradient-to-br from-pink-500 to-purple-500 border-2 border-pink-300/50">
                                  <AvatarFallback className="text-white font-bold text-lg">K</AvatarFallback>
                                </Avatar>
                                <span className={`font-medium ${form.watch("gender") === "female" ? "text-pink-300" : "text-slate-300"}`}>
                                  Kadın
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">Yaş</label>
                            <Input
                              type="number"
                              placeholder="Yaşınızı girin"
                              {...form.register("age")}
                              className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            {form.formState.errors.age && (
                              <p className="text-sm text-red-400">{form.formState.errors.age.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional travelers */}
                      {travelers.slice(1).map((traveler, index) => (
                        <div 
                          key={traveler.id} 
                          className="p-4 rounded-lg bg-slate-800/60 border border-slate-700"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className={`h-12 w-12 ${traveler.isAdult ? 
                                (traveler.gender === "male" ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-pink-500 to-purple-500") : 
                                "bg-gradient-to-br from-amber-500 to-orange-500"} border-2 border-slate-300/30`}
                              >
                                <AvatarFallback className="text-white font-medium">
                                  {traveler.gender === "male" ? "E" : "K"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-medium text-slate-200">
                                  {traveler.fullName || (traveler.isAdult ? "Yetişkin" : "Çocuk") + ` ${index + 1}`}
                                </h3>
                                <p className="text-sm text-slate-400">{traveler.isAdult ? "Yetişkin" : "Çocuk"}</p>
                              </div>
                            </div>
                            <Badge className={`${traveler.isAdult ? 
                              "bg-cyan-500/20 border-cyan-500/30 text-cyan-300" : 
                              "bg-amber-500/20 border-amber-500/30 text-amber-300"}`}
                            >
                              {traveler.isAdult ? "Yetişkin" : "Çocuk"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-slate-300">İsim</label>
                              <Input
                                placeholder="İsim girin"
                                value={traveler.fullName || ""}
                                onChange={(e) => updateTraveler(index + 1, "fullName", e.target.value)}
                                className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-slate-300">Cinsiyet</label>
                              <div className="grid grid-cols-2 gap-3 mt-1">
                                <div
                                  className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                                    traveler.gender === "male"
                                      ? "bg-gradient-to-br from-blue-600/40 to-blue-800/40 border-2 border-blue-500/50"
                                      : "bg-slate-800/60 border border-slate-700 hover:bg-slate-800"
                                  }`}
                                  onClick={() => updateTraveler(index + 1, "gender", "male")}
                                >
                                  <span className={`font-medium ${traveler.gender === "male" ? "text-blue-300" : "text-slate-300"}`}>
                                    Erkek
                                  </span>
                                </div>

                                <div
                                  className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                                    traveler.gender === "female"
                                      ? "bg-gradient-to-br from-pink-600/40 to-purple-800/40 border-2 border-pink-500/50"
                                      : "bg-slate-800/60 border border-slate-700 hover:bg-slate-800"
                                  }`}
                                  onClick={() => updateTraveler(index + 1, "gender", "female")}
                                >
                                  <span className={`font-medium ${traveler.gender === "female" ? "text-pink-300" : "text-slate-300"}`}>
                                    {traveler.isAdult ? "Kadın" : "Kız"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-slate-300">Yaş</label>
                              <Input
                                type="number"
                                placeholder="Yaş girin"
                                value={traveler.age || ""}
                                onChange={(e) => updateTraveler(index + 1, "age", e.target.value)}
                                className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Summary of reservation */}
                      <div className="p-5 rounded-lg bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 mt-6">
                        <h3 className="text-lg font-medium text-slate-200 mb-2 flex items-center">
                          <ShieldCheck className="h-5 w-5 mr-2 text-teal-400" />
                          Rezervasyon Özeti
                        </h3>
                        
                        <div className="space-y-3 text-sm text-slate-300">
                          <div className="flex justify-between py-1 border-b border-slate-700/60">
                            <span>Giriş Tarihi</span>
                            <span className="font-medium text-white">
                              {form.watch("checkInDate") ? format(form.watch("checkInDate"), "PPP", { locale: tr }) : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-700/60">
                            <span>Çıkış Tarihi</span>
                            <span className="font-medium text-white">
                              {form.watch("checkOutDate") ? format(form.watch("checkOutDate"), "PPP", { locale: tr }) : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-700/60">
                            <span>Oda Tipi</span>
                            <span className="font-medium text-white">
                              {form.watch("roomType") === "standard" ? "Standart" : 
                               form.watch("roomType") === "deluxe" ? "Deluxe" : 
                               form.watch("roomType") === "suite" ? "Suit" : 
                               form.watch("roomType") === "family" ? "Aile Odası" : 
                               form.watch("roomType") === "cave" ? "Mağara Oda" : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-700/60">
                            <span>Misafirler</span>
                            <span className="font-medium text-white">
                              {adultsCount} Yetişkin, {childrenCount} Çocuk
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Bütçe</span>
                            <span className="font-medium text-white">
                              {form.watch("budget") === "economy" ? "Ekonomik" : 
                               form.watch("budget") === "standard" ? "Standart" : 
                               form.watch("budget") === "premium" ? "Premium" : 
                               form.watch("budget") === "luxury" ? "Lüks" : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Navigation buttons */}
              <div className="mt-8 pt-5 border-t border-slate-700/50 flex justify-between">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="px-5 py-2 bg-slate-800/70 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Geri
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className={`px-5 py-2 ${
                      step === 4 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-700/20" 
                        : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg shadow-blue-700/20"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        İşleniyor...
                      </>
                    ) : step === 4 ? (
                      <>
                        Rezervasyonu Tamamla
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Devam Et
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="backdrop-blur-sm bg-gradient-to-br from-blue-900/20 to-slate-900/40 p-5 rounded-lg border border-blue-500/30 flex flex-col items-center text-center shadow-lg shadow-blue-900/5">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full mb-3">
              <MapPin className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-2">Kapadokya'nın En İyi Bölgeleri</h3>
            <p className="text-sm text-slate-400">Ürgüp, Göreme, Üçhisar ve daha fazlasını keşfedin</p>
          </div>
          
          <div className="backdrop-blur-sm bg-gradient-to-br from-purple-900/20 to-slate-900/40 p-5 rounded-lg border border-purple-500/30 flex flex-col items-center text-center shadow-lg shadow-purple-900/5">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-3">
              <Bot className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-2">Kişiselleştirilmiş Deneyim</h3>
            <p className="text-sm text-slate-400">Yapay zeka ile özelleştirilmiş gezi planları</p>
          </div>
          
          <div className="backdrop-blur-sm bg-gradient-to-br from-teal-900/20 to-slate-900/40 p-5 rounded-lg border border-teal-500/30 flex flex-col items-center text-center shadow-lg shadow-teal-900/5">
            <div className="p-3 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-full mb-3">
              <Bed className="h-6 w-6 text-teal-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-2">Lüks Konaklama</h3>
            <p className="text-sm text-slate-400">Mağara oteller, butik tesisler ve özel villalar</p>
          </div>
        </motion.div>
        
        {/* AI advice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="backdrop-blur-lg bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-slate-900/30 border border-blue-500/30 shadow-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <CardHeader className="p-0">
                    <h3 className="text-lg font-semibold text-slate-200">Yapay Zeka Destekli Rezervasyon</h3>
                  </CardHeader>
                  <p className="text-sm text-slate-400 mt-2">
                    Rezervasyon sistemimiz kişisel tercihlerinize göre en uygun paketleri ve aktiviteleri otomatik olarak önerir. 
                    Kapadokya'daki deneyiminizi en üst düzeye çıkarmak için tüm bilgilerinizi eksiksiz doldurun.
                  </p>
                  <Accordion type="single" collapsible className="mt-4 border-slate-700/50">
                    <AccordionItem value="item-1" className="border-slate-700/50">
                      <AccordionTrigger className="text-slate-300 hover:text-white">Özel Öneriler Nasıl Çalışır?</AccordionTrigger>
                      <AccordionContent className="text-sm text-slate-400">
                        Yapay zeka algoritması, rezervasyon formundaki tercihlerinizi, seyahat dönemini, bütçenizi ve ilgi alanlarınızı analiz ederek
                        size en uygun Kapadokya deneyimlerini önerir. Kişiselleştirilmiş önerilerinize son adımda ulaşabilirsiniz.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}