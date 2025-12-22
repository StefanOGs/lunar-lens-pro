import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Sanitize location query (limit length, basic sanitization)
function sanitizeLocationQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  // Allow alphanumeric, Cyrillic, spaces, commas, periods, and hyphens
  return query.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s,.\-]/g, '').trim().slice(0, 200);
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
        JSON.stringify({ error: "Authentication required" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { query } = await req.json();
    
    // Validate and sanitize query
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const sanitizedQuery = sanitizeLocationQuery(query);
    
    if (sanitizedQuery.length < 2) {
      return new Response(
        JSON.stringify({ error: "Query too short" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (sanitizedQuery.length > 200) {
      return new Response(
        JSON.stringify({ error: "Query too long" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const apiKey = Deno.env.get('VITE_GEOAPIFY_API_KEY');
    if (!apiKey) {
      console.error('VITE_GEOAPIFY_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log('Geocoding query:', sanitizedQuery);

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(sanitizedQuery)}&type=city&format=json&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Geoapify API error:', data);
      return new Response(
        JSON.stringify({ error: data.message || "Geocoding failed" }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ results: data.results || [] }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Error in geocode-location:', error);
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
