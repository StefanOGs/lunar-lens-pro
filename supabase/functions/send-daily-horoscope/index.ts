import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const sendResendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "AstroInsight <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileWithEmail {
  user_id: string;
  full_name: string;
  zodiac_sign: string;
  email: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily horoscope email job...");

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, zodiac_sign");

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    console.log(`Found ${profiles?.length || 0} profiles`);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to send emails to" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user emails from auth.users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // Map emails to profiles
    const emailMap = new Map(users.map(u => [u.id, u.email]));
    const profilesWithEmail: ProfileWithEmail[] = profiles
      .filter(p => emailMap.has(p.user_id))
      .map(p => ({
        ...p,
        email: emailMap.get(p.user_id)!,
      }));

    console.log(`Sending emails to ${profilesWithEmail.length} users`);

    // Send emails
    const emailPromises = profilesWithEmail.map(async (profile) => {
      try {
        // Generate horoscope for user
        const today = new Date().toISOString().split('T')[0];
        
        // Check if horoscope already exists for today
        const { data: existingHoroscope } = await supabaseAdmin
          .from("saved_horoscopes")
          .select("content")
          .eq("user_id", profile.user_id)
          .eq("zodiac_sign", profile.zodiac_sign)
          .eq("horoscope_type", "daily")
          .eq("horoscope_date", today)
          .single();

        let horoscopeContent = existingHoroscope?.content;

        // If no horoscope exists, generate one
        if (!horoscopeContent) {
          const generateResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-horoscope`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                zodiacSign: profile.zodiac_sign,
                type: "daily",
                userId: profile.user_id,
              }),
            }
          );

          if (!generateResponse.ok) {
            throw new Error("Failed to generate horoscope");
          }

          const generateData = await generateResponse.json();
          horoscopeContent = generateData.horoscope;
        }

        // Send email
        await sendResendEmail(
          profile.email,
          `${profile.zodiac_sign} - Вашият дневен хороскоп 🌟`,
          `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                  }
                  .header {
                    text-align: center;
                    padding: 30px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px;
                    margin-bottom: 30px;
                  }
                  .horoscope {
                    padding: 25px;
                    background: #f9f9f9;
                    border-radius: 10px;
                    white-space: pre-wrap;
                  }
                  .cta {
                    text-align: center;
                    margin: 30px 0;
                  }
                  .button {
                    display: inline-block;
                    padding: 15px 30px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                    font-size: 14px;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>🌟 ${profile.zodiac_sign}</h1>
                  <p>${new Date().toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <p>Здравейте, <strong>${profile.full_name}</strong>!</p>
                
                <div class="horoscope">
                  ${horoscopeContent}
                </div>
                
                <div class="cta">
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || ''}/dashboard" class="button">
                    Вижте повече прогнози
                  </a>
                </div>
                
                <div class="footer">
                  <p>© 2025 AstroInsight. Всички права запазени.</p>
                  <p>Ако не искате да получавате дневни хороскопи, можете да промените настройките си в профила.</p>
                </div>
              </body>
            </html>
          `
        );

        console.log(`Email sent to ${profile.email}`);
        return { success: true, email: profile.email };
      } catch (error: any) {
        console.error(`Failed to send email to ${profile.email}:`, error);
        return { success: false, email: profile.email, error: error.message };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    console.log(`Daily horoscope emails sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        message: "Daily horoscope emails sent",
        successful,
        failed,
        total: results.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-horoscope function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
