import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, RefreshCw } from "lucide-react";

interface EmailVerificationBannerProps {
  email: string;
}

export const EmailVerificationBanner = ({ email }: EmailVerificationBannerProps) => {
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    setResending(false);

    if (error) {
      toast.error("Erro ao reenviar email de verificação: " + error.message);
    } else {
      toast.success("Email de verificação reenviado! Verifique sua caixa de entrada.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        <Alert className="border-warning">
          <Mail className="h-5 w-5 text-warning" />
          <AlertDescription className="ml-2">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Verifique seu email</h3>
                <p className="text-sm text-muted-foreground">
                  Enviamos um email de verificação para <strong>{email}</strong>.
                  Por favor, verifique sua caixa de entrada e clique no link para confirmar seu cadastro.
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={resending}
                  variant="outline"
                  className="w-full"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Reenviar email de verificação
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full"
                >
                  Sair
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Não recebeu o email? Verifique sua pasta de spam ou lixeira.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
