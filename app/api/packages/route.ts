import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

// Bu değerler normalde .env dosyasından alınmalıdır
const SUPABASE_URL = "https://vpmzqnrdzaqcrarnherr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbXpxbnJkemFxY3Jhcm5oZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NjYyMjcsImV4cCI6MjA2MTI0MjIyN30.sDxLI0I6i-dTtKfLvyC9jDWJApzwHrAEDOALG_v9qvA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// AI tahmin API endpoint'i
const PREDICT_API = "https://poorly-enough-wren.ngrok-free.app/predict";

// POST: /api/packages
export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    
    // Gerekli alanları kontrol et
    if (!formData.firstName || !formData.lastName) {
      return NextResponse.json({ error: 'İsim ve soyisim zorunludur' }, { status: 400 });
    }
    
    // Yaş ve cinsiyet bilgisini hazırla (30M formatında)
    let ageGender = '30M'; // varsayılan değer
    if (formData.age) {
      ageGender = `${formData.age}${formData.gender === 'male' ? 'M' : 'F'}`;
    } else if (formData.travelers && formData.travelers.length > 0 && formData.travelers[0].age) {
      // Ana yolcunun yaşı ve cinsiyetini kullan
      const mainTraveler = formData.travelers[0];
      ageGender = `${mainTraveler.age}${mainTraveler.gender === 'male' ? 'M' : 'F'}`;
    }
    
    // Grup bilgisini hazırla (['21M','19F'] formatında)
    let groupData = "[]";
    if (formData.travelers && formData.travelers.length > 0) {
      const travelersData = formData.travelers.map((traveler: any) => {
        if (!traveler.age || !traveler.gender) return null;
        return `${traveler.age}${traveler.gender === 'male' ? 'M' : 'F'}`;
      }).filter((item: any) => item !== null);
      
      // Formata uygun string olarak gönder: "['21M','19F']"
      groupData = `[${travelersData.map((item: string) => `'${item}'`).join(',')}]`;
    } else if (formData.adults) {
      // Sadece yetişkin sayısı bilgisi varsa, hepsini varsayılan 30M olarak kabul et
      const adultCount = parseInt(formData.adults);
      const adults = Array(adultCount).fill("'30M'");
      groupData = `[${adults.join(',')}]`;
    }
    
    // Konaklama süresi hesapla (gün)
    let duration = 1;
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    // Oda tipi için doğru formatı hazırla (string veya number)
    let roomType = formData.roomType || "standard";
    
    // API isteği için gerekli parametreler
    const predictParams = {
      nationality: formData.country || 'TR',
      city: formData.city || 'Unknown',
      age_gender: ageGender,
      group: groupData,
      duration: duration.toString(),
      room_type: roomType
    };
    
    console.log("Predict API'ye gönderilen veriler:", predictParams);
    
    try {
      // Eski paketleri al
      const oldPackages = await getOldPackages();
      
      // AI tahmin API'sine istek gönder
      const predictResponse = await fetch(PREDICT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old: oldPackages,
          newData: {
            nationality: predictParams.nationality,
            city: predictParams.city,
            age: ageGender.replace(/[MF]$/, ''), // Sondaki cinsiyet harfini kaldır
            gender: ageGender.slice(-1), // Son karakteri (M veya F) al
            group: groupData,
            duration: predictParams.duration,
            room_type: roomType,
          }
        })
      });
      
      if (!predictResponse.ok) {
        throw new Error(`Tahmin API hatası: ${predictResponse.status}`);
      }
      
      const predictResult = await predictResponse.json();
      
      // Form verilerini ve tahmin sonuçlarını döndür
      return NextResponse.json({
        formData,
        predictResult,
        predictParams
      });
      
    } catch (error) {
      console.error('AI tahmin hatası:', error);
      
      // Hata durumunda form verilerini ve tahmin parametrelerini döndür
      return NextResponse.json({
        formData,
        predictParams,
        error: 'AI tahmin hatası, sadece form verileri döndürülüyor'
      });
    }
    
  } catch (error) {
    console.error('İstek işleme hatası:', error);
    return NextResponse.json({ error: 'Paket oluşturma hatası' }, { status: 500 });
  }
}

// GET: /api/packages
export async function GET(req: NextRequest) {
  try {
    // URL parametrelerini al
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId');
    
    if (hotelId) {
      // Belirli bir otelin paketlerini getir
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('hotel', hotelId);
        
      if (error) throw error;
      
      return NextResponse.json(data);
    } else {
      // Tüm paketleri getir
      const { data, error } = await supabase
        .from('packages')
        .select('*');
        
      if (error) throw error;
      
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Paketleri getirme hatası:', error);
    return NextResponse.json({ error: 'Paketleri getirirken hata oluştu' }, { status: 500 });
  }
}

// Eski paketleri getir
async function getOldPackages() {
  try {
    const { data: packageData, error } = await supabase
      .from('packages')
      .select('*');

    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*');

    if (error || serviceError) {
      console.error('Error:', error);
      console.error('Service Error:', serviceError);
      return [];
    }

    if (!packageData || !serviceData) {
      return [];
    }

    const servicesMap = new Map();
    serviceData.forEach((service: any) => {
      servicesMap.set(service.id, service);
    });

    const predictData: any[] = [];
    packageData.forEach((packageItem: any) => {
      const packageServices = packageItem.services.map((serviceId: string) => {
        const service = servicesMap.get(serviceId);
        return service ? service.name : 'Unknown Service';
      });
      
      // Yaş ve cinsiyet formatını düzgün hazırla
      const ageGender = `${packageItem.age}${packageItem.gender === 'male' ? 'M' : 'F'}`;
      
      // Grup formatını düzgün hazırla
      let groupData = "[]";
      if (packageItem.group && Array.isArray(packageItem.group)) {
        const groupMembers = packageItem.group.map((member: any) => {
          if (typeof member === 'string') return `'${member}'`;
          return `'30M'`; // Varsayılan değer
        });
        groupData = `[${groupMembers.join(',')}]`;
      } else if (typeof packageItem.group === 'number') {
        // Sadece kişi sayısı varsa, hepsini 30M olarak varsay
        const adultCount = packageItem.group;
        const adults = Array(adultCount).fill("'30M'");
        groupData = `[${adults.join(',')}]`;
      }
      
      const packageDetails = {
        nationality: packageItem.nationality,
        city: packageItem.city,
        age_gender: ageGender,
        group: groupData,
        duration: Math.ceil((new Date(packageItem.departure_date).getTime() - new Date(packageItem.arrival_date).getTime()) / (1000 * 60 * 60 * 24)).toString(),
        room_type: packageItem.room_type,
        services: JSON.stringify(packageServices)
      };
      predictData.push(packageDetails);
    });

    return predictData;
  } catch (error) {
    console.error('Eski paketleri getirme hatası:', error);
    return [];
  }
} 