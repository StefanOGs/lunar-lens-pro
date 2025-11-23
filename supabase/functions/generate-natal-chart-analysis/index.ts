import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chartData } = await req.json();
    
    if (!chartData) {
      return new Response(
        JSON.stringify({ error: "Missing chart data" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

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

    const { birthData, chart } = chartData;

    // Generate AI analysis prompt
    const prompt = `Генерирай пълен астрологичен анализ на натална карта на български език за човек роден на ${birthData.date} в ${birthData.time} в ${birthData.location}.

Астрологични данни:
- Слънце в ${chart.sunSign}
- Асцендент (Възходящ знак): ${chart.ascendant.sign} на ${chart.ascendant.degree}°

Позиции на планетите:
${chart.planets.map((p: any) => `- ${p.name}: ${p.sign} ${p.degree}° (${p.house} дом)`).join('\n')}

Върхове на домовете:
${chart.houses.map((h: any) => `- ${h.house} дом: ${h.sign} ${h.degree}°`).join('\n')}

Аспекти между планетите:
${chart.aspects.length > 0 ? chart.aspects.map((a: any) => `- ${a.planet1} ${a.aspect} ${a.planet2} (${a.angle}°)`).join('\n') : 'Няма значими аспекти'}

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

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Error in generate-natal-chart-analysis:', error);
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
