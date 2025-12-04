import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { person1, person2, dataLevel } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context based on data level
    let context = `Анализирай астрологичната съвместимост между:

Първи човек: ${person1.name || 'Човек 1'}
- Зодия: ${person1.zodiacSign}`;

    if (dataLevel !== 'basic') {
      context += `
- Дата на раждане: ${person1.birthDate}`;
      if (person1.birthTime) context += `\n- Час на раждане: ${person1.birthTime}`;
      if (person1.birthPlace) context += `\n- Място на раждане: ${person1.birthPlace}`;
    }

    context += `

Втори човек: ${person2.name || 'Човек 2'}
- Зодия: ${person2.zodiacSign}`;

    if (dataLevel !== 'basic') {
      context += `
- Дата на раждане: ${person2.birthDate}`;
      if (person2.birthTime) context += `\n- Час на раждане: ${person2.birthTime}`;
      if (person2.birthPlace) context += `\n- Място на раждане: ${person2.birthPlace}`;
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
    console.log('AI response:', JSON.stringify(data, null, 2));
    
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