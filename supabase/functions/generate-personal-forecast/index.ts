import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, birthDate, birthTime, birthPlace, zodiacSign } = await req.json();
    
    if (!firstName || !birthDate) {
      return new Response(
        JSON.stringify({ error: "Missing required data (firstName, birthDate)" }),
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

    const currentDate = new Date().toLocaleDateString('bg-BG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build context based on available data
    let birthContext = `Дата на раждане: ${birthDate}`;
    if (birthTime) {
      birthContext += `\nЧас на раждане: ${birthTime}`;
    }
    if (birthPlace) {
      birthContext += `\nМясто на раждане: ${birthPlace}`;
    }
    if (zodiacSign) {
      birthContext += `\nЗодиакален знак: ${zodiacSign}`;
    }

    const dataCompleteness = birthTime && birthPlace ? "пълни" : birthTime || birthPlace ? "частични" : "базови";

    const prompt = `Ти си личен астролог, който дава персонализирани прогнози. Създай персонална астрологична прогноза за днес за човек с име ${firstName}.

Данни за човека (${dataCompleteness} данни):
${birthContext}

Днешна дата: ${currentDate}

ВАЖНИ ИНСТРУКЦИИ:
1. Прогнозата ЗАДЪЛЖИТЕЛНО започва с името на човека, например: "${firstName}, днес е ден, в който..."
2. Пиши в 2-ро лице единствено число, сякаш говориш директно на човека
3. Това НЕ Е общ хороскоп - текстът трябва да звучи персонално насочен към ${firstName}
4. Тонът трябва да е спокоен, подкрепящ, НЕ фаталистичен
5. Избягвай категорични твърдения като "ще се случи" - използвай "може", "вероятно", "би било добре"

СТРУКТУРА НА ПРОГНОЗАТА:

**Текуща енергия** (1 кратък абзац)
Опиши текущата астрологична енергия и как тя се отнася към ${firstName} днес.

**Влияние върху живота** (1 кратък абзац)
Как тази енергия може да се отрази на:
- Решения, които трябва да вземе
- Комуникация с околните
- Емоционално състояние
- Работа или лични отношения

**Практически съвети**

✨ Какво е добре да направиш днес:
- (2-3 конкретни съвета)

⚠️ Какво е добре да избягваш:
- (2-3 конкретни неща)

Дължина: 2-4 кратки абзаца, за четене под 1 минута.
Пиши на български език.`;

    console.log('Generating personal forecast for:', firstName);
    
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
            content: 'Ти си опитен и съпричастен астролог. Даваш персонализирани прогнози, които са практични, вдъхновяващи и фокусирани върху конкретния човек. Никога не звучиш като общ хороскоп от вестник.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { 
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate forecast" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const aiData = await aiResponse.json();
    const forecast = aiData.choices[0].message.content;
    console.log('Personal forecast generated for:', firstName);

    return new Response(
      JSON.stringify({ 
        forecast,
        generatedAt: new Date().toISOString(),
        firstName
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Error in generate-personal-forecast:', error);
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
