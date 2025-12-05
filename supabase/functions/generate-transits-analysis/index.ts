import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zodiacSign, birthDate, birthTime, currentPlanets } = await req.json();

    if (!zodiacSign) {
      return new Response(
        JSON.stringify({ error: "Missing zodiac sign" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentDate = new Date().toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const planetPositions = currentPlanets
      .map((p: any) => `${p.planet}: ${p.sign} ${p.degree}°${p.retrograde ? " (ретрограден)" : ""}`)
      .join("\n");

    const systemPrompt = `Ти си професионален астролог, специализиран в транзитна астрология и прогресии. 
Даваш точни, персонализирани и практични тълкувания на български език.
Фокусираш се върху реалистични и приложими съвети, без прекалено позитивни или негативни крайности.`;

    const userPrompt = `Генерирай персонализиран анализ на транзитите и прогресиите за човек със слънчев знак ${zodiacSign}.

Дата на раждане: ${birthDate || "неизвестна"}
Час на раждане: ${birthTime || "неизвестен"}
Текуща дата: ${currentDate}

Текущи планетарни позиции:
${planetPositions}

Върни структуриран JSON отговор с транзити, прогресии, преглед и ключови дати.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "transits_analysis",
              description: "Връща структуриран анализ на транзитите и прогресиите",
              parameters: {
                type: "object",
                properties: {
                  overview: {
                    type: "string",
                    description: "Общ преглед на текущия астрологичен период (3-4 параграфа)"
                  },
                  transits: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        planet: { type: "string", description: "Име на транзитиращата планета" },
                        currentSign: { type: "string", description: "Текущ знак на планетата" },
                        natalAspect: { type: "string", description: "Аспект към натална планета (Съвпад, Тригон, Квадрат, Опозиция, Секстил)" },
                        natalPlanet: { type: "string", description: "Натална планета, която се засяга" },
                        influence: { type: "string", enum: ["positive", "challenging", "neutral"], description: "Тип влияние" },
                        intensity: { type: "number", description: "Интензивност от 1 до 10" },
                        description: { type: "string", description: "Описание на влиянието (2-3 изречения)" },
                        duration: { type: "string", description: "Приблизителна продължителност" }
                      },
                      required: ["planet", "currentSign", "natalAspect", "natalPlanet", "influence", "intensity", "description", "duration"]
                    },
                    description: "Списък с активни транзити (5-7 транзита)"
                  },
                  progressions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        planet: { type: "string", description: "Име на прогресираната планета" },
                        progressedSign: { type: "string", description: "Прогресиран знак" },
                        natalSign: { type: "string", description: "Натален знак" },
                        theme: { type: "string", description: "Основна тема на прогресията" },
                        description: { type: "string", description: "Описание на влиянието (2-3 изречения)" },
                        yearsActive: { type: "string", description: "Период на активност" }
                      },
                      required: ["planet", "progressedSign", "natalSign", "theme", "description", "yearsActive"]
                    },
                    description: "Списък с активни прогресии (2-4 прогресии)"
                  },
                  keyDates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string", description: "Дата в формат 'DD месец YYYY'" },
                        event: { type: "string", description: "Описание на астрологичното събитие" },
                        importance: { type: "string", enum: ["high", "medium", "low"], description: "Важност на събитието" }
                      },
                      required: ["date", "event", "importance"]
                    },
                    description: "Ключови астрологични дати за следващите 3 месеца (6-10 дати)"
                  }
                },
                required: ["overview", "transits", "progressions", "keyDates"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "transits_analysis" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "transits_analysis") {
      throw new Error("Invalid AI response structure");
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-transits-analysis:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
