import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
}

const APP_URL = "https://eclyptica.com";

// Cosmic header image (royalty-free space/stars image)
const HEADER_IMAGE = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=200&fit=crop&q=80";

// Validate email format
function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Sanitize name (remove special characters, limit length)
function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') return 'Приятел';
  return name.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '').trim().slice(0, 100) || 'Приятел';
}

const getWelcomeEmailTemplate = (fullName: string) => `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Добре дошли в Eclyptica</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  
  <!-- Wrapper Table -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f0f23; padding: 20px 10px;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color: #1a1a2e; border-radius: 16px; max-width: 600px; width: 100%; overflow: hidden; box-shadow: 0 8px 32px rgba(108, 92, 231, 0.2);">
          
          <!-- Header Image -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${HEADER_IMAGE}" alt="Звездно небе" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0;" />
            </td>
          </tr>
          
          <!-- Logo & Brand -->
          <tr>
            <td style="padding: 30px 24px 20px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #a78bfa; letter-spacing: 1px;">✨ Eclyptica</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #8b8ba7;">Вашият личен астрологичен гид</p>
            </td>
          </tr>
          
          <!-- Welcome Headline -->
          <tr>
            <td style="padding: 10px 24px 16px 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; line-height: 1.4;">
                Добре дошли, ${fullName}! 🌟
              </h2>
            </td>
          </tr>
          
          <!-- Main Message -->
          <tr>
            <td style="padding: 0 24px 24px 24px; text-align: center;">
              <p style="margin: 0; font-size: 15px; color: #c4c4d4; line-height: 1.7;">
                Радваме се, че се присъединихте към Eclyptica! Вече имате достъп до персонализирани астрологични прогнози, натални карти и много други функции.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 24px 32px 24px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #6c5ce7 0%, #a78bfa 100%); border-radius: 10px;">
                    <a href="${APP_URL}/home" target="_blank" style="display: inline-block; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 10px;">
                      Започнете сега
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent, #3d3d5c, transparent);"></div>
            </td>
          </tr>
          
          <!-- Features Section -->
          <tr>
            <td style="padding: 28px 24px;">
              <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #ffffff; text-align: center;">
                Открийте нашите услуги
              </h3>
              
              <!-- Feature 1 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td style="background-color: #252542; border-radius: 10px; padding: 16px;">
                    <a href="${APP_URL}/horoscopes" target="_blank" style="text-decoration: none; display: block;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 12px;">
                            <span style="font-size: 24px;">📅</span>
                          </td>
                          <td valign="top">
                            <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #a78bfa;">
                              Дневен хороскоп
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #8b8ba7; line-height: 1.5;">
                              Получавайте персонализирани прогнози всеки ден
                            </p>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Feature 2 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td style="background-color: #252542; border-radius: 10px; padding: 16px;">
                    <a href="${APP_URL}/natal-chart" target="_blank" style="text-decoration: none; display: block;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 12px;">
                            <span style="font-size: 24px;">🔮</span>
                          </td>
                          <td valign="top">
                            <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #a78bfa;">
                              Натална карта
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #8b8ba7; line-height: 1.5;">
                              Разберете позициите на планетите при раждането ви
                            </p>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Feature 3 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #252542; border-radius: 10px; padding: 16px;">
                    <a href="${APP_URL}/compatibility" target="_blank" style="text-decoration: none; display: block;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 12px;">
                            <span style="font-size: 24px;">💑</span>
                          </td>
                          <td valign="top">
                            <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #a78bfa;">
                              Анализ на съвместимост
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #8b8ba7; line-height: 1.5;">
                              Проверете съвместимостта с партньора си
                            </p>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #12121f; border-radius: 0 0 16px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #8b8ba7;">
                      Нужда от помощ? 
                      <a href="mailto:support@eclyptica.com" style="color: #a78bfa; text-decoration: none;">
                        Свържете се с нас
                      </a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #5c5c7a;">
                      © 2025 Eclyptica • Вашият път към звездите
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
`;

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
    // Verify service role key for internal calls only
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

    // Verify the caller is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, fullName }: WelcomeEmailRequest = await req.json();

    // Validate email
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is sending email to themselves (prevent spam abuse)
    if (user.email !== email) {
      console.error('User attempted to send email to different address:', email, 'vs', user.email);
      return new Response(
        JSON.stringify({ error: 'Can only send welcome email to your own address' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize name
    const sanitizedName = sanitizeName(fullName);

    console.log(`Sending welcome email to ${email}`);

    const emailResponse = await sendResendEmail(
      email,
      "Добре дошли в Eclyptica! ✨",
      getWelcomeEmailTemplate(sanitizedName)
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
