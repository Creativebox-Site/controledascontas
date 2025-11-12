import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UploadReportRequest {
  pdfBase64: string;
  fileName: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== VALIDAÇÃO DE AUTENTICAÇÃO =====
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Token de autenticação não fornecido" }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Criar cliente Supabase com o token do usuário
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { authorization: authHeader },
        },
      }
    );

    // Verificar se o token é válido e obter o userId
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Erro de autenticação:", authError);
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const { pdfBase64, fileName, userId }: UploadReportRequest = await req.json();

    if (!pdfBase64 || !fileName || !userId) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios ausentes" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // ===== VALIDAÇÃO DE AUTORIZAÇÃO =====
    // Garantir que o userId do request corresponde ao usuário autenticado
    if (userId !== user.id) {
      console.warn(`Tentativa de upload não autorizado: user ${user.id} tentou fazer upload para ${userId}`);
      return new Response(
        JSON.stringify({ error: "Não autorizado a fazer upload para este usuário" }),
        { 
          status: 403, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // ===== VALIDAÇÃO DE ARQUIVO =====
    // Verificar se é realmente um PDF válido
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return new Response(
        JSON.stringify({ error: "Apenas arquivos PDF são permitidos" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Verificar tamanho do arquivo (limite: 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes
    const fileSizeEstimate = (pdfBase64.length * 3) / 4; // Estimativa do tamanho decodificado
    
    if (fileSizeEstimate > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Arquivo muito grande. Máximo: 10MB" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Verificar se o base64 é válido
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Pattern.test(pdfBase64)) {
      return new Response(
        JSON.stringify({ error: "Formato de arquivo inválido" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Sanitizar o nome do arquivo para evitar path traversal
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100);

    console.log(`Upload autorizado para usuário: ${user.id}, arquivo: ${sanitizedFileName}`);

    // Usar service role key apenas para o upload (RLS não se aplica ao storage)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Converter base64 para Uint8Array
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Criar nome único para o arquivo
    const timestamp = Date.now();
    const uniqueFileName = `${userId}/${timestamp}-${sanitizedFileName}`;

    // Upload para o bucket reports
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("reports")
      .upload(uniqueFileName, bytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      throw uploadError;
    }

    // Gerar URL pública temporária (válida por 1 hora)
    const { data: urlData } = await supabaseAdmin.storage
      .from("reports")
      .createSignedUrl(uniqueFileName, 3600);

    if (!urlData?.signedUrl) {
      throw new Error("Erro ao gerar URL pública");
    }

    console.log("Upload realizado com sucesso:", uniqueFileName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        publicUrl: urlData.signedUrl,
        fileName: uniqueFileName 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Erro ao fazer upload do relatório:", error);
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
