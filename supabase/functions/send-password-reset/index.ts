import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter a URL base da aplicação - usar a URL do header origin se disponível
    // Caso contrário, não especificar redirectTo e deixar o Supabase usar o Site URL configurado
    const origin = req.headers.get('origin');
    
    const generateLinkOptions: any = {
      type: 'recovery',
      email: email,
    };
    
    // Só adicionar redirectTo se houver um origin válido no header
    if (origin && !origin.includes('.lovableproject.com')) {
      generateLinkOptions.options = {
        redirectTo: `${origin}/update-password`
      };
    }

    // Gerar token de recuperação
    const { data, error } = await supabase.auth.admin.generateLink(generateLinkOptions);

    if (error) {
      console.error('Error generating recovery link:', error);
      // Retornar sucesso mesmo em caso de erro para prevenir enumeração de emails
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Se este email estiver cadastrado, você receberá um link de recuperação.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recoveryUrl = data.properties?.action_link;

    if (!recoveryUrl) {
      console.error('No recovery URL generated');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Se este email estiver cadastrado, você receberá um link de recuperação.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar email usando Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Serviço de email não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'App Controle <acesso@appcontrole.creativebox.com.br>',
        to: email,
        subject: 'Recuperação de Senha - App Controle',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                      <!-- Header com Logo -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #4FC3DC 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                          <img src="https://cd8343ae-9767-42cb-917a-70fd17803bd0.lovableproject.com/pwa-512x512.png" alt="App Controle" style="width: 80px; height: 80px; margin-bottom: 16px;" />
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">App Controle</h1>
                          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Creative Box</p>
                        </td>
                      </tr>
                      
                      <!-- Conteúdo -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">Recuperação de Senha</h2>
                          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">Recebemos uma solicitação para redefinir sua senha do App Controle. Clique no botão abaixo para criar uma nova senha:</p>
                          
                          <!-- Botão de Ação -->
                          <div style="text-align: center; margin: 0 0 32px 0;">
                            <a href="${recoveryUrl}" style="background: linear-gradient(135deg, #4FC3DC 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(79, 195, 220, 0.3);">
                              Redefinir Minha Senha
                            </a>
                          </div>
                          
                          <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">Ou copie e cole este link no seu navegador:</p>
                          <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 0 0 24px 0; word-break: break-all;">
                            <a href="${recoveryUrl}" style="color: #3b82f6; font-size: 12px; text-decoration: none;">${recoveryUrl}</a>
                          </div>
                          
                          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 0 0 24px 0;">
                            <p style="color: #92400e; margin: 0; font-size: 14px;">
                              ⏱️ <strong>Este link expira em 1 hora</strong> por motivos de segurança.
                            </p>
                          </div>
                          
                          <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">Se você não solicitou a recuperação de senha, ignore este email e seu acesso permanecerá seguro. Sua senha não será alterada.</p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                          <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center; line-height: 1.5;">
                            © ${new Date().getFullYear()} App Controle | Creative Box<br/>
                            Controle financeiro inteligente e seguro
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      console.error('Error sending email:', await emailResponse.text());
      // Ainda retornar sucesso para prevenir enumeração
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Se este email estiver cadastrado, você receberá um link de recuperação.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Password recovery email sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Se este email estiver cadastrado, você receberá um link de recuperação. Verifique sua caixa de entrada e spam.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Se este email estiver cadastrado, você receberá um link de recuperação.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
