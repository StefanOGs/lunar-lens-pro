import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

const validHoroscopeTypes = ['daily', 'weekly', 'monthly', 'yearly'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type = 'daily', zodiacSign } = await req.json();
    
    // Input validation
    if (!zodiacSign || typeof zodiacSign !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Zodiac sign is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validZodiacSigns.includes(zodiacSign)) {
      console.error('Invalid zodiac sign attempted:', zodiacSign);
      return new Response(
        JSON.stringify({ error: 'Invalid zodiac sign' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validHoroscopeTypes.includes(type)) {
      console.error('Invalid horoscope type attempted:', type);
      return new Response(
        JSON.stringify({ error: 'Invalid horoscope type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${type} horoscope for ${zodiacSign}`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get auth header from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with user's auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Validate user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we have a cached horoscope for today
    const today = new Date().toISOString().split('T')[0];
    const { data: cached } = await supabase
      .from('saved_horoscopes')
      .select('*')
      .eq('user_id', user.id)
      .eq('zodiac_sign', zodiacSign)
      .eq('horoscope_type', type)
      .eq('horoscope_date', today)
      .maybeSingle();

    if (cached) {
      console.log('Returning cached horoscope');
      return new Response(
        JSON.stringify({ horoscope: cached.content, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new horoscope with AI
    const systemPrompt = `Ти си опитен астролог, който пише персонализирани хороскопи на български език. 
Създавай вдъхновяващи, позитивни, но и реалистични прогнози. 
Използвай поетичен, но разбираем език. Фокусирай се върху любов, кариера, здраве и лични предизвикателства.`;

    let userPrompt = '';
    if (type === 'daily') {
      userPrompt = `Напиши дневен хороскоп за ${zodiacSign} за днес (${today}). 
Включи: общ тон на деня, любов и отношения, кариера и финанси, здраве и енергия.
Дължина: 150-200 думи.`;
    } else if (type === 'weekly') {
      userPrompt = `Напиши седмичен хороскоп за ${zodiacSign} за седмицата започваща от ${today}. 
Включи: основни теми, емоционални аспекти, професионални възможности, съвети за деня.
Дължина: 250-300 думи.`;
    } else if (type === 'monthly') {
      userPrompt = `Напиши месечен хороскоп за ${zodiacSign} за месеца започващ от ${today}. 
Включи: общи тенденции, любовни отношения, кариерно развитие, здравословно състояние, духовен растеж.
Дължина: 400-500 думи.`;
    } else if (type === 'yearly') {
      const year = new Date().getFullYear();
      userPrompt = `Напиши годишен хороскоп за ${zodiacSign} за ${year} година. 
Включи: общ преглед на годината, ключови периоди и транзити, любовен живот и взаимоотношения, кариерни перспективи и развитие, финансово състояние, здраве и лично развитие.
Дължина: 600-800 думи.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const horoscope = data.choices[0].message.content;

    // Save to database
    const { error: insertError } = await supabase
      .from('saved_horoscopes')
      .insert({
        user_id: user.id,
        zodiac_sign: zodiacSign,
        horoscope_type: type,
        horoscope_date: today,
        content: horoscope
      });

    if (insertError) {
      console.error('Error saving horoscope:', insertError);
    }

    return new Response(
      JSON.stringify({ horoscope, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-horoscope function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
