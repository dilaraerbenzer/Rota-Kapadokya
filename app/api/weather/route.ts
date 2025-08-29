import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'ankara';

  try {
    const response = await fetch(`https://api.collectapi.com/weather/getWeather?data.lang=tr&data.city=${city}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'authorization': 'apikey 7phwtZk5J0vEC6wb9d3sF9:2TSqPnERQG4h4WTSRbcyOC'
      }
    });

    if (!response.ok) {
      throw new Error(`API isteği başarısız oldu: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Hava durumu API hatası:', error);
    let errorMessage = 'Sunucu hatası';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'İstek işlenirken hata oluştu', details: errorMessage }, { status: 500 });
  }
} 