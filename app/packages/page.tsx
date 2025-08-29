'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Hotel, Calendar, CreditCard, Users, Coffee, ArrowLeft, MapPin, ChevronRight } from 'lucide-react';

// useSearchParams için bir wrapper component oluşturuyoruz
function SearchParamsWrapper({ children }: { children: (props: { searchParams: ReturnType<typeof useSearchParams> }) => React.ReactNode }) {
  const searchParams = useSearchParams();
  return <>{children({ searchParams })}</>;
}

// Ana sayfanın içeriği
function PackagesPageContent({ searchParams }: { searchParams: ReturnType<typeof useSearchParams> }) {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [suggestedPackages, setSuggestedPackages] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // Form verilerini URL'den al
    const data: any = {};
    const dataParam = searchParams.get('data');

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
        }
        
        setFormData(data);
        
        // API yanıtından önerilen servisleri ve paketleri al
        if (apiResponse.predictResult && apiResponse.predictResult.services) {
          // Önerilen servisleri hazırla
          const suggestedServices = processServiceSuggestions(apiResponse.predictResult.services);
          setServices(suggestedServices);
          
          // Paket önerilerini oluştur
          const packages = createPackagesFromSuggestions(suggestedServices, data);
          setSuggestedPackages(packages);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('API yanıtı işlenirken hata:', error);
      }
    }

    // URL'den doğrudan parametreleri parse et (geriye dönük uyumluluk için)
    searchParams.forEach((value: string, key: string) => {
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

    setFormData(data);
    
    // API'ye POST isteği gönder
    const sendApiRequest = async () => {
      try {
        const response = await fetch('/api/packages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`API isteği başarısız: ${response.status}`);
        }

        const responseData = await response.json();
        
        if (responseData.error) {
          console.warn('API uyarı:', responseData.error);
          setApiError(responseData.error);
        }
        
        if (responseData.predictResult && responseData.predictResult.services) {
          // Önerilen servisleri hazırla
          const suggestedServices = processServiceSuggestions(responseData.predictResult.services);
          setServices(suggestedServices);
          
          // Paket önerilerini oluştur
          const packages = createPackagesFromSuggestions(suggestedServices, data);
          setSuggestedPackages(packages);
        } else {
          // Yedek servis ve paket verileri
          setDefaultServicesAndPackages(data);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('API isteği hatası:', error);
        setApiError('API isteğinde bir hata oluştu. Yedek veriler gösteriliyor.');
        
        // Yedek servis ve paket verileri
        setDefaultServicesAndPackages(data);
        setIsLoading(false);
      }
    };

    // Belirli bir gecikme sonrası API isteği gönder
    setTimeout(() => {
      sendApiRequest();
    }, 1000);
  }, [searchParams]);

  // API'den gelen servis önerileri işleme
  const processServiceSuggestions = (servicesData: any) => {
    try {
      // API yanıtı farklı formatlarda gelebilir, burada bunu işliyoruz
      let parsedServices = [];
      
      if (typeof servicesData === 'string') {
        try {
          parsedServices = JSON.parse(servicesData);
        } catch (e) {
          parsedServices = servicesData.split(',').map((s: string) => s.trim());
        }
      } else if (Array.isArray(servicesData)) {
        parsedServices = servicesData;
      }

      // Servis nesneleri oluştur
      return parsedServices.map((service: any, index: number) => {
        const serviceName = typeof service === 'string' ? service : service.name || `Hizmet ${index + 1}`;
        return {
          id: index + 1,
          name: serviceName,
          description: getServiceDescription(serviceName),
          price: getServicePrice(serviceName),
          image_path: getServiceImage(serviceName)
        };
      });
    } catch (error) {
      console.error('Servis verileri işlenirken hata:', error);
      return getDefaultServices();
    }
  };

  // Hizmet açıklamaları
  const getServiceDescription = (serviceName: string) => {
    const descriptions: {[key: string]: string} = {
      'Balon Turu': 'Güneşin doğuşunu gökyüzünden izleyin',
      'Kapadokya Balon Turu': 'Güneşin doğuşunu gökyüzünden izleyin',
      'Kırmızı Tur': 'Göreme Açık Hava Müzesi ve bölgenin doğal güzelliklerini keşfedin',
      'ATV Safari': 'Vadileri ATV ile keşfetme deneyimi',
      'Türk Gecesi': 'Geleneksel Türk müziği ve dansları eşliğinde akşam yemeği',
      'At Binme': 'Kapadokya vadilerinde at sırtında gezi',
      'Yeraltı Şehri Turu': 'Antik yeraltı şehirlerini keşfedin'
    };
    
    // İsmin içinde anahtar kelimeleri ara
    for (const key in descriptions) {
      if (serviceName.toLowerCase().includes(key.toLowerCase())) {
        return descriptions[key];
      }
    }
    
    return 'Kapadokya\'nın eşsiz güzelliklerini keşfedin';
  };

  // Hizmet fiyat tahmini
  const getServicePrice = (serviceName: string) => {
    const prices: {[key: string]: number} = {
      'Balon': 150,
      'Kapadokya Balon': 150,
      'Tur': 80,
      'ATV': 60,
      'Safari': 60,
      'Gece': 70,
      'At': 50,
      'Yeraltı': 40
    };
    
    // İsmin içinde anahtar kelimeleri ara
    for (const key in prices) {
      if (serviceName.toLowerCase().includes(key.toLowerCase())) {
        return prices[key];
      }
    }
    
    // Rastgele bir fiyat üret
    return Math.floor(Math.random() * 100) + 30;
  };

  // Hizmet resim yolu
  const getServiceImage = (serviceName: string) => {
    const images: {[key: string]: string} = {
      'Balon': 'balloon.jpg',
      'Kapadokya Balon': 'balloon.jpg',
      'Tur': 'red-tour.jpg',
      'Kırmızı': 'red-tour.jpg',
      'ATV': 'atv.jpg',
      'Safari': 'atv.jpg',
      'Gece': 'turkish-night.jpg',
      'At': 'horse.jpg',
      'Yeraltı': 'underground.jpg'
    };
    
    // İsmin içinde anahtar kelimeleri ara
    for (const key in images) {
      if (serviceName.toLowerCase().includes(key.toLowerCase())) {
        return images[key];
      }
    }
    
    return 'cappadocia.jpg';
  };

  // Varsayılan servisler
  const getDefaultServices = () => {
    return [
      {
        id: 1,
        name: 'Kapadokya Balon Turu',
        description: 'Güneşin doğuşunu gökyüzünden izleyin',
        price: 150,
        image_path: 'balloon.jpg'
      },
      {
        id: 2,
        name: 'Kırmızı Tur',
        description: 'Göreme Açık Hava Müzesi ve bölgenin doğal güzelliklerini keşfedin',
        price: 80,
        image_path: 'red-tour.jpg'
      },
      {
        id: 3,
        name: 'ATV Safari',
        description: 'Vadileri ATV ile keşfetme deneyimi',
        price: 60,
        image_path: 'atv.jpg'
      }
    ];
  };

  // Önerilen servisleri paketlere dönüştür
  const createPackagesFromSuggestions = (services: any[], userData: any) => {
    // Makul paketler oluştur
    const packages = [];
    
    if (services.length >= 2) {
      // En popüler 2 servisi içeren premium paket
      packages.push({
        id: 'pkg1',
        name: `${userData.firstName} için Özel Premium Paket`,
        description: 'En popüler aktiviteleri içeren lüks deneyim',
        price: services[0].price + services[1].price - Math.floor((services[0].price + services[1].price) * 0.1), // %10 indirim
        services: [services[0].id, services[1].id],
        confidence: 0.92
      });
    }
    
    if (services.length >= 3) {
      // İkinci bir paket daha ekle
      const packageServices = [services[1].id, services[2].id];
      if (services.length > 3) {
        packageServices.push(services[3].id);
      }
      
      packages.push({
        id: 'pkg2',
        name: 'Kapadokya Macera Paketi',
        description: 'Bölgenin en güzel yerlerini keşfedin',
        price: services.slice(1, 4).reduce((total, s) => total + s.price, 0) - 20, // küçük indirim
        services: packageServices,
        confidence: 0.85
      });
    }
    
    // Hiç paket oluşturulamadıysa
    if (packages.length === 0 && services.length > 0) {
      packages.push({
        id: 'pkg1',
        name: 'Kapadokya Keşif Paketi',
        description: 'Kapadokya\'nın güzelliklerini keşfetmek için ideal paket',
        price: services[0].price + 30,
        services: [services[0].id],
        confidence: 0.78
      });
    }
    
    return packages;
  };

  // Varsayılan servis ve paketler
  const setDefaultServicesAndPackages = (userData: any) => {
    const defaultServices = getDefaultServices();
    setServices(defaultServices);
    
    // Varsayılan paketler
    setSuggestedPackages([
      {
        id: 'pkg1',
        name: `${userData.firstName || 'Misafirimiz'} için Özel Paket`,
        description: 'Balon turu ve akşam yemeği dahil',
        price: 280,
        services: [1, 2],
        confidence: 0.92
      },
      {
        id: 'pkg2',
        name: 'Macera Paketi',
        description: 'ATV turu ve yeraltı şehirleri ziyareti',
        price: 190,
        services: [2, 3],
        confidence: 0.85
      }
    ]);
  };

  // Gerçek uygulamada kullanılabilecek paket oluşturma fonksiyonu
  const createPackage = async (selectedServices: number[]) => {
    if (!formData) return;
    
    try {
      // Paket oluşturma bilgilerini logla
      console.log('Paket oluşturuluyor:', {
        name: formData.firstName,
        surname: formData.lastName,
        serial_number: formData.idNumber || 'N/A',
        nationality: formData.country || 'TR',
        city: formData.city || 'Unknown',
        age: formData.age || '30',
        gender: formData.gender || 'M',
        group: formData.adults ? parseInt(formData.adults) + parseInt(formData.children || '0') : 1,
        arrival_date: formData.checkInDate,
        departure_date: formData.checkOutDate,
        hotel: 1, // Örnek otel ID'si
        room_type: formData.roomType,
        services: selectedServices
      });
      
      // Gerçek uygulamada burada başarı mesajı veya yönlendirme olabilir
      alert('Paket seçiminiz kaydedildi! Rezervasyon detayları e-posta adresinize gönderilecektir.');
    } catch (error) {
      console.error('Paket oluşturma hatası:', error);
      alert('Paket oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto" />
          <h2 className="mt-4 text-xl font-medium">Paket bilgileri yükleniyor...</h2>
          <p className="mt-2 text-slate-400">Lütfen bekleyin, sizin için en iyi teklifleri hazırlıyoruz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 py-6 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kapadokya Otel Paketi</h1>
          <Link href="/form" className="flex items-center text-cyan-300 hover:text-cyan-100 transition">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Forma Dön</span>
          </Link>
        </div>
      </div>
      
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
        {/* Rezervasyon özeti */}
        <div className="bg-slate-800/60 rounded-lg p-6 shadow-lg border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Hotel className="mr-2 h-5 w-5 text-cyan-400" />
            Rezervasyon Bilgileri
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-slate-300">Kişisel Bilgiler</h3>
              <div className="space-y-2">
                <p className="flex items-center text-slate-300">
                  <Users className="mr-2 h-4 w-4 text-blue-400" />
                  <span className="text-slate-400 mr-2">İsim:</span> 
                  {formData?.firstName} {formData?.lastName}
                </p>
                {formData?.city && (
                  <p className="flex items-center text-slate-300">
                    <MapPin className="mr-2 h-4 w-4 text-rose-400" />
                    <span className="text-slate-400 mr-2">Şehir:</span> 
                    {formData.city}
                  </p>
                )}
                <p className="flex items-center text-slate-300">
                  <Users className="mr-2 h-4 w-4 text-amber-400" />
                  <span className="text-slate-400 mr-2">Kişi Sayısı:</span> 
                  {formData?.adults} Yetişkin
                  {formData?.children && parseInt(formData.children) > 0 && 
                    `, ${formData.children} Çocuk`
                  }
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-slate-300">Konaklama Detayları</h3>
              <div className="space-y-2">
                <p className="flex items-center text-slate-300">
                  <Calendar className="mr-2 h-4 w-4 text-emerald-400" />
                  <span className="text-slate-400 mr-2">Giriş:</span> 
                  {formData?.checkInDate ? formData.checkInDate.toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                </p>
                <p className="flex items-center text-slate-300">
                  <Calendar className="mr-2 h-4 w-4 text-purple-400" />
                  <span className="text-slate-400 mr-2">Çıkış:</span> 
                  {formData?.checkOutDate ? formData.checkOutDate.toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                </p>
                <p className="flex items-center text-slate-300">
                  <CreditCard className="mr-2 h-4 w-4 text-yellow-400" />
                  <span className="text-slate-400 mr-2">Oda Tipi:</span> 
                  {formData?.roomType || 'Belirtilmedi'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI tarafından önerilen paketler */}
        {suggestedPackages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Coffee className="mr-2 h-5 w-5 text-amber-400" />
              Size Özel Paket Önerileri
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {suggestedPackages.map((pkg) => (
                <motion.div 
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/20 p-5 shadow-lg hover:shadow-cyan-900/20 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-cyan-300">{pkg.name}</h3>
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded text-xs font-medium">
                      %{Math.round(pkg.confidence * 100)} Uyumlu
                    </span>
                  </div>
                  
                  <p className="mt-2 text-slate-300">{pkg.description}</p>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-slate-400 mb-1">Dahil Hizmetler:</h4>
                    <ul className="space-y-1">
                      {pkg.services.map((serviceId: number) => {
                        const service = services.find(s => s.id === serviceId);
                        return service ? (
                          <li key={service.id} className="flex items-center text-slate-300">
                            <ChevronRight className="h-3 w-3 text-cyan-400 mr-1" />
                            {service.name}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-xl font-bold text-white">{pkg.price}€</p>
                    <button 
                      onClick={() => createPackage(pkg.services)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded shadow transition-colors"
                    >
                      Seç
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Mevcut servisler */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mevcut Hizmetler</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div 
                key={service.id}
                className="bg-slate-800/60 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 shadow-md transition-all group"
              >
                <div className="h-48 bg-slate-700 relative overflow-hidden">
                  <img 
                    src={`/images/${service.image_path}`} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium">{service.name}</h3>
                  <p className="text-slate-400 mt-1">{service.description}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-bold text-white">{service.price}€</p>
                    <button 
                      onClick={() => createPackage([service.id])}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Ana sayfa bileşeni
export default function PackagesPage() {
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
        {({ searchParams }) => <PackagesPageContent searchParams={searchParams} />}
      </SearchParamsWrapper>
    </Suspense>
  );
}
