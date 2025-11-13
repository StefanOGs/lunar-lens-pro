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

    // Parse birth data
    const birthDateTime = new Date(`${birthDate}T${birthTime}`);
    const year = birthDateTime.getFullYear();
    const month = birthDateTime.getMonth() + 1;
    const day = birthDateTime.getDate();
    const hours = birthDateTime.getHours();
    const minutes = birthDateTime.getMinutes();

    // Calculate zodiac sign
    const zodiacSigns = [
      { sign: "Козирог", start: [12, 22], end: [1, 19] },
      { sign: "Водолей", start: [1, 20], end: [2, 18] },
      { sign: "Риби", start: [2, 19], end: [3, 20] },
      { sign: "Овен", start: [3, 21], end: [4, 19] },
      { sign: "Телец", start: [4, 20], end: [5, 20] },
      { sign: "Близнаци", start: [5, 21], end: [6, 20] },
      { sign: "Рак", start: [6, 21], end: [7, 22] },
      { sign: "Лъв", start: [7, 23], end: [8, 22] },
      { sign: "Дева", start: [8, 23], end: [9, 22] },
      { sign: "Везни", start: [9, 23], end: [10, 22] },
      { sign: "Скорпион", start: [10, 23], end: [11, 21] },
      { sign: "Стрелец", start: [11, 22], end: [12, 21] },
    ];

    let sunSign = "Неизвестен";
    for (const z of zodiacSigns) {
      const inRange = z.start[0] === z.end[0]
        ? (month === z.start[0] && day >= z.start[1] && day <= z.end[1])
        : ((month === z.start[0] && day >= z.start[1]) || (month === z.end[0] && day <= z.end[1]));
      
      if (inRange) {
        sunSign = z.sign;
        break;
      }
    }

    // Calculate deterministic planetary positions based on date
    // Using simplified but deterministic formulas based on birth date
    const dayOfYear = Math.floor((birthDateTime.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
    const yearsSince2000 = year - 2000;
    
    // Deterministic planetary cycles (simplified tropical zodiac positions)
    const calculatePlanetPosition = (daysPer360: number, offset: number) => {
      const totalDays = yearsSince2000 * 365.25 + dayOfYear;
      const degrees = ((totalDays / daysPer360) * 360 + offset) % 360;
      const signIndex = Math.floor(degrees / 30);
      const degreeInSign = Math.floor(degrees % 30);
      return { sign: zodiacSigns[signIndex].sign, degree: degreeInSign };
    };

    // Calculate Ascendant deterministically based on time and location
    const localSiderealTime = (hours + minutes / 60 + location.lon / 15) % 24;
    const ascendantIndex = Math.floor((localSiderealTime * 15) / 30) % 12;
    const ascendantDegree = Math.floor((localSiderealTime * 15) % 30);
    const ascendant = zodiacSigns[ascendantIndex].sign;

    // Calculate house cusps based on Ascendant (simplified Placidus-style)
    const houses = Array.from({ length: 12 }, (_, i) => {
      const houseSignIndex = (ascendantIndex + i) % 12;
      return { house: i + 1, sign: zodiacSigns[houseSignIndex].sign, degree: Math.floor((ascendantDegree + i * 2.5) % 30) };
    });

    // Calculate planetary positions deterministically
    const sunPos = calculatePlanetPosition(365.25, 280); // Sun cycle
    const moonPos = calculatePlanetPosition(27.32, 130); // Moon cycle
    const mercuryPos = calculatePlanetPosition(87.97, 50); // Mercury cycle
    const venusPos = calculatePlanetPosition(224.7, 180); // Venus cycle
    const marsPos = calculatePlanetPosition(686.98, 320); // Mars cycle
    const jupiterPos = calculatePlanetPosition(4332.59, 40); // Jupiter cycle
    const saturnPos = calculatePlanetPosition(10759.22, 260); // Saturn cycle
    const uranusPos = calculatePlanetPosition(30688.5, 150); // Uranus cycle
    const neptunePos = calculatePlanetPosition(60182, 220); // Neptune cycle
    const plutoPos = calculatePlanetPosition(90560, 90); // Pluto cycle

    // Assign planets to houses based on their positions
    const getHouse = (planetDegree: number, signName: string) => {
      const signIndex = zodiacSigns.findIndex(z => z.sign === signName);
      const totalDegree = (signIndex * 30 + planetDegree) % 360;
      const ascendantTotalDegree = (ascendantIndex * 30 + ascendantDegree) % 360;
      const houseDegree = (totalDegree - ascendantTotalDegree + 360) % 360;
      return Math.floor(houseDegree / 30) + 1;
    };

    const planets = [
      { name: "Слънце", sign: sunPos.sign, degree: sunPos.degree, house: getHouse(sunPos.degree, sunPos.sign) },
      { name: "Луна", sign: moonPos.sign, degree: moonPos.degree, house: getHouse(moonPos.degree, moonPos.sign) },
      { name: "Меркурий", sign: mercuryPos.sign, degree: mercuryPos.degree, house: getHouse(mercuryPos.degree, mercuryPos.sign) },
      { name: "Венера", sign: venusPos.sign, degree: venusPos.degree, house: getHouse(venusPos.degree, venusPos.sign) },
      { name: "Марс", sign: marsPos.sign, degree: marsPos.degree, house: getHouse(marsPos.degree, marsPos.sign) },
      { name: "Юпитер", sign: jupiterPos.sign, degree: jupiterPos.degree, house: getHouse(jupiterPos.degree, jupiterPos.sign) },
      { name: "Сатурн", sign: saturnPos.sign, degree: saturnPos.degree, house: getHouse(saturnPos.degree, saturnPos.sign) },
      { name: "Уран", sign: uranusPos.sign, degree: uranusPos.degree, house: getHouse(uranusPos.degree, uranusPos.sign) },
      { name: "Нептун", sign: neptunePos.sign, degree: neptunePos.degree, house: getHouse(neptunePos.degree, neptunePos.sign) },
      { name: "Плутон", sign: plutoPos.sign, degree: plutoPos.degree, house: getHouse(plutoPos.degree, plutoPos.sign) },
    ];

    // Calculate major aspects between planets
    const aspects = [];
    const aspectTypes = [
      { name: "Конюнкция", degree: 0, orb: 8 },
      { name: "Опозиция", degree: 180, orb: 8 },
      { name: "Квадрат", degree: 90, orb: 6 },
      { name: "Тригон", degree: 120, orb: 8 },
      { name: "Секстил", degree: 60, orb: 6 },
    ];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        
        const sign1Index = zodiacSigns.findIndex(z => z.sign === planet1.sign);
        const sign2Index = zodiacSigns.findIndex(z => z.sign === planet2.sign);
        
        const totalDegree1 = sign1Index * 30 + planet1.degree;
        const totalDegree2 = sign2Index * 30 + planet2.degree;
        
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
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

    const prompt = `Генерирай пълен астрологичен анализ на натална карта на български език за човек роден на ${birthDate} в ${birthTime} в ${location.city}, ${location.country}.

Данни за натална карта:
- Слънчев знак: ${sunSign}
- Асцендент: ${ascendant} (${ascendantDegree}°)
- Планети: ${planets.map(p => `${p.name} в ${p.sign} (${p.degree}°, ${p.house}-ти дом)`).join(', ')}
- Домове: ${houses.map(h => `${h.house}-ти дом в ${h.sign}`).join(', ')}
- Аспекти: ${aspects.map(a => `${a.planet1} ${a.aspect} ${a.planet2} (${a.angle}°)`).join(', ')}

Анализът трябва да включва:
1. Общо описание на личността (2-3 параграфа)
2. Емоционална природа и вътрешен свят (Луна)
3. Комуникация и мислене (Меркурий)
4. Любов и отношения (Венера)
5. Енергия и амбиция (Марс)
6. Жизнен път и предназначение (Асцендент)

Бъди конкретен, позитивен и вдъхновяващ. Използвай професионален астрологичен език.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Ти си професионален астролог с дълбоки познания в натална астрология. Отговаряш на български език.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { 
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate analysis" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    const result = {
      birthData: {
        date: birthDate,
        time: birthTime,
        location: location.city + ', ' + location.country,
        coordinates: { lat: location.lat, lon: location.lon }
      },
      chart: {
        sunSign,
        ascendant: { sign: ascendant, degree: ascendantDegree },
        planets,
        houses,
        aspects
      },
      analysis
    };

    return new Response(
      JSON.stringify(result),
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
