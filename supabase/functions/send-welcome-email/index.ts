const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
}

const sendResendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Eclyptica <noreply@eclyptica.com>",
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

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${email}`);

    const emailResponse = await sendResendEmail(
      email,
      "Добре дошли в Eclyptica! 🌟",
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
              .header h1 {
                margin: 0;
                font-size: 32px;
              }
              .content {
                padding: 20px;
                background: #f9f9f9;
                border-radius: 10px;
              }
              .feature {
                margin: 15px 0;
                padding: 15px;
                background: white;
                border-left: 4px solid #667eea;
                border-radius: 5px;
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
              <h1>🌟 Добре дошли в Eclyptica!</h1>
            </div>
            
            <div class="content">
              <p>Здравейте, <strong>${fullName}</strong>!</p>
              
              <p>Благодарим ви, че се присъединихте към Eclyptica - вашият личен астрологичен гид!</p>
              
              <div class="feature">
                <strong>📅 Дневни хороскопи</strong>
                <p>Получавайте персонализирани астрологични прогнози всеки ден</p>
              </div>
              
              <div class="feature">
                <strong>🌙 Седмични и месечни прогнози</strong>
                <p>Планирайте бъдещето си с нашите подробни прогнози</p>
              </div>
              
              <div class="feature">
                <strong>🔮 Годишен хороскоп</strong>
                <p>Разберете какво ви очаква през цялата година</p>
              </div>
              
              <div class="cta">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || ''}" class="button">
                  Вижте вашия хороскоп
                </a>
              </div>
              
              <p>Ако имате въпроси или нужда от помощ, не се колебайте да се свържете с нас.</p>
              
              <p>Приятно пътешествие сред звездите! ✨</p>
            </div>
            
            <div class="footer">
              <p>© 2025 Eclyptica. Всички права запазени.</p>
              <p>Това е автоматично генериран имейл. Моля, не отговаряйте директно.</p>
            </div>
          </body>
        </html>
      `
    );

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
