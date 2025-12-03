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

    // Build prompt based on data level
    let prompt = '';
    
    if (dataLevel === 'basic') {
      prompt = `Направи базов астрологичен анализ на съвместимостта между двама души на БЪЛГАРСКИ ЕЗИК.

Първи човек: ${person1.name || 'Човек 1'}
- Зодия: ${person1.zodiacSign}

Втори човек: ${person2.name || 'Човек 2'}
- Зодия: ${person2.zodiacSign}

Дай кратък, но съдържателен анализ (около 200-300 думи) на съвместимостта им базиран на зодиакалните им знаци. Включи:
1. Общо описание на съвместимостта между тези две зодии
2. Силни страни на връзката
3. Потенциални предизвикателства
4. Съвет за хармонични отношения

Бъди позитивен, но реалистичен. Не споменавай, че анализът е базов.`;
    } else if (dataLevel === 'medium') {
      prompt = `Направи средно-детайлен астрологичен анализ на съвместимостта между двама души на БЪЛГАРСКИ ЕЗИК.

Първи човек: ${person1.name || 'Човек 1'}
- Зодия: ${person1.zodiacSign}
- Дата на раждане: ${person1.birthDate}
${person1.birthTime ? `- Час на раждане: ${person1.birthTime}` : ''}
${person1.birthPlace ? `- Място на раждане: ${person1.birthPlace}` : ''}

Втори човек: ${person2.name || 'Човек 2'}
- Зодия: ${person2.zodiacSign}
- Дата на раждане: ${person2.birthDate}
${person2.birthTime ? `- Час на раждане: ${person2.birthTime}` : ''}
${person2.birthPlace ? `- Място на раждане: ${person2.birthPlace}` : ''}

Дай детайлен анализ (около 400-500 думи) включващ:
1. Съвместимост по слънчеви знаци
2. Елементна съвместимост (огън, земя, въздух, вода)
3. Модална съвместимост (кардинален, фиксиран, мутабилен)
4. Емоционална и комуникационна динамика
5. Силни страни и предизвикателства
6. Практически съвети за връзката

Бъди позитивен, но реалистичен.`;
    } else {
      // Full analysis
      prompt = `Направи ПЪЛЕН и ЗАДЪЛБОЧЕН астрологичен анализ на съвместимостта между двама души на БЪЛГАРСКИ ЕЗИК.

Първи човек: ${person1.name || 'Човек 1'}
- Зодия: ${person1.zodiacSign}
- Дата на раждане: ${person1.birthDate}
- Час на раждане: ${person1.birthTime}
- Място на раждане: ${person1.birthPlace}
- Координати: ${person1.birthLat}, ${person1.birthLon}

Втори човек: ${person2.name || 'Човек 2'}
- Зодия: ${person2.zodiacSign}
- Дата на раждане: ${person2.birthDate}
- Час на раждане: ${person2.birthTime}
- Място на раждане: ${person2.birthPlace}
- Координати: ${person2.birthLat}, ${person2.birthLon}

Дай ИЗЧЕРПАТЕЛЕН астрологичен анализ (около 600-800 думи) включващ:

1. **Слънчева съвместимост** - как слънчевите им знаци взаимодействат
2. **Лунна съвместимост** - емоционална връзка и нужди (базирано на датата и часа)
3. **Асцендентна динамика** - първо впечатление и външно изразяване
4. **Венера и Марс** - романтична и сексуална съвместимост
5. **Меркурий** - комуникационен стил
6. **Елементен баланс** - огън, земя, въздух, вода
7. **Потенциални аспекти** - хармонични и напрегнати връзки между планетите
8. **Кармични връзки** - дълбоки духовни уроци
9. **Силни страни на връзката**
10. **Области за работа**
11. **Дългосрочен потенциал**
12. **Практически съвети за хармония**

Бъди задълбочен, мъдър и балансиран. Използвай астрологична терминология, но я обяснявай разбираемо.`;
    }

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
            content: 'Ти си опитен астролог, специализиран в анализ на съвместимост между партньори. Даваш мъдри, балансирани и полезни съвети на български език. Избягваш крайности и предоставяш практически насоки.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
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
    const analysis = data.choices?.[0]?.message?.content || 'Не можах да генерирам анализ.';

    return new Response(
      JSON.stringify({ analysis }),
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
