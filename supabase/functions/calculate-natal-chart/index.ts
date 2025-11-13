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

    // Simplified planetary positions (for demo - real calculation would use ephemeris)
    const planets = [
      { name: "Слънце", sign: sunSign, degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      { name: "Луна", sign: zodiacSigns[Math.floor(Math.random() * 12)].sign, degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      { name: "Меркурий", sign: zodiacSigns[Math.floor(Math.random() * 12)].sign, degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      { name: "Венера", sign: zodiacSigns[Math.floor(Math.random() * 12)].sign, degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      { name: "Марс", sign: zodiacSigns[Math.floor(Math.random() * 12)].sign, degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
    ];

    // Calculate Ascendant (simplified - real calculation uses sidereal time)
    const ascendantIndex = Math.floor((hours * 2 + minutes / 30) % 12);
    const ascendant = zodiacSigns[ascendantIndex].sign;

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
- Асцендент: ${ascendant}
- Планети: ${planets.map(p => `${p.name} в ${p.sign} (${p.degree}°, ${p.house}-ти дом)`).join(', ')}

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
        ascendant,
        planets
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
