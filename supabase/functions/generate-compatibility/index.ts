import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid zodiac signs in Bulgarian
const validZodiacSigns = [
  'Овен', 'Телец', 'Близнаци', 'Рак', 'Лъв', 'Дева',
  'Везни', 'Скорпион', 'Стрелец', 'Козирог', 'Водолей', 'Риби'
];

const validDataLevels = ['basic', 'medium', 'full'];

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

    const { person1, person2, dataLevel } = await req.json();

    // Validate dataLevel
    if (!dataLevel || !validDataLevels.includes(dataLevel)) {
      return new Response(
        JSON.stringify({ error: 'Invalid data level' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate person1
    if (!person1 || !person1.zodiacSign || !validZodiacSigns.includes(person1.zodiacSign)) {
      return new Response(
        JSON.stringify({ error: 'Invalid zodiac sign for person 1' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate person2
    if (!person2 || !person2.zodiacSign || !validZodiacSigns.includes(person2.zodiacSign)) {
      return new Response(
        JSON.stringify({ error: 'Invalid zodiac sign for person 2' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate dates if provided
    if (dataLevel !== 'basic') {
      if (person1.birthDate && !validateDateFormat(person1.birthDate)) {
        return new Response(
          JSON.stringify({ error: 'Invalid date format for person 1' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (person2.birthDate && !validateDateFormat(person2.birthDate)) {
        return new Response(
          JSON.stringify({ error: 'Invalid date format for person 2' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (person1.birthTime && !validateTimeFormat(person1.birthTime)) {
        return new Response(
          JSON.stringify({ error: 'Invalid time format for person 1' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (person2.birthTime && !validateTimeFormat(person2.birthTime)) {
        return new Response(
          JSON.stringify({ error: 'Invalid time format for person 2' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Sanitize names and locations
    const sanitizedPerson1Name = sanitizeName(person1.name) || 'Човек 1';
    const sanitizedPerson2Name = sanitizeName(person2.name) || 'Човек 2';
    const sanitizedPerson1Place = sanitizeLocation(person1.birthPlace);
    const sanitizedPerson2Place = sanitizeLocation(person2.birthPlace);

    console.log(`Generating compatibility for ${sanitizedPerson1Name} and ${sanitizedPerson2Name}`);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context based on data level
    let context = `Анализирай астрологичната съвместимост между:

Първи човек: ${sanitizedPerson1Name}
- Зодия: ${person1.zodiacSign}`;

    if (dataLevel !== 'basic') {
      context += `
- Дата на раждане: ${person1.birthDate}`;
      if (person1.birthTime) context += `\n- Час на раждане: ${person1.birthTime}`;
      if (sanitizedPerson1Place) context += `\n- Място на раждане: ${sanitizedPerson1Place}`;
    }

    context += `

Втори човек: ${sanitizedPerson2Name}
- Зодия: ${person2.zodiacSign}`;

    if (dataLevel !== 'basic') {
      context += `
- Дата на раждане: ${person2.birthDate}`;
      if (person2.birthTime) context += `\n- Час на раждане: ${person2.birthTime}`;
      if (sanitizedPerson2Place) context += `\n- Място на раждане: ${sanitizedPerson2Place}`;
    }

    context += `

Ниво на анализ: ${dataLevel === 'full' ? 'пълен (с асцендент и планети)' : dataLevel === 'medium' ? 'среден (с допълнителни фактори)' : 'базов (само зодии)'}

Дай точки от 0 до 10 за всеки аспект и кратко тълкуване (2-3 изречения). Бъди реалистичен но позитивен.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'Ти си опитен астролог. Анализираш съвместимост между двама души на български език. Даваш точни оценки и кратки, ясни тълкувания.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "compatibility_result",
              description: "Структуриран резултат от анализа на съвместимост",
              parameters: {
                type: "object",
                properties: {
                  overallScore: {
                    type: "number",
                    description: "Обща оценка от 0 до 100"
                  },
                  aspects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Име на аспекта" },
                        score: { type: "number", description: "Оценка от 0 до 10" },
                        interpretation: { type: "string", description: "Кратко тълкуване (2-3 изречения)" }
                      },
                      required: ["name", "score", "interpretation"]
                    },
                    description: "6 аспекта: Емоционална съвместимост, Комуникация и разбирателство, Страст и химия, Житейски цели и ценности, Темперамент и ежедневие, Дългосрочен потенциал"
                  },
                  summary: {
                    type: "string",
                    description: "Финално обобщение (до 5 изречения)"
                  }
                },
                required: ["overallScore", "aspects", "summary"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "compatibility_result" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Твърде много заявки. Моля, опитайте отново след малко.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Необходимо е да добавите кредити.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received for compatibility analysis');
    
    // Extract structured result from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'compatibility_result') {
      throw new Error('Invalid response format from AI');
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-compatibility:', error);
    const errorMessage = error instanceof Error ? error.message : 'Възникна грешка при анализа.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
