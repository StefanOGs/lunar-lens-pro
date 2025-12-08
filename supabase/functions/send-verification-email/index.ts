const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  fullName: string;
  verificationLink: string;
}

const getVerificationEmailTemplate = (fullName: string, verificationLink: string) => `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Потвърдете имейла си - Eclyptica</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #eee;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #6c5ce7; letter-spacing: -0.5px;">✨ Eclyptica</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #888;">Вашият личен астрологичен гид</p>
            </td>
          </tr>
          
          <!-- Icon -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="display: inline-block; width: 80px; height: 80px; background-color: #f0efff; border-radius: 50%; line-height: 80px; font-size: 36px;">
                ✉️
              </div>
            </td>
          </tr>
          
          <!-- Headline -->
          <tr>
            <td style="padding: 0 40px 20px 40px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #333; line-height: 1.4;">Потвърдете имейл адреса си</h2>
            </td>
          </tr>
          
          <!-- Main Message -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #555; line-height: 1.6;">
                Здравейте${fullName ? `, ${fullName}` : ''}!
              </p>
              <p style="margin: 0; font-size: 16px; color: #555; line-height: 1.6;">
                Благодарим ви за регистрацията в Eclyptica. За да завършите настройката на акаунта си, моля потвърдете имейл адреса си като кликнете на бутона по-долу.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <a href="${verificationLink}" target="_blank" style="display: inline-block; background-color: #6c5ce7; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(108, 92, 231, 0.4);">
                Потвърдете имейла
              </a>
            </td>
          </tr>
          
          <!-- Alternative Link -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #777; line-height: 1.6;">
                Ако бутонът не работи, копирайте и поставете следния линк в браузъра си:
              </p>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #6c5ce7; word-break: break-all;">
                <a href="${verificationLink}" style="color: #6c5ce7; text-decoration: none;">${verificationLink}</a>
              </p>
            </td>
          </tr>
          
          <!-- Security Note -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff8e6; border-radius: 8px; border-left: 4px solid #f5a623;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
                      ⚠️ <strong>Важно:</strong> Ако не сте създали акаунт в Eclyptica, можете спокойно да игнорирате този имейл.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">
                      Нужда от помощ? <a href="mailto:support@eclyptica.com" style="color: #6c5ce7; text-decoration: none;">Свържете се с нас</a>
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #999;">
                      © 2025 Eclyptica. Вашият път към звездите.
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
    const { email, fullName, verificationLink }: VerificationEmailRequest = await req.json();

    console.log(`Sending verification email to ${email}`);

    const emailResponse = await sendResendEmail(
      email,
      "Потвърдете имейл адреса си - Eclyptica",
      getVerificationEmailTemplate(fullName, verificationLink)
    );

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
