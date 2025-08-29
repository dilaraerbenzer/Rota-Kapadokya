import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://vpmzqnrdzaqcrarnherr.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbXpxbnJkemFxY3Jhcm5oZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NjYyMjcsImV4cCI6MjA2MTI0MjIyN30.sDxLI0I6i-dTtKfLvyC9jDWJApzwHrAEDOALG_v9qvA"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Servis oluşturma fonksiyonu
async function createService(agency, hotel, name, description, price, capacity, image_path) {
  const { data, error } = await supabase
    .from('services')
    .insert([
      { agency, hotel, name, description, price, capacity, image_path }
    ]);

  if (error) {
    console.error('Error:', error);
    throw error;
  } else {
    console.log('Service created:', data);
    return data;
  }
}

// Servis kapasitesini güncelleme fonksiyonu
async function updateCapacity(serviceId, newCapacity) {
  const { data, error } = await supabase
    .from('services')
    .update({ capacity: newCapacity })
    .eq('id', serviceId)
    .select();

  if (error) {
    console.error('Error:', error);
    throw error;
  } else {
    console.log('Service updated:', data);
    return data;
  }
}

// Otel bilgilerini getirme fonksiyonu
async function getHotel(hotelId) {
  let { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('id', hotelId);

  if (error) {
    console.error('Error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Hotel not found");
  }

  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('hotel', hotelId);

  if (serviceError) {
    console.error('Error:', serviceError);
    throw serviceError;
  }

  const hotelData = data[0];
  hotelData.services = serviceData || [];
  console.log('Hotel with services:', hotelData);
  return hotelData;
}

// Paket oluşturma fonksiyonu
async function createPackage(name, surname, nationality, serial_number, city, age, gender, group, arrival_date, departure_date, hotel, room_type, services) {
  const { data, error } = await supabase
    .from('packages')
    .insert([
      {
        name,
        surname,
        serial_number,
        nationality,
        city,
        age,
        gender,
        group,
        arrival_date,
        departure_date,
        hotel,
        room_type,
        services,
      }
    ]);

  if (error) {
    console.error('Error:', error);
    throw error;
  } else {
    console.log('Package created:', data);
    return data;
  }
}

// Belirli bir otelin paketlerini getirme fonksiyonu
async function getPackages(hotelId) {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('hotel', hotelId);

  if (error) {
    console.error('Error:', error);
    throw error;
  } else {
    console.log('Packages:', data);
    return data;
  }
}

// Tüm paketleri getirme fonksiyonu
async function getOldPackages() {
  const { data: packageData, error } = await supabase
    .from('packages')
    .select('*');

  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('*');

  if (error || serviceError) {
    console.error('Error:', error);
    console.error('Service Error:', serviceError);
    throw error || serviceError;
  } else {
    console.log('Packages:', packageData);
    console.log('Services:', serviceData);

    const services = new Map();
    serviceData?.forEach((service) => {
      services.set(service.id, service);
    });

    const predictData = [];
    packageData?.forEach((packageItem) => {
      const packageServices = packageItem.services.map(
        (serviceId) => services.get(serviceId)?.name || "Bilinmeyen Servis"
      );
      
      // Tarih hesaplamalarını güvenli şekilde yap
      let duration = 1; // Varsayılan değer
      try {
        const depDate = new Date(packageItem.departure_date);
        const arrDate = new Date(packageItem.arrival_date);
        duration = Math.ceil((depDate.getTime() - arrDate.getTime()) / (1000 * 60 * 60 * 24));
      } catch (e) {
        console.error("Tarih hesaplama hatası:", e);
      }
      
      const packageDetails = {
        nationality: packageItem.nationality || "",
        city: packageItem.city || "",
        age_gender: (packageItem.age || "0") + (packageItem.gender ? "M" : "F"),
        group: packageItem.group || "",
        duration: duration,
        room_type: packageItem.room_type || "standard",
        services: packageServices,
      };
      predictData.push(packageDetails);
    });
    console.log('Predict Data:', predictData);
    return predictData;
  }
}

// Pakete servis ekleme fonksiyonu
async function acceptPackage(packageId, serviceId) {
  //add serviceId to "accepted" array
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .select('accepted');

  if (error) {
    console.error('Error:', error);
    throw error;
  }
  
  const accepted = data[0].accepted || [];
  accepted.push(serviceId);
  console.log('Accepted:', accepted);
  
  const { data: updateData, error: updateError } = await supabase
    .from('packages')
    .update({ accepted })
    .eq('id', packageId)
    .select();
    
  if (updateError) {
    console.error('Error:', updateError);
    throw updateError;
  } else {
    console.log('Package updated:', updateData);
    return updateData;
  }
}

// AI öneri fonksiyonu
const API = "https://poorly-enough-wren.ngrok-free.app/";
const PREDICT = API + "predict";

async function getPredict(nationality, city, age_gender, group, duration, room_type) {
  const newData = {
    nationality,
    city,
    age: age_gender.substring(0, age_gender.length - 1),
    gender: age_gender.substring(age_gender.length - 1),
    group,
    duration,
    room_type,
  };
  
  try {
    const old = await getOldPackages();
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ old, newData })
    };
    
    const response = await fetch(PREDICT, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Success:', result);
    return result;
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}

// Tüm servisleri getirme fonksiyonu
async function getServices() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*');

    if (error) {
      console.error('Error:', error);
      throw error;
    }
    
    console.log('Services fetched:', data);
    return data;
  } catch (error) {
    console.error('Could not fetch services:', error);
    throw error;
  }
}

export { 
  createService, 
  getHotel, 
  updateCapacity, 
  createPackage, 
  getPackages, 
  acceptPackage, 
  getOldPackages,
  getPredict,
  getServices
};