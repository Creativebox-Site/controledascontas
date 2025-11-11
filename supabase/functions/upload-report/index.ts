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
    const { pdfBase64, fileName, userId }: UploadReportRequest = await req.json();

    if (!pdfBase64 || !fileName || !userId) {
      throw new Error("Parâmetros obrigatórios ausentes");
    }

    const supabase = createClient(
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
    const uniqueFileName = `${userId}/${timestamp}-${fileName}`;

    // Upload para o bucket reports
    const { data: uploadData, error: uploadError } = await supabase.storage
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
    const { data: urlData } = await supabase.storage
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
