import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  redirectTo: string;
}

// Cosmic header image
const HEADER_IMAGE = "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=180&fit=crop&q=80";

const getPasswordResetEmailTemplate = (resetLink: string, expiresInMinutes: number = 60) => `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Нулиране на парола - Eclyptica</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f0f23; padding: 20px 10px;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color: #1a1a2e; border-radius: 16px; max-width: 600px; width: 100%; overflow: hidden; box-shadow: 0 8px 32px rgba(108, 92, 231, 0.2);">
          
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${HEADER_IMAGE}" alt="Нощно небе" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0;" />
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px 24px 20px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #a78bfa; letter-spacing: 1px;">✨ Eclyptica</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #8b8ba7;">Вашият личен астрологичен гид</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 10px 24px 20px 24px; text-align: center;">
              <div style="display: inline-block; width: 70px; height: 70px; background-color: #2d1f2d; border-radius: 50%; line-height: 70px; font-size: 32px;">
                🔐
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 24px 16px 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; line-height: 1.4;">
                Нулиране на парола
              </h2>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 24px 24px 24px; text-align: center;">
              <p style="margin: 0; font-size: 15px; color: #c4c4d4; line-height: 1.7;">
                Получихме заявка за нулиране на паролата на вашия акаунт. Кликнете на бутона по-долу, за да създадете нова парола.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 24px 20px 24px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #6c5ce7 0%, #a78bfa 100%); border-radius: 10px;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 10px;">
                      Нулиране на паролата
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 24px 24px 24px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #252542; border-radius: 10px;">
                <tr>
                  <td style="padding: 14px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #a78bfa; font-weight: 500;">
                      ⏱️ Този линк е валиден за ${expiresInMinutes} минути
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 24px 24px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #8b8ba7; line-height: 1.6;">
                Ако бутонът не работи, копирайте този линк:
              </p>
              <p style="margin: 0; font-size: 12px; color: #a78bfa; word-break: break-all; background-color: #252542; padding: 12px; border-radius: 8px;">
                <a href="${resetLink}" style="color: #a78bfa; text-decoration: none;">${resetLink}</a>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #2d2a1f; border-radius: 10px; border-left: 4px solid #f5a623;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #d4c4a0; line-height: 1.6;">
                      ⚠️ <strong>Важно:</strong> Ако не сте поискали нулиране на паролата, можете спокойно да игнорирате този имейл.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
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
    const { email, redirectTo }: PasswordResetRequest = await req.json();

    console.log(`Processing password reset request for ${email}`);

    // Create admin client to generate recovery link
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Generate the recovery link using admin API
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectTo,
      },
    });

    if (linkError) {
      console.error("Error generating recovery link:", linkError);
      // Don't reveal if user exists or not for security
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!data?.properties?.action_link) {
      console.log("No action link generated (user may not exist)");
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resetLink = data.properties.action_link;
    console.log(`Recovery link generated for ${email}`);

    // Send custom email via Resend
    const emailResponse = await sendResendEmail(
      email,
      "Нулиране на парола - Eclyptica",
      getPasswordResetEmailTemplate(resetLink, 60)
    );

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in custom-auth-email function:", error);
    // Always return success to not reveal user existence
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
