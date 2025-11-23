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
    const ASTROLOGY_API_KEY = Deno.env.get('ASTROLOGY_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!ASTROLOGY_API_KEY) {
      console.error('Astrology API key not configured');
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
    const date = birthDateTime.getDate();
    const month = birthDateTime.getMonth() + 1; // API expects 1-12
    const year = birthDateTime.getFullYear();
    const hours = birthDateTime.getHours();
    const minutes = birthDateTime.getMinutes();
    const seconds = 0;

    // Calculate timezone offset from longitude (approximation)
    // More accurate would be to use a timezone API, but this is a reasonable approximation
    const timezone = Math.round(location.lon / 15 * 2) / 2; // Round to nearest 0.5

    console.log('Birth data:', { date, month, year, hours, minutes, latitude: location.lat, longitude: location.lon, timezone });

    // Prepare API request data in FreeAstrologyAPI format
    const apiData = {
      year,
      month,
      date,
      hours,
      minutes,
      seconds,
      latitude: location.lat,
      longitude: location.lon,
      timezone,
      config: {
        observation_point: "topocentric",
        ayanamsha: "lahiri"
      }
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
        JSON.stringify({ error: "API_ERROR", details: `Status: ${planetsResponse.status}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const planetsData = await planetsResponse.json();
    console.log('Planets data received:', JSON.stringify(planetsData, null, 2));

    // Validate planets data structure
    if (!planetsData || !planetsData.output) {
      console.error('Invalid planets data structure');
      return new Response(
        JSON.stringify({ error: "INVALID_ASTRO_DATA", details: "Missing planets output" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

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
        JSON.stringify({ error: "API_ERROR", details: `Status: ${housesResponse.status}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const housesData = await housesResponse.json();
    console.log('Houses data received:', JSON.stringify(housesData, null, 2));

    // Validate houses data structure
    if (!housesData || !housesData.output) {
      console.error('Invalid houses data structure');
      return new Response(
        JSON.stringify({ error: "INVALID_ASTRO_DATA", details: "Missing houses output" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

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

    // Helper function to validate zodiac sign
    const isValidSign = (sign: string): boolean => {
      if (!sign || typeof sign !== 'string') return false;
      const validSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                          'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      return validSigns.includes(sign);
    };

    // Transform planets data to our format (FreeAstrologyAPI returns object with output property)
    const planetsObj = planetsData.output || planetsData;
    const planetsArray = Object.values(planetsObj);
    
    // Validate and transform planets
    const planets = [];
    for (const planet of planetsArray) {
      const planetData = planet as any;
      
      // Extract planet name and sign from API structure
      const planetName = planetData.planet?.en;
      const signName = planetData.zodiac_sign?.name?.en;
      
      // Skip if planet data is invalid
      if (!planetName || !signName || !isValidSign(signName)) {
        console.warn('Invalid planet data:', planetData);
        continue;
      }
      
      // Only include main planets
      if (!planetMap[planetName]) {
        continue; // Skip asteroids and other bodies
      }
      
      planets.push({
        name: planetMap[planetName],
        sign: zodiacMap[signName] || signName,
        degree: Math.floor(planetData.normDegree % 30),
        house: planetData.house || 0
      });
    }

    // Validate we have enough planets
    if (planets.length < 10) {
      console.error('Insufficient planet data');
      return new Response(
        JSON.stringify({ error: "INVALID_ASTRO_DATA", details: "Insufficient planet data" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Extract Sun sign and Ascendant
    const sunPlanet = planets.find((p: any) => p.name === 'Слънце');
    if (!sunPlanet) {
      console.error('Sun sign not found');
      return new Response(
        JSON.stringify({ error: "INVALID_ASTRO_DATA", details: "Sun sign not found" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    const sunSign = sunPlanet.sign;

    // Get Ascendant from houses data (FreeAstrologyAPI returns Houses array in output)
    const housesObj = housesData.output;
    if (!housesObj || !housesObj.Houses || !Array.isArray(housesObj.Houses)) {
      console.error('Houses data not found');
      return new Response(
        JSON.stringify({ error: "INVALID_ASTRO_DATA", details: "Houses data not found" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const housesArray = housesObj.Houses;
    const firstHouse = housesArray[0];
    
    if (!firstHouse || !firstHouse.zodiac_sign?.name?.en) {
      console.error('Ascendant not found');
      return new Response(
        JSON.stringify({ error: "INVALID_ASTRO_DATA", details: "Ascendant not found" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const ascendantSignEn = firstHouse.zodiac_sign.name.en;
    if (!isValidSign(ascendantSignEn)) {
      console.error('Invalid ascendant sign');
      return new Response(
        JSON.stringify({ error: "INVALID_ASTRO_DATA", details: "Invalid ascendant sign" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const ascendantSign = zodiacMap[ascendantSignEn] || ascendantSignEn;
    const ascendantDegree = Math.floor(firstHouse.normDegree % 30);

    // Transform houses data to our format
    const houses = [];
    for (let i = 0; i < housesArray.length; i++) {
      const house = housesArray[i];
      const houseSignEn = house.zodiac_sign?.name?.en;
      
      if (!houseSignEn || !isValidSign(houseSignEn)) {
        console.error('Invalid house data at index', i);
        return new Response(
          JSON.stringify({ error: "INVALID_ASTRO_DATA", details: `Invalid house ${i+1} data` }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      houses.push({
        house: house.House,
        sign: zodiacMap[houseSignEn] || houseSignEn,
        degree: Math.floor(house.normDegree % 30)
      });
    }

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
