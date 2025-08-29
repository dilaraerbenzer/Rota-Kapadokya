'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, MapPin, Calendar, Users, ArrowLeft, Heart, 
  Sparkles, ChevronRight, ShoppingCart as CartIcon, 
  ThumbsUp, Star, Filter, X, Check, Clock,
  ChevronDown, PlusCircle, Zap, BadgePercent,
  Package, Percent, Gift
} from 'lucide-react';
import { getPredict, getServices } from "../backend.js";

// Shopping cart context
import { createContext, useContext } from 'react';
const CartContext = createContext();

// GPT API ile paket oluşturma fonksiyonu
async function createPackageWithGPT(userData, recommendations) {
  try {
    // En uyumlu 3 öneriyi al
    const topRecommendations = [...recommendations]
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
    
    // Prompt oluştur
    const prompt = `
Kapadokya seyahati için özel bir paket hazırla. Şu bilgileri kullanarak öneri yap:

Müşteri Bilgileri:
- İsim: ${userData.firstName} ${userData.lastName}
- Ülke/Şehir: ${userData.country}/${userData.city}
- Yetişkin Sayısı: ${userData.adults}
${userData.children && parseInt(userData.children) > 0 ? `- Çocuk Sayısı: ${userData.children}` : ''}
- Oda Tipi: ${userData.roomType || 'Standart'}
- Kalış Süresi: ${userData.checkInDate && userData.checkOutDate ? 
  Math.ceil((new Date(userData.checkOutDate) - new Date(userData.checkInDate)) / (1000 * 60 * 60 * 24)) : 
  '7'} gün
${userData.interests ? `- İlgi Alanları: ${userData.interests.join(', ')}` : ''}
${userData.specialRequests ? `- Özel İstekler: ${userData.specialRequests}` : ''}

Uyumlu Etkinlikler:
${topRecommendations.map(rec => `- ${rec.title} (Uyumluluk: %${rec.match})`).join('\n')}

Lütfen şunları yap:
1. Bu müşteri için özel bir Kapadokya seyahat paketi oluştur.
2. Paket içinde bu etkinlik ID'lerinden uygun olanları seç: [${recommendations.map(r => r.id).join(', ')}]
3. Sadece şu formatta yanıt ver (açıklamalar {} içinde):
{
  "paketAdi": "{Paket için yaratıcı bir isim}",
  "aciklama": "{Paket için kısa bir pazarlama açıklaması}",
  "ozellikler": ["{özellik1}", "{özellik2}", "{özellik3}"],
  "aktiviteler": [{İD numaraları, sadece sayı olarak}]
}

İndirimler ve paket avantajlarından bahsetme, sadece istenen formatta yanıt ver.
`;
    
    // GPT API'sine istek at
    const response = await fetch('/api/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // API yanıtını parse et
    try {
      const packageData = JSON.parse(data.response);
      return packageData;
    } catch (error) {
      console.error("GPT yanıtı JSON formatına çevrilemedi:", error);
      console.log("Alınan yanıt:", data.response);
      
      // Fallback: En uyumlu 3 öneriyi içeren paket
      return {
        paketAdi: "Kapadokya Keşif Paketi",
        aciklama: "En popüler Kapadokya etkinliklerini içeren özel paket",
        ozellikler: ["En iyi etkinlikler", "Kişiselleştirilmiş deneyim", "Uygun fiyat"],
        aktiviteler: topRecommendations.map(r => r.id)
      };
    }
  } catch (error) {
    console.error("Paket oluşturma hatası:", error);
    return null;
  }
}

function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [packageData, setPackageData] = useState(null);
    const [packageLoading, setPackageLoading] = useState(false);
    
    const addToCart = (item) => {
      setCartItems(prev => {
        // Check if item already exists in cart
        const exists = prev.some(cartItem => cartItem.id === item.id);
        if (exists) {
          return prev; // Don't add duplicates
        }
        return [...prev, item];
      });
      setIsCartOpen(true);
    };
    
    const removeFromCart = (itemId) => {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    };
    
    const clearCart = () => {
      setCartItems([]);
    };
    
    const calculateTotal = () => {
      const rawTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
      const discount = packageData ? 0.05 : 0; // Paket varsa %5 indirim
      return {
        subtotal: rawTotal,
        discount: rawTotal * discount,
        tax: rawTotal * 0.18,
        total: (rawTotal * (1 - discount)) * 1.18
      };
    };
    
    return (
      <CartContext.Provider value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        isCartOpen, 
        setIsCartOpen,
        packageData,
        setPackageData,
        packageLoading,
        setPackageLoading,
        calculateTotal
      }}>
        {children}
      </CartContext.Provider>
    );
  }

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Search params wrapper component
function SearchParamsWrapper({ children }) {
  const searchParams = useSearchParams();
  return <>{children({ searchParams })}</>;
}

// Package component
// CustomPackage bileşeni düzeltilmiş hali
function CustomPackage({ recommendations }) {
    const { 
      packageData, 
      packageLoading, 
      setPackageData,
      setPackageLoading, // Bu satırı ekleyin
      setIsCartOpen,
      cartItems, 
      addToCart, 
      removeFromCart,
      calculateTotal 
    } = useCart();
    const [userData, setUserData] = useState(null);
    
    // Get userData from URL params
    useEffect(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const data = {};
      
      const dataParam = searchParams.get('data');
      if (dataParam) {
        try {
          const apiResponse = JSON.parse(decodeURIComponent(dataParam));
          if (apiResponse.formData) {
            Object.assign(data, apiResponse.formData);
            // Eğer weatherData varsa, userData içine ekleyelim
            if (apiResponse.weatherData) {
              data.weatherData = apiResponse.weatherData;
            }
            setUserData(data);
          }
        } catch (error) {
          console.error('API yanıtı işlenirken hata:', error);
        }
      }
      
      // Handle direct params if no data param
      if (!dataParam || Object.keys(data).length === 0) {
        searchParams.forEach((value, key) => {
          if (key === 'travelers' || key === 'interests') {
            try {
              data[key] = JSON.parse(value);
            } catch (e) {
              data[key] = value;
            }
          } else if (key === 'checkInDate' || key === 'checkOutDate') {
            data[key] = new Date(value);
          } else {
            data[key] = value;
          }
        });
        setUserData(data);
      }
    }, []);
    
    // Find package activities in recommendations
    const packageActivities = packageData 
      ? recommendations.filter(rec => packageData.aktiviteler.includes(rec.id))
      : [];
    
    // Calculate total price and discount
    const financials = calculateTotal();
    
    // Create package when component mounts if we have userData
    useEffect(() => {
      const createGptPackage = async () => {
        if (userData && recommendations.length > 0 && !packageData && !packageLoading) {
          try {
            // Context'ten loading state'ini güncelleyelim
            setPackageLoading(true);
            
            // GPT'ye gönderilecek prompt için önerileri hazırla
            const topRecommendations = [...recommendations]
              .sort((a, b) => b.match - a.match)
              .slice(0, 5);
            
            // GPT prompt'unu oluştur
            const prompt = `
  Kapadokya seyahati için özel bir paket hazırla. Şu bilgileri kullanarak öneri yap:
  
  Müşteri Bilgileri:
  - İsim: ${userData.firstName} ${userData.lastName}
  - Ülke/Şehir: ${userData.country}/${userData.city}
  - Yetişkin Sayısı: ${userData.adults}
  ${userData.children && parseInt(userData.children) > 0 ? `- Çocuk Sayısı: ${userData.children}` : ''}
  - Oda Tipi: ${userData.roomType || 'Standart'}
  - Kalış Süresi: ${userData.checkInDate && userData.checkOutDate ? 
    Math.ceil((new Date(userData.checkOutDate) - new Date(userData.checkInDate)) / (1000 * 60 * 60 * 24)) : 
    '7'} gün
  ${userData.interests && userData.interests.length > 0 ? `- İlgi Alanları: ${userData.interests.join(', ')}` : ''}
  ${userData.specialRequests ? `- Özel İstekler: ${userData.specialRequests}` : ''}
  
  Hava Durumu:
  ${userData.weatherData && userData.weatherData.length > 0 ? 
    userData.weatherData.slice(0, 3).map(w => `${w.date}: ${w.description}, ${w.degree}°C`).join('\n') : 
    'Hava durumu bilgisi mevcut değil'}
  
  Uyumlu Etkinlikler:
  ${topRecommendations.map(rec => `- ${rec.title} (Uyumluluk: %${rec.match})`).join('\n')}
  
  Lütfen şunları yap:
  1. Bu müşteri için özel bir Kapadokya seyahat paketi oluştur.
  2. Paket içinde bu etkinlik ID'lerinden uygun olanları seç: [${recommendations.map(r => r.id).join(', ')}]
  3. Sadece şu formatta yanıt ver (JSON):
  {
    "paketAdi": "(Paket için yaratıcı bir isim)",
    "aciklama": "(Paket için kısa bir pazarlama açıklaması)",
    "ozellikler": ["(özellik1)", "(özellik2)", "(özellik3)"],
    "aktiviteler": [(İD numaraları, sadece sayı olarak)]
  }
  
  İndirimler ve paket avantajlarından bahsetme, sadece istenen formatta yanıt ver.
  `;
            
            // GPT API'sine istek at
            const response = await fetch('/api/gpt', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt }),
            });
            
            if (!response.ok) {
              throw new Error(`GPT API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // API yanıtını parse et
            try {
              const packageData = JSON.parse(data.response);
              setPackageData(packageData);
              console.log("GPT paketi oluşturuldu:", packageData);
            } catch (error) {
              console.error("GPT yanıtı JSON formatına çevrilemedi:", error);
              console.log("Alınan yanıt:", data.response);
              
              // Fallback: En uyumlu 3 öneriyi içeren paket
              setPackageData({
                paketAdi: "Kapadokya Keşif Paketi",
                aciklama: "En popüler Kapadokya etkinliklerini içeren özel paket",
                ozellikler: ["En iyi etkinlikler", "Kişiselleştirilmiş deneyim", "Uygun fiyat"],
                aktiviteler: topRecommendations.slice(0, 3).map(r => r.id)
              });
            }
          } catch (error) {
            console.error("GPT Paket oluşturma hatası:", error);
            // Fallback paket
            setPackageData({
              paketAdi: "Kapadokya Keşif Paketi",
              aciklama: "En popüler Kapadokya etkinliklerini içeren özel paket",
              ozellikler: ["En iyi etkinlikler", "Kişiselleştirilmiş deneyim", "Uygun fiyat"],
              aktiviteler: recommendations.slice(0, 3).map(r => r.id)
            });
          } finally {
            setPackageLoading(false);
          }
        }
      };
      
      createGptPackage();
    }, [userData, recommendations, packageData, packageLoading, setPackageData, setPackageLoading]);
    
    // Check if activity is in cart
    const isInCart = (id) => cartItems.some(item => item.id === id);
    
    // Add all package items to cart
    const addAllToCart = () => {
      packageActivities.forEach(activity => {
        if (!isInCart(activity.id)) {
          addToCart(activity);
        }
      });
    };
    
    if (packageLoading) {
      return (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30 mb-8">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white">Size özel paket oluşturuluyor</h3>
              <p className="text-slate-300 mt-2">Yapay zeka tercihlerinize göre en uygun paketi hazırlıyor...</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (!packageData) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl overflow-hidden border border-blue-500/30 mb-8 relative"
      >
        {/* Floating elements */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-bold text-white flex items-center">
          <Percent className="h-3 w-3 mr-1.5" />
          %5 İndirim
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mr-3">
              <Package className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{packageData.paketAdi}</h2>
              <p className="text-slate-300 text-sm">Size özel hazırlanmış Kapadokya paketi</p>
            </div>
          </div>
          
          <p className="text-slate-300 mb-6">{packageData.aciklama}</p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {packageData.ozellikler.map((ozellik, index) => (
              <div key={index} className="bg-slate-800/70 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-cyan-400 mr-2 flex-shrink-0" />
                  <span className="text-slate-200">{ozellik}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Gift className="h-5 w-5 mr-2 text-purple-400" />
              Paket İçeriği
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {packageActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className={`bg-slate-800/60 rounded-lg overflow-hidden border ${
                    isInCart(activity.id) ? 'border-green-500/50' : 'border-slate-700 hover:border-blue-500/50'
                  } transition-all`}
                >
                  <div className="flex overflow-hidden">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img 
                        src={activity.image} 
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-white text-sm mb-1">{activity.title}</h4>
                        <span className="text-cyan-400 font-medium text-sm">{activity.price}₺</span>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-2">{activity.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="bg-blue-500/20 text-blue-300 text-xs rounded-full px-2 py-0.5 flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {activity.match}%
                          </span>
                        </div>
                        <button
                          onClick={() => isInCart(activity.id) ? removeFromCart(activity.id) : addToCart(activity)}
                          className={`text-xs px-2 py-1 rounded flex items-center ${
                            isInCart(activity.id) 
                              ? 'bg-green-600 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isInCart(activity.id) ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Sepette
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-3 w-3 mr-1" />
                              Sepete Ekle
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
            <div className="flex justify-between mb-2">
              <span className="text-slate-300">Toplam Değer</span>
              <span className="font-medium">{packageActivities.reduce((sum, act) => sum + act.price, 0)}$</span>
            </div>
            <div className="flex justify-between mb-2 text-green-400 text-sm">
              <span>Paket İndirimi (%5)</span>
              <span>-{(packageActivities.reduce((sum, act) => sum + act.price, 0) * 0.05).toFixed(2)}$</span>
            </div>
            <div className="border-t border-slate-700 my-2 pt-2 flex justify-between font-bold">
              <span className="text-white">Paket Fiyatı</span>
              <span className="text-cyan-300">{(packageActivities.reduce((sum, act) => sum + act.price, 0) * 0.95).toFixed(2)}₺</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              *KDV dahil fiyattır. Paketteki tüm aktiviteleri seçtiğinizde %5 indirim otomatik uygulanır.
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={addAllToCart}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <Package className="h-4 w-4 mr-2" />
              Tüm Paketi Sepete Ekle
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

// Weather forecast component
function WeatherForecast({ city = 'Kapadokya' }) {
  const [weatherData, setWeatherData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Mock weather data for demonstration
    const mockWeather = [
      {
        date: '27 Nisan',
        day: 'Bugün',
        description: 'Güneşli',
        status: 'clear',
        degree: '18',
        min: '12',
        max: '20',
        humidity: '45'
      },
      {
        date: '28 Nisan',
        day: 'Yarın',
        description: 'Parçalı Bulutlu',
        status: 'cloudy',
        degree: '16',
        min: '10',
        max: '18',
        humidity: '50'
      },
      {
        date: '29 Nisan',
        day: 'Çarşamba',
        description: 'Güneşli',
        status: 'clear',
        degree: '19',
        min: '13',
        max: '21',
        humidity: '40'
      }
    ];
    
    // Simulate API fetch
    setTimeout(() => {
      setWeatherData(mockWeather);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'clear':
        return <div className="text-yellow-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>;
      case 'rainy':
        return <div className="text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
            <path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>
          </svg>
        </div>;
      case 'cloudy':
        return <div className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
          </svg>
        </div>;
      default:
        return <div className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
          </svg>
        </div>;
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 rounded-xl border border-slate-700 shadow-lg"
    >
      <h3 className="text-lg font-medium text-cyan-300 mb-4 flex items-center">
        <MapPin className="w-4 h-4 mr-2" />
        {city} Hava Durumu
      </h3>
      
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin h-8 w-8 text-cyan-500" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {weatherData.map((weather, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
              className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700"
            >
              <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-xs">{weather.date}</p>
                  <h4 className="font-medium">{weather.day}</h4>
                </div>
                {getStatusIcon(weather.status)}
              </div>
              
              <div className="p-3">
                <p className="text-center mb-2 text-cyan-200 font-medium">{weather.description}</p>
                <div className="bg-slate-700/50 p-2 rounded-lg mb-2 text-center">
                  <p className="text-2xl font-bold">{weather.degree}°C</p>
                </div>
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="text-amber-400">↑ </span>
                    <span>{weather.max}°</span>
                  </div>
                  <div>
                    <span className="text-blue-400">↓ </span>
                    <span>{weather.min}°</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Filter component
function RecommendationFilters({ activeFilters, setActiveFilters }) {
  const filters = [
    { id: 'all', label: 'Tümü' },
    { id: 'top', label: 'En Uygun' },
    { id: 'balon', label: 'Balon Turları' },
    { id: 'kultur', label: 'Kültür Turları' },
    { id: 'macera', label: 'Macera' },
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveFilters(filter.id === 'all' ? [] : [filter.id])}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                     ${activeFilters.includes(filter.id) || (filter.id === 'all' && activeFilters.length === 0) 
                       ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20' 
                       : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

// Shopping cart component
function ShoppingCart() {
  const { 
    cartItems, 
    removeFromCart, 
    isCartOpen, 
    setIsCartOpen, 
    packageData,
    calculateTotal
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Calculate totals with potential package discount
  const financials = calculateTotal();
  
  // Check if all package items are in cart (if package exists)
  const isFullPackage = () => {
    if (!packageData) return false;
    return packageData.aktiviteler.every(id => 
      cartItems.some(item => item.id === id)
    );
  };
  
  const hasPackageDiscount = isFullPackage();
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 1500);
  };
  
  return (
    <>
      {/* Cart button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-full shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all hover:scale-105"
      >
        <div className="relative">
          <CartIcon className="h-6 w-6 text-white" />
          {cartItems.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.length}
            </div>
          )}
        </div>
      </button>
      
      {/* Cart sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsCartOpen(false)}
            />
            
            {/* Cart panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 shadow-xl z-50 border-l border-slate-700 overflow-auto"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <CartIcon className="h-5 w-5 mr-2 text-cyan-400" />
                  Sepetim
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-800"
                >
                  <X className="h-5 w-5 text-slate-300" />
                </button>
              </div>
              
              <div className="p-5">
                {cartItems.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <CartIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-300 mb-2">Sepetiniz Boş</h3>
                    <p className="text-slate-400 mb-6">Keşfetmeye devam etmek için sepete ürün ekleyin.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Keşfetmeye Devam Et
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-8">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-200 mb-0.5 truncate">{item.title}</h4>
                            <p className="text-sm text-slate-400 mb-2">{item.price}₺</p>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-red-400 hover:text-red-300 inline-flex items-center"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Kaldır
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-300">Ara Toplam</span>
                        <span className="font-medium">{financials.subtotal.toFixed(2)}₺</span>
                      </div>
                      
                      {hasPackageDiscount && (
                        <div className="flex justify-between mb-2 text-green-400 text-sm">
                          <span className="flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            Paket İndirimi (%5)
                          </span>
                          <span>-{financials.discount.toFixed(2)}₺</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-slate-400">KDV (%18)</span>
                        <span className="text-slate-300">{financials.tax.toFixed(2)}₺</span>
                      </div>
                      
                      <div className="border-t border-slate-700 my-3 pt-3 flex justify-between text-lg font-bold">
                        <span>Toplam</span>
                        <span className="text-cyan-300">{financials.total.toFixed(2)}₺</span>
                      </div>
                      
                      {hasPackageDiscount && (
                        <div className="bg-green-900/30 border border-green-700/30 rounded p-2 mt-2">
                          <p className="text-xs text-green-300 flex items-center">
                            <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                            Tüm paket içeriğini seçtiğiniz için %5 indirim uygulandı!
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center justify-center"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          İşleniyor...
                        </>
                      ) : (
                        'Ödemeye Geç'
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Recommendation card component
function RecommendationCard({ recommendation, index }) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const handleAddToCart = () => {
    addToCart(recommendation);
    setAddedToCart(true);
    
    // Reset added indicator after 2 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 shadow-lg hover:shadow-blue-900/20 transition-all flex flex-col h-full">
        <div className="h-48 relative overflow-hidden">
          <motion.img 
            src={recommendation.image} 
            alt={recommendation.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
          />
          <div 
            className={`absolute top-3 right-3 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center ${
              recommendation.match > 85 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
              recommendation.match > 70 ? 'bg-gradient-to-r from-green-600 to-teal-600' : 
              recommendation.match > 50 ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : 
              'bg-gradient-to-r from-amber-600 to-red-600'
            }`}
          >
            <Heart className="h-3 w-3 mr-1 text-pink-200" />
            <span>{recommendation.match}% Eşleşme</span>
          </div>
          
          {/* Quick action overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end justify-center p-3"
              >
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Detaylar
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors flex items-center"
                  >
                    <CartIcon className="h-3.5 w-3.5 mr-1.5" />
                    Sepete Ekle
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-white">{recommendation.title}</h3>
              <div className="flex text-yellow-400 text-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} fill={i < 4 ? "currentColor" : "none"} className="h-4 w-4" />
                ))}
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4">{recommendation.description}</p>
            
            <ul className="space-y-1.5 mb-5">
              {recommendation.items.slice(0, 3).map((item, itemIndex) => (
                <li key={itemIndex} className="flex text-sm text-slate-300">
                  <Check className="h-4 w-4 text-cyan-400 mr-1.5 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
              {recommendation.items.length > 3 && (
                <li className="text-sm text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => setShowDetails(true)}>
                  + {recommendation.items.length - 3} öğe daha
                </li>
              )}
            </ul>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
            <div>
              <p className="text-xs text-slate-400 mb-1">Başlangıç Fiyatı</p>
              <p className="text-2xl font-bold text-white">{recommendation.price}₺</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className={`${
                addedToCart 
                  ? 'bg-green-600' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
              } text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center`}
            >
              {addedToCart ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Sepete Eklendi
                </>
              ) : (
                <>
                  <CartIcon className="h-4 w-4 mr-1.5" />
                  Sepete Ekle
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Details modal */}
      <AnimatePresence>
        {showDetails && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowDetails(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-0 top-[10%] mx-auto max-w-3xl max-h-[80vh] overflow-auto bg-slate-900 rounded-xl z-50 shadow-2xl border border-slate-700"
            >
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{recommendation.title}</h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="p-1 rounded-full hover:bg-slate-800"
                >
                  <X className="h-5 w-5 text-slate-300" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden">
                    <img 
                      src={recommendation.image} 
                      alt={recommendation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`px-2 py-1 rounded-full text-sm font-medium ${
                        recommendation.match > 85 ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                        recommendation.match > 70 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 
                        recommendation.match > 50 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        <span>{recommendation.match}% Uyumluluk</span>
                      </div>
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} fill={i < 4 ? "currentColor" : "none"} className="h-4 w-4" />
                        ))}
                        <span className="ml-1 text-slate-300">4.0</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-4">{recommendation.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex text-sm">
                        <Clock className="h-4 w-4 text-cyan-400 mr-2 mt-0.5" />
                        <span className="text-slate-300">Süre: 4-6 saat</span>
                      </div>
                      <div className="flex text-sm">
                        <MapPin className="h-4 w-4 text-cyan-400 mr-2 mt-0.5" />
                        <span className="text-slate-300">Konum: Göreme, Kapadokya</span>
                      </div>
                      <div className="flex text-sm">
                        <Users className="h-4 w-4 text-cyan-400 mr-2 mt-0.5" />
                        <span className="text-slate-300">Grup Boyutu: 2-8 kişi</span>
                      </div>
                      <div className="flex text-sm">
                        <Calendar className="h-4 w-4 text-cyan-400 mr-2 mt-0.5" />
                        <span className="text-slate-300">Uygunluk: Yıl Boyunca</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800 p-3 rounded-lg mb-4">
                      <div className="flex justify-between text-lg font-bold mb-1">
                        <span className="text-slate-300">Fiyat:</span>
                        <span className="text-cyan-300">{recommendation.price}₺</span>
                      </div>
                      <p className="text-xs text-slate-400">Kişi başı fiyat, vergiler dahil</p>
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-3 ${
                        addedToCart 
                          ? 'bg-green-600' 
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                      } text-white font-medium rounded-lg flex items-center justify-center`}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Sepete Eklendi
                        </>
                      ) : (
                        <>
                          <CartIcon className="h-4 w-4 mr-1.5" />
                          Sepete Ekle
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-cyan-400" />
                      Dahil Olan Özellikler
                    </h4>
                    <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                      {recommendation.items.map((item, index) => (
                        <li key={index} className="flex text-sm text-slate-300">
                          <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                      <BadgePercent className="h-4 w-4 mr-2 text-cyan-400" />
                      Ek Fırsatlar
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-full">
                          <PlusCircle className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Erken Rezervasyon</p>
                          <p className="text-xs text-slate-400">%15 indirim</p>
                        </div>
                      </div>
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-full">
                          <Zap className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Grup İndirimi</p>
                          <p className="text-xs text-slate-400">4+ kişi için %10 indirim</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">İptal Koşulları</h4>
                    <p className="text-slate-400 text-sm">
                      48 saat öncesine kadar ücretsiz iptal. 48 saat içinde yapılan iptallerde ödenen tutarın %50'si iade edilir.
                      24 saat içindeki iptaller veya gelinmeyen rezervasyonlar için iade yapılmaz.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm px-6 py-4 border-t border-slate-800 flex justify-between">
                <button 
                  onClick={() => setShowDetails(false)}
                  className="px-5 py-2 border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`px-5 py-2 ${
                    addedToCart 
                      ? 'bg-green-600' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  } text-white rounded-lg text-sm font-medium transition-colors flex items-center`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Sepete Eklendi
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      Sepete Ekle
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Special offers component
function SpecialOffers() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-10 px-4 py-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <BadgePercent className="h-5 w-5 mr-2 text-cyan-400" />
        Özel Fırsatlar
      </h3>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/40 transition-all">
          <div className="p-2 bg-green-500/20 w-fit rounded-full mb-3">
            <Calendar className="h-5 w-5 text-green-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-1">Erken Rezervasyon</h4>
          <p className="text-slate-300 text-sm mb-2">30 gün önceden rezervasyonlarda %15 indirim</p>
          <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300 flex items-center">
            Detaylı Bilgi
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/40 transition-all">
          <div className="p-2 bg-purple-500/20 w-fit rounded-full mb-3">
            <Users className="h-5 w-5 text-purple-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-1">Grup İndirimi</h4>
          <p className="text-slate-300 text-sm mb-2">4 ve üzeri kişilik gruplarda %10 indirim</p>
          <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300 flex items-center">
            Detaylı Bilgi
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/40 transition-all">
          <div className="p-2 bg-amber-500/20 w-fit rounded-full mb-3">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <h4 className="text-lg font-medium text-white mb-1">Paket İndirimi</h4>
          <p className="text-slate-300 text-sm mb-2">3 veya daha fazla etkinlik seçiminde %20 indirim</p>
          <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300 flex items-center">
            Detaylı Bilgi
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Main content component
function RecommendationsPageContent({ searchParams }) {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [userData, setUserData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [predictResults, setPredictResults] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showWeather, setShowWeather] = useState(false);
  
  useEffect(() => {
    // URL'den kullanıcı verilerini al
    const data = {};
    const dataParam = searchParams.get('data');

    // Servisleri veritabanından çeken fonksiyon
    const fetchServices = async (predictData) => {
      try {
        const allServices = await getServices();
        console.log("Tüm servisler:", allServices);
        
        if (!allServices || allServices.length === 0) {
          throw new Error("Servis bilgileri alınamadı");
        }
        
        // Tahmin sonuçları varsa, servisleri bu sonuçlarla eşleştiriyoruz
        if (predictData) {
          const recommendationsWithMatch = allServices.map((service) => {
            // Servis adına göre tahmin sonucunu bul
            const matchPercent = predictData[service.name] || Math.floor(Math.random() * 71) + 30; // Eğer uyumluluk değeri yoksa 30-100 arası rastgele bir değer ata
            
            // Servis nesnesini uyumluluk oranı ile birleştir
            return {
              id: service.id,
              title: service.name,
              description: service.description || "Kapadokya'da eşsiz bir deneyim",
              match: Math.round(matchPercent), // Yüzdeyi tam sayıya yuvarla
              price: service.price || 0,
              items: service.details ? service.details.split(',').map(item => item.trim()) : ["Detaylı bilgi için tıklayın"],
              image: service.image_path ? `/images/${service.image_path}` : '/images/default.jpg',
              link: '/packages'
            };
          });
          
          // Uyumluluk oranına göre büyükten küçüğe sırala
          recommendationsWithMatch.sort((a, b) => b.match - a.match);
          
          // En iyi 6 öneriyi göster
          setRecommendations(recommendationsWithMatch.slice(0, 6));
        } else {
          // Varsayılan öneriler
          setRecommendations(getDefaultRecommendations());
        }
        
        setIsLoading(false);
        setTimeout(() => {
          setShowWeather(true);
        }, 1000);
      } catch (error) {
        console.error("Servis bilgileri alınamadı:", error);
        setApiError('Servis bilgileri alınırken bir hata oluştu. Yedek veriler gösteriliyor.');
        setRecommendations(getDefaultRecommendations());
        setIsLoading(false);
        setTimeout(() => {
          setShowWeather(true);
        }, 1000);
      }
    };

    if (dataParam) {
      try {
        // API yanıtını JSON olarak çözümle
        const apiResponse = JSON.parse(decodeURIComponent(dataParam));
        
        // API yanıtından form verilerini al
        if (apiResponse.formData) {
          Object.assign(data, apiResponse.formData);
          
          // Tarih stringlerini Date nesnelerine dönüştür
          if (data.checkInDate) {
            data.checkInDate = new Date(data.checkInDate);
          }
          
          if (data.checkOutDate) {
            data.checkOutDate = new Date(data.checkOutDate);
          }
          
          setUserData(data);
          
          // API yanıtından tahmin sonuçlarını al
          if (apiResponse.predictResult) {
            console.log("API Prediction Result:", apiResponse.predictResult);
            setPredictResults(apiResponse.predictResult);
            // Servisleri getir ve tahmin sonuçlarıyla eşleştir
            fetchServices(apiResponse.predictResult);
          } else {
            // Hızlı yükleme için varsayılan önerileri göster
            setRecommendations(getDefaultRecommendations());
            setIsLoading(false);
            setTimeout(() => {
              setShowWeather(true);
            }, 1000);
          }
          return;
        }
      } catch (error) {
        console.error('API yanıtı işlenirken hata:', error);
      }
    }

    // URL'den doğrudan parametreleri parse et (geriye dönük uyumluluk için)
    searchParams.forEach((value, key) => {
      if (key === 'travelers') {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      } else if (key === 'interests') {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      } else if (key === 'checkInDate' || key === 'checkOutDate') {
        data[key] = new Date(value);
      } else {
        data[key] = value;
      }
    });

    setUserData(data);

    // getPredict ile veri çekme
    const callPredictAPI = async () => {
      try {
        // Gerekli parametreleri formdan alıyoruz
        const nationality = data.country || "Turkey";
        const city = data.city || "Ankara";
        // Yaş ve cinsiyet bilgisini birleştirip uygun formata getiriyoruz
        const age = data.age || "30";
        const gender = data.gender || "M";
        const age_gender = `${age}${gender}`;
        
        // Grup olarak yolcu bilgisini kullanıyoruz
        // Eğer travelers bilgisi yoksa adults ve children sayısını kullanıyoruz
        let travelersArray = data.travelers ? data.travelers : [];
        if (travelersArray.length === 0 && data.adults) {
          // Ana yolcuyu ekleyip, diğerlerini varsayılan değerlerle dolduruyoruz
          travelersArray = [{ age: age, gender: gender }];
          
          // Diğer yetişkinleri ekleyelim
          const totalAdults = parseInt(data.adults);
          for (let i = 1; i < totalAdults; i++) {
            travelersArray.push({ age: "30", gender: "M" });
          }
          
          // Çocukları ekleyelim
          if (data.children) {
            const totalChildren = parseInt(data.children);
            for (let i = 0; i < totalChildren; i++) {
              travelersArray.push({ age: "10", gender: "M" });
            }
          }
        }
        
        // Yolcu bilgilerini dizeye dönüştürüyoruz
        const travelersString = JSON.stringify(travelersArray.map((t) => `${t.age}${t.gender}`));
        
        // Konaklama süresi hesaplama
        let duration = "7"; // Varsayılan 7 gün
        if (data.checkInDate && data.checkOutDate) {
          const checkIn = new Date(data.checkInDate);
          const checkOut = new Date(data.checkOutDate);
          const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          duration = diffDays.toString();
        }
        
        // Oda tipi
        const roomType = data.roomType ? 
          (data.roomType === "Standart" ? 0 : 
          data.roomType === "Deluxe" ? 1 : 
          data.roomType === "Suite" ? 2 : 0) : 0;
        
        console.log("API'ye gönderilen parametreler:", {
          nationality,
          city,
          age_gender,
          group: travelersString,
          duration,
          room_type: roomType
        });
        
        // API'yi çağırıyoruz
        const result = await getPredict(
          nationality,
          city,
          age_gender,
          travelersString,
          duration,
          roomType
        );
        
        // Sonucu konsola yazdırıyoruz
        console.log("API Sonucu:", result);
        
        // Tahmin sonuçlarını state'e kaydediyoruz
        setPredictResults(result);
        
        // Servisleri getir ve tahmin sonuçlarıyla eşleştir
        await fetchServices(result);
        
        return result;
      } catch (error) {
        console.error("getPredict API hatası:", error);
        return null;
      }
    };

    // API isteğini gecikmeli başlat
    setTimeout(() => {
      callPredictAPI();
    }, 1000);
  }, [searchParams]);
  
  // Filtrelerin uygulanması
  const filteredRecommendations = recommendations.filter(rec => {
    if (activeFilters.length === 0) return true;
    
    // Basit örnek filtre implementasyonu - gerçek filtre mantığı veri yapısına bağlı olarak değişecektir
    if (activeFilters.includes('top')) {
      return rec.match > 80;
    }
    if (activeFilters.includes('balon')) {
      return rec.title.toLowerCase().includes('balon');
    }
    if (activeFilters.includes('kultur')) {
      return rec.title.toLowerCase().includes('kültür') || rec.description.toLowerCase().includes('kültür');
    }
    if (activeFilters.includes('macera')) {
      return rec.title.toLowerCase().includes('macera') || rec.description.toLowerCase().includes('macera');
    }
    
    return true;
  });

  // Varsayılan öneriler
  const getDefaultRecommendations = () => {
    return [
      {
        id: 1,
        title: 'Balon Turu ve Kırmızı Tur Paketi',
        description: 'Kapadokya\'nın eşsiz manzaralarını gökyüzünden ve yerden keşfedin',
        match: Math.floor(Math.random() * 31) + 70, // 70-100 arası rastgele değer
        price: 350,
        items: [
          'Güneş doğumunda balon turu',
          'Göreme Açık Hava Müzesi ziyareti',
          'Yerel restoranda öğle yemeği',
          'Avanos çömlek atölyesi ziyareti',
          'Üçhisar Kalesi panoramik manzara',
          'Profesyonel rehber eşliğinde tur'
        ],
        image: '/images/balloon.jpg',
        link: '/packages'
      },
      {
        id: 2,
        title: 'Kültürel Keşif Turu',
        description: 'Kapadokya\'nın tarihi ve kültürel zenginliklerini keşfedin',
        match: Math.floor(Math.random() * 31) + 70, // 70-100 arası rastgele değer
        price: 250,
        items: [
          'Göreme Açık Hava Müzesi turu',
          'Yeraltı şehirleri ziyareti',
          'Ihlara Vadisi yürüyüşü',
          'Selime Katedrali gezisi',
          'Yerel el sanatları atölyesi deneyimi',
          'Kültür mirası konulu rehberlik'
        ],
        image: '/images/culture.jpg',
        link: '/packages'
      },
      {
        id: 3,
        title: 'Lüks Romantik Deneyim',
        description: 'Sevdiklerinizle unutulmaz anlar yaşayın',
        match: Math.floor(Math.random() * 31) + 70, // 70-100 arası rastgele değer
        price: 450,
        items: [
          'Özel balon turu (şampanya ikramlı)',
          'Mağara restoranda romantik akşam yemeği',
          'Güneş batımı vadisi turu',
          'Şarap mahzeni ziyareti ve tadım',
          'Özel fotoğraf çekimi',
          'Lüks mağara otel konaklama'
        ],
        image: '/images/romance.jpg',
        link: '/packages'
      },
      {
        id: 4,
        title: 'Macera Tutkunları Paketi',
        description: 'Kapadokya\'yı aktif bir şekilde keşfedin',
        match: Math.floor(Math.random() * 31) + 70, // 70-100 arası rastgele değer
        price: 300,
        items: [
          'ATV turu',
          'Vadi yürüyüşü',
          'Tırmanış aktivitesi',
          'At binme deneyimi',
          'Off-road safari',
          'Jeep turları'
        ],
        image: '/images/adventure.jpg',
        link: '/packages'
      },
      {
        id: 5,
        title: 'Yerel Gastronomi Turu',
        description: 'Yöresel tatları keşfedin',
        match: Math.floor(Math.random() * 31) + 70, // 70-100 arası rastgele değer
        price: 200,
        items: [
          'Geleneksel Türk kahvaltısı',
          'Yöresel yemek pişirme atölyesi',
          'Şarap tadımı turu',
          'Peribacaları manzarasında öğle yemeği',
          'Yerel çiftlik ziyareti',
          'Türk tatlıları tadımı'
        ],
        image: '/images/food.jpg',
        link: '/packages'
      },
      {
        id: 6,
        title: 'Fotoğrafçılık Turu',
        description: 'Kapadokya\'nın en fotojenik yerlerini keşfedin',
        match: Math.floor(Math.random() * 31) + 70, // 70-100 arası rastgele değer
        price: 280,
        items: [
          'Gün doğumu fotoğraf çekimi',
          'Profesyonel fotoğrafçı rehberliği',
          'En iyi manzara noktaları turu',
          'Işık ve kompozisyon teknikleri eğitimi',
          'Drone ile çekim fırsatı',
          'Dijital düzenleme atölyesi'
        ],
        image: '/images/photography.jpg',
        link: '/packages'
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4 relative w-20 h-20"
          >
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-cyan-500/30"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-cyan-500 animate-spin"></div>
          </motion.div>
          <h2 className="text-2xl font-medium mb-2">Size Özel Öneriler Hazırlanıyor</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Yapay zeka algoritması tercihlerinizi analiz ediyor ve tam size uygun etkinlikleri seçiyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-lg py-6 px-4 sm:px-6 lg:px-8 shadow-lg sticky top-0 z-30"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-cyan-400" />
                Kişiselleştirilmiş Öneriler
              </h1>
              <p className="text-slate-300 text-sm">
                Tercihlerinize göre hazırlanan yapay zeka destekli paketler
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/form" className="flex items-center text-cyan-300 hover:text-cyan-100 transition text-sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span>Forma Dön</span>
              </Link>
              <button
                onClick={() => window.location.href = "/packages"}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-sm font-medium text-white"
              >
                Tüm Paketler
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* API Hata Mesajı */}
        {apiError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-amber-900/50 border border-amber-600/50 rounded-md p-3 text-amber-200">
              <p className="text-sm">{apiError}</p>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Kullanıcı bilgileri özeti */}
          {userData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl p-6 shadow-lg border border-slate-700 mb-8 backdrop-blur-sm"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-cyan-400" />
                Rezervasyon Bilgileri
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-medium mb-2 text-cyan-300 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Kişisel Bilgiler
                  </h3>
                  <p className="text-slate-300 mb-1">
                    {userData.firstName} {userData.lastName}
                  </p>
                  <p className="text-slate-400 text-sm flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-slate-500" />
                    {userData.city}, {userData.country}
                  </p>
                </div>
                
                <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-medium mb-2 text-cyan-300 flex items-center">
                    <Bed className="h-4 w-4 mr-2" />
                    Konaklama
                  </h3>
                  <p className="text-slate-300 mb-1">
                    {userData.roomType || "Standart Oda"}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {userData.adults} Yetişkin
                    {userData.children && parseInt(userData.children) > 0 && `, ${userData.children} Çocuk`}
                  </p>
                </div>
                
                <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-medium mb-2 text-cyan-300 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Tarihler
                  </h3>
                  {userData.checkInDate && userData.checkOutDate ? (
                    <>
                      <p className="text-slate-300 mb-1">
                        {new Date(userData.checkInDate).toLocaleDateString('tr-TR')} - {new Date(userData.checkOutDate).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {Math.ceil((new Date(userData.checkOutDate) - new Date(userData.checkInDate)) / (1000 * 60 * 60 * 24))} gece konaklama
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400">Tarih belirtilmedi</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Size Özel Paket */}
          <CustomPackage recommendations={recommendations} />
          
          {/* İki sütunlu grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ana içerik (sol sütun - 2/3) */}
            <div className="lg:col-span-2">
              {/* Özel Fırsatlar */}
              <SpecialOffers />
              
              {/* Filtreler */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Size Özel Seyahat Önerileri</h2>
                <RecommendationFilters activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
              </div>
              
              {/* Öneriler listesi */}
              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-10 bg-slate-800/60 rounded-lg border border-slate-700">
                  <div className="p-3 bg-slate-700/60 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-300 mb-2">Filtre Sonucu Bulunamadı</h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-4">
                    Seçtiğiniz filtrelere uygun sonuç bulunamadı. Lütfen filtrelerinizi değiştirin veya tüm paketleri görüntüleyin.
                  </p>
                  <button 
                    onClick={() => setActiveFilters([])}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              ) : (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                  {filteredRecommendations.map((recommendation, index) => (
                    <RecommendationCard key={recommendation.id} recommendation={recommendation} index={index} />
                  ))}
                </div>
              )}
              
              {/* Tüm paketleri göster butonu */}
              <div className="mt-10 text-center">
                <button 
                  onClick={() => window.location.href = "/packages"}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-md shadow-blue-900/20 transition-all"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Tüm Paketleri Göster</span>
                </button>
              </div>
            </div>
            
            {/* Sağ yan panel */}
            <div className="space-y-8">
              {/* Hava durumu bilgisi */}
              {showWeather && <WeatherForecast />}
              
              {/* Karşılaştırma paneli */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 rounded-xl border border-slate-700 shadow-lg"
              >
                <h3 className="text-lg font-medium text-cyan-300 mb-4 flex items-center">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Sizin İçin Önerilen
                </h3>
                
                {recommendations.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-3 rounded-lg border border-blue-500/30 flex items-start gap-3">
                      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden">
                        <img 
                          src={recommendations[0].image} 
                          alt={recommendations[0].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-0.5">{recommendations[0].title}</h4>
                        <p className="text-xs text-slate-300 mb-1">
                          <span className="text-green-400">%{recommendations[0].match} uyumlu</span> - En popüler seçim
                        </p>
                        <p className="text-xs text-white font-medium">{recommendations[0].price}₺</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 mt-4">
                      {recommendations.slice(1, 3).map((rec) => (
                        <div key={rec.id} className="bg-slate-800 p-2 rounded-lg border border-slate-700 flex items-center gap-2">
                          <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden">
                            <img 
                              src={rec.image} 
                              alt={rec.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-white text-sm truncate">{rec.title}</h4>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-cyan-400">%{rec.match} eşleşme</p>
                              <p className="text-xs text-white">{rec.price}₺</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
              
              {/* Yardım paneli */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gradient-to-br from-green-900/20 to-slate-900/80 p-5 rounded-xl border border-green-700/30 shadow-lg"
              >
                <h3 className="text-lg font-medium text-green-300 mb-3">İhtiyacınız mı var?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Kapadokya ziyaretiniz için özel tavsiyeler veya yardım almak ister misiniz?
                </p>
                <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Bize Ulaşın
                </button>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Shopping cart component */}
        <ShoppingCart />
      </div>
    </CartProvider>
  );
}

// MessageSquare component for chat
function MessageSquare(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || props.width || 24} height={props.size || props.height || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || ""}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// User icon component
function User(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || props.width || 24} height={props.size || props.height || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || ""}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// Bed icon component
function Bed(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || props.width || 24} height={props.size || props.height || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || ""}>
      <path d="M2 4v16" />
      <path d="M22 4v16" />
      <path d="M2 8h20" />
      <path d="M2 16h20" />
      <path d="M12 8v8" />
    </svg>
  );
}

// Main page component
export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto" />
          <h2 className="mt-4 text-xl font-medium">Sayfa yükleniyor...</h2>
        </div>
      </div>
    }>
      <SearchParamsWrapper>
        {({ searchParams }) => <RecommendationsPageContent searchParams={searchParams} />}
      </SearchParamsWrapper>
    </Suspense>
  );
}