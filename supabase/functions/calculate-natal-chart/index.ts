import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { birthDate, birthTime, location } = await req.json();
    
    if (!birthDate || !birthTime || !location) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get API credentials
    const ASTROLOGY_API_USER_ID = Deno.env.get('ASTROLOGY_API_USER_ID');
    const ASTROLOGY_API_KEY = Deno.env.get('ASTROLOGY_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!ASTROLOGY_API_USER_ID || !ASTROLOGY_API_KEY) {
      console.error('Astrology API credentials not configured');
      return new Response(
        JSON.stringify({ error: "Astrology API not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse birth data
    const birthDateTime = new Date(`${birthDate}T${birthTime}`);
    const day = birthDateTime.getDate();
    const month = birthDateTime.getMonth() + 1; // API expects 1-12
    const year = birthDateTime.getFullYear();
    const hour = birthDateTime.getHours();
    const min = birthDateTime.getMinutes();

    // Calculate timezone offset from longitude (approximation)
    // More accurate would be to use a timezone API, but this is a reasonable approximation
    const tzone = Math.round(location.lon / 15 * 2) / 2; // Round to nearest 0.5

    console.log('Birth data:', { day, month, year, hour, min, lat: location.lat, lon: location.lon, tzone });

    // Prepare API request data
    const apiData = {
      day,
      month,
      year,
      hour,
      min,
      lat: location.lat,
      lon: location.lon,
      tzone
    };

    // Fetch planets data from FreeAstrologyAPI
    console.log('Fetching planets from FreeAstrologyAPI...');
    const planetsResponse = await fetch('https://json.freeastrologyapi.com/western/planets', {
      method: 'POST',
      headers: {
        'x-api-key': ASTROLOGY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
    });

    if (!planetsResponse.ok) {
      const errorText = await planetsResponse.text();
      console.error('Astrology API planets error:', planetsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch planetary data" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const planetsData = await planetsResponse.json();
    console.log('Planets data received:', JSON.stringify(planetsData, null, 2));

    // Fetch house cusps data from FreeAstrologyAPI
    console.log('Fetching house cusps from FreeAstrologyAPI...');
    const housesResponse = await fetch('https://json.freeastrologyapi.com/western/houses', {
      method: 'POST',
      headers: {
        'x-api-key': ASTROLOGY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
    });

    if (!housesResponse.ok) {
      const errorText = await housesResponse.text();
      console.error('Astrology API houses error:', housesResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch house data" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const housesData = await housesResponse.json();
    console.log('Houses data received:', JSON.stringify(housesData, null, 2));

    // Map zodiac signs from English to Bulgarian
    const zodiacMap: { [key: string]: string } = {
      'Aries': 'Овен',
      'Taurus': 'Телец',
      'Gemini': 'Близнаци',
      'Cancer': 'Рак',
      'Leo': 'Лъв',
      'Virgo': 'Дева',
      'Libra': 'Везни',
      'Scorpio': 'Скорпион',
      'Sagittarius': 'Стрелец',
      'Capricorn': 'Козирог',
      'Aquarius': 'Водолей',
      'Pisces': 'Риби'
    };

    // Map planet names from English to Bulgarian
    const planetMap: { [key: string]: string } = {
      'Sun': 'Слънце',
      'Moon': 'Луна',
      'Mercury': 'Меркурий',
      'Venus': 'Венера',
      'Mars': 'Марс',
      'Jupiter': 'Юпитер',
      'Saturn': 'Сатурн',
      'Uranus': 'Уран',
      'Neptune': 'Нептун',
      'Pluto': 'Плутон'
    };

    // Transform planets data to our format (FreeAstrologyAPI returns object with output property)
    const planetsObj = planetsData.output || planetsData;
    const planetsArray = Object.values(planetsObj);
    const planets = planetsArray.map((planet: any) => ({
      name: planetMap[planet.name] || planet.name,
      sign: zodiacMap[planet.sign] || planet.sign,
      degree: Math.floor(planet.normDegree % 30),
      house: planet.house
    }));

    // Extract Sun sign and Ascendant
    const sunPlanet = planets.find((p: any) => p.name === 'Слънце');
    const sunSign = sunPlanet ? sunPlanet.sign : 'Неизвестен';

    // Get Ascendant from houses data (FreeAstrologyAPI returns object with output property)
    const housesObj = housesData.output || housesData;
    const housesArray = Object.values(housesObj);
    const ascendantSign = housesArray[0] ? (zodiacMap[(housesArray[0] as any).sign] || (housesArray[0] as any).sign) : 'Неизвестен';
    const ascendantDegree = housesArray[0] ? Math.floor((housesArray[0] as any).signLord % 30) : 0;

    // Transform houses data to our format
    const houses = housesArray.map((house: any, index: number) => ({
      house: index + 1,
      sign: zodiacMap[house.sign] || house.sign,
      degree: Math.floor(house.signLord % 30)
    }));

    // Calculate aspects between planets
    const aspects = [];
    const aspectTypes = [
      { name: "Конюнкция", degree: 0, orb: 8 },
      { name: "Опозиция", degree: 180, orb: 8 },
      { name: "Квадрат", degree: 90, orb: 6 },
      { name: "Тригон", degree: 120, orb: 8 },
      { name: "Секстил", degree: 60, orb: 6 },
    ];

    // Get full degree positions for aspect calculations
    const getFullDegree = (planet: any) => {
      const zodiacSigns = ['Овен', 'Телец', 'Близнаци', 'Рак', 'Лъв', 'Дева', 'Везни', 'Скорпион', 'Стрелец', 'Козирог', 'Водолей', 'Риби'];
      const signIndex = zodiacSigns.indexOf(planet.sign);
      return signIndex * 30 + planet.degree;
    };

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        
        const totalDegree1 = getFullDegree(planet1);
        const totalDegree2 = getFullDegree(planet2);
        
        let angle = Math.abs(totalDegree1 - totalDegree2);
        if (angle > 180) angle = 360 - angle;
        
        for (const aspectType of aspectTypes) {
          if (Math.abs(angle - aspectType.degree) <= aspectType.orb) {
            aspects.push({
              planet1: planet1.name,
              planet2: planet2.name,
              aspect: aspectType.name,
              angle: Math.round(angle)
            });
            break;
          }
        }
      }
    }

    // Generate AI analysis using Lovable AI
    const prompt = `Генерирай пълен астрологичен анализ на натална карта на български език за човек роден на ${birthDate} в ${birthTime} в ${location.city}, ${location.country}.

Астрологични данни:
- Слънце в ${sunSign}
- Асцендент (Възходящ знак): ${ascendantSign} на ${ascendantDegree}°

Позиции на планетите:
${planets.map((p: any) => `- ${p.name}: ${p.sign} ${p.degree}° (${p.house} дом)`).join('\n')}

Върхове на домовете:
${houses.map((h: any) => `- ${h.house} дом: ${h.sign} ${h.degree}°`).join('\n')}

Аспекти между планетите:
${aspects.length > 0 ? aspects.map((a: any) => `- ${a.planet1} ${a.aspect} ${a.planet2} (${a.angle}°)`).join('\n') : 'Няма значими аспекти'}

Моля, предостави задълбочен анализ на личността, силните страни, предизвикателствата и жизнения път на този човек, базиран на горните астрологични данни. Анализът трябва да е между 500 и 800 думи и да включва:

1. Общи характеристики на личността (базирано на Слънцето и Асцендента)
2. Емоционален живот и взаимоотношения
3. Кариера и призвание
4. Предизвикателства и уроци за растеж
5. Уникални качества и потенциал

Пиши на български език, с професионален и вдъхновяващ тон.`;

    console.log('Generating AI analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Ти си опитен астролог с дълбоки познания в западната астрология. Твоят анализ е точен, вдъхновяващ и полезен.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate AI analysis" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;
    console.log('AI analysis generated');

    // Return the complete natal chart data in the format expected by NatalChartModal
    const natalChart = {
      birthData: {
        date: birthDate,
        time: birthTime,
        location: `${location.city}, ${location.country}`,
        coordinates: {
          lat: location.lat,
          lon: location.lon
        }
      },
      chart: {
        sunSign: sunSign,
        ascendant: {
          sign: ascendantSign,
          degree: ascendantDegree
        },
        planets,
        houses,
        aspects
      },
      analysis
    };

    return new Response(
      JSON.stringify(natalChart),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Error in calculate-natal-chart:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
