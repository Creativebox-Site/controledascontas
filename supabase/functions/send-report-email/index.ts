import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendReportEmailRequest {
  to: string;
  userName: string;
  pdfBase64: string;
  fileName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, userName, pdfBase64, fileName }: SendReportEmailRequest = await req.json();

    if (!to || !pdfBase64 || !fileName) {
      throw new Error("Parâmetros obrigatórios ausentes");
    }

    const emailResponse = await resend.emails.send({
      from: "Controle Financeiro <onboarding@resend.dev>",
      to: [to],
      subject: "Seu Relatório Financeiro está pronto!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Relatório Financeiro</h1>
              </div>
              <div class="content">
                <h2>Olá${userName ? `, ${userName}` : ''}! 👋</h2>
                <p>Seu relatório financeiro foi gerado com sucesso e está anexado a este e-mail.</p>
                
                <p><strong>Este relatório contém:</strong></p>
                <ul>
                  <li>✅ Resumo completo das suas finanças</li>
                  <li>✅ Análise de receitas e despesas</li>
                  <li>✅ Status dos seus investimentos</li>
                  <li>✅ Progresso das suas metas</li>
                </ul>

                <p>Continue acompanhando suas finanças e alcançando seus objetivos! 💪</p>

                <div class="footer">
                  <p>📧 Este é um e-mail automático do seu sistema de Controle Financeiro</p>
                  <p>Gerado em ${new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
