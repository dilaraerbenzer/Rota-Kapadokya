'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Droplets, 
  ThermometerSun, 
  ThermometerSnowflake, 
  Calendar, 
  Wind, 
  Search 
} from 'lucide-react';

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

type WeatherResponse = {
  result: WeatherData[];
  error?: string;
};

export default function WeatherPage() {
  const [city, setCity] = useState('ankara');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP hatası! Durum: ${response.status}`);
      }
      
      const data: WeatherResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setWeatherData(data.result || []);
    } catch (err) {
      console.error('Hava durumu alınırken hata oluştu:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde hava durumunu otomatik getir
  useEffect(() => {
    fetchWeatherData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-cyan-300">
          Hava Durumu API Testi
        </h1>

        <div className="mb-8 bg-slate-800/60 p-4 rounded-lg shadow-md border border-slate-700">
          <div className="flex flex-col sm:flex-row">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Şehir adı girin..."
              className="flex-grow p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-2 sm:mb-0 sm:mr-2"
            />
            <button
              onClick={fetchWeatherData}
              disabled={loading}
              className={`p-3 rounded-lg flex items-center justify-center ${
                loading 
                  ? 'bg-slate-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600'
              } transition-colors`}
            >
              {loading ? 'Yükleniyor...' : (
                <>
                  <Search size={20} className="mr-2" />
                  <span>Ara</span>
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200">
              <p>{error}</p>
            </div>
          )}
        </div>

        {!loading && !error && weatherData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weatherData.map((weather, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
                  <p className="flex items-center text-cyan-300 text-lg font-medium mb-2">
                    <Calendar size={18} className="mr-2" /> 
                    {weather.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-700/60 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Sıcaklık</p>
                      <p className="text-2xl font-bold">{weather.degree}°C</p>
                    </div>
                    <div className="bg-slate-700/60 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Nem</p>
                      <p className="text-2xl font-bold">%{weather.humidity}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <ThermometerSun size={16} className="text-orange-400 mr-1" />
                      <span>En yüksek: <strong>{weather.max}°C</strong></span>
                    </div>
                    <div className="flex items-center">
                      <ThermometerSnowflake size={16} className="text-blue-400 mr-1" />
                      <span>En düşük: <strong>{weather.min}°C</strong></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="text-center p-8 bg-slate-800/40 rounded-lg border border-slate-700">
            <p className="text-slate-400">Hava durumu bilgisi bulunamadı. Lütfen başka bir şehir deneyin.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="loader"></div>
            <p className="ml-4 text-slate-400">Hava durumu bilgileri yükleniyor...</p>
          </div>
        ) : null}
        
        <div className="mt-12 p-4 bg-slate-800/60 rounded-lg border border-slate-700 text-sm text-slate-400">
          <p>Bu sayfa CollectAPI hava durumu verilerini kullanmaktadır. API yanıtları gerçek zamanlı olarak gösterilmektedir.</p>
          <p className="mt-2">Not: Örnek şehirler: İstanbul, İzmir, Ankara, Antalya, Bursa</p>
        </div>
      </div>
      
      <style jsx>{`
        .loader {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #22d3ee;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 