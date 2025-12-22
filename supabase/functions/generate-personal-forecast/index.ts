import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

// Valid zodiac signs in Bulgarian
const validZodiacSigns = [
  'Овен', 'Телец', 'Близнаци', 'Рак', 'Лъв', 'Дева',
  'Везни', 'Скорпион', 'Стрелец', 'Козирог', 'Водолей', 'Риби'
];

// Sanitize name (remove special characters, limit length)
function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '').trim().slice(0, 100);
}

// Validate date format (YYYY-MM-DD)
function validateDateFormat(date: string): boolean {
  if (!date || typeof date !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

// Validate time format (HH:MM or HH:MM:SS)
function validateTimeFormat(time: string): boolean {
  if (!time || typeof time !== 'string') return true; // Time is optional
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  return timeRegex.test(time);
}

// Sanitize location
function sanitizeLocation(location: string): string {
  if (!location || typeof location !== 'string') return '';
  return location.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s,.\-]/g, '').trim().slice(0, 200);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { firstName, birthDate, birthTime, birthPlace, zodiacSign } = await req.json();
    
    // Validate required fields
    if (!firstName || typeof firstName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!birthDate || !validateDateFormat(birthDate)) {
      return new Response(
        JSON.stringify({ error: 'Valid birth date is required (YYYY-MM-DD)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (birthTime && !validateTimeFormat(birthTime)) {
      return new Response(
        JSON.stringify({ error: 'Invalid time format (HH:MM)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (zodiacSign && !validZodiacSigns.includes(zodiacSign)) {
      return new Response(
        JSON.stringify({ error: 'Invalid zodiac sign' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeName(firstName);
    const sanitizedPlace = sanitizeLocation(birthPlace);

    if (!sanitizedName) {
      return new Response(
        JSON.stringify({ error: 'Invalid name provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    if (sanitizedPlace) {
      birthContext += `\nМясто на раждане: ${sanitizedPlace}`;
    }
    if (zodiacSign) {
      birthContext += `\nЗодиакален знак: ${zodiacSign}`;
    }

    const dataCompleteness = birthTime && sanitizedPlace ? "пълни" : birthTime || sanitizedPlace ? "частични" : "базови";

    const prompt = `Ти си личен астролог, който дава персонализирани прогнози. Създай персонална астрологична прогноза за днес за човек с име ${sanitizedName}.

Данни за човека (${dataCompleteness} данни):
${birthContext}

Днешна дата: ${currentDate}

ВАЖНИ ИНСТРУКЦИИ:
1. Прогнозата ЗАДЪЛЖИТЕЛНО започва с името на човека, например: "${sanitizedName}, днес е ден, в който..."
2. Пиши в 2-ро лице единствено число, сякаш говориш директно на човека
3. Това НЕ Е общ хороскоп - текстът трябва да звучи персонално насочен към ${sanitizedName}
4. Тонът трябва да е спокоен, подкрепящ, НЕ фаталистичен
5. Избягвай категорични твърдения като "ще се случи" - използвай "може", "вероятно", "би било добре"

СТРУКТУРА НА ПРОГНОЗАТА:

**Текуща енергия** (1 кратък абзац)
Опиши текущата астрологична енергия и как тя се отнася към ${sanitizedName} днес.

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

    console.log('Generating personal forecast for:', sanitizedName);
    
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
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate forecast" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const forecast = aiData.choices[0].message.content;
    console.log('Personal forecast generated for:', sanitizedName);

    return new Response(
      JSON.stringify({ 
        forecast,
        generatedAt: new Date().toISOString(),
        firstName: sanitizedName
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in generate-personal-forecast:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
