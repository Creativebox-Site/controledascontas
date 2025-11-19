import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputGlass } from "@/components/ui/input-glass";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { getClientInfo } from "@/lib/deviceFingerprint";
import { z } from "zod";

const emailSchema = z.string().email("Email inválido");

export function OtpLoginForm() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [requestId] = useState(() => crypto.randomUUID());
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const checkEmailExists = async (emailToCheck: string) => {
    if (!emailToCheck) return;
    
    try {
      emailSchema.parse(emailToCheck);
    } catch {
      setEmailExists(null);
      return;
    }

    setIsCheckingEmail(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-email', {
        body: { email: emailToCheck },
      });

      if (error) {
        console.error("Error checking email:", error);
        setEmailExists(null);
      } else {
        setEmailExists(data?.exists || false);
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailExists(null);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    // Verificar se o email existe primeiro
    if (emailExists === null) {
      await checkEmailExists(email);
      return;
    }

    setIsLoading(true);

    try {
      const clientInfo = getClientInfo();
      
      // Chamar edge function para enviar OTP
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          email,
          requestId,
          deviceFingerprint: clientInfo.deviceFingerprint,
          userAgent: clientInfo.userAgent,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setExpiresAt(data.expiresAt);
        setStep("otp");
        toast.success("Código enviado com sucesso!", {
          description: "Verifique seu email",
        });
      } else {
        throw new Error(data?.error || "Erro ao enviar código");
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error("Erro ao enviar código", {
        description: error.message || "Tente novamente em alguns instantes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Por favor, insira o código completo");
      return;
    }

    setIsLoading(true);

    try {
      const clientInfo = getClientInfo();

      // Chamar edge function para verificar OTP
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          email,
          code: otp,
          requestId,
          deviceFingerprint: clientInfo.deviceFingerprint,
        },
      });

      if (error) throw error;

      if (data?.success && data.sessionUrl) {
        toast.success("Login realizado com sucesso!");
        
        // Redirecionar para a URL de sessão do magic link
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data?.error || "Código inválido");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error("Código inválido", {
        description: error.message || "Verifique o código e tente novamente",
      });
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setOtp("");
    setIsLoading(true);

    try {
      const clientInfo = getClientInfo();
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          email,
          requestId: crypto.randomUUID(),
          deviceFingerprint: clientInfo.deviceFingerprint,
          userAgent: clientInfo.userAgent,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setExpiresAt(data.expiresAt);
        toast.success("Novo código enviado!");
      } else {
        throw new Error(data?.error || "Erro ao reenviar código");
      }
    } catch (error: any) {
      toast.error("Erro ao reenviar código", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <InputGlass
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailExists(null);
              }}
              onBlur={() => checkEmailExists(email)}
              className="pl-10"
              disabled={isLoading || isCheckingEmail}
              required
            />
            {isCheckingEmail && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {emailExists === true && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Email cadastrado. Continue para receber o código
            </p>
          )}
          
          {emailExists === false && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email não cadastrado. Um código será enviado para criar sua conta
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isCheckingEmail || !email || emailExists === null}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando código...
            </>
          ) : isCheckingEmail ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando email...
            </>
          ) : emailExists === null ? (
            "Verificar email"
          ) : (
            "Enviar código"
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          {emailExists === false 
            ? "Vamos criar sua conta e enviar um código de verificação"
            : "Você receberá um código de verificação por email"
          }
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleOtpSubmit} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        className="mb-4"
        onClick={() => setStep("email")}
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Código de verificação</Label>
          <p className="text-sm text-muted-foreground">
            Enviamos um código de 6 dígitos para <strong>{email}</strong>
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {expiresAt && (
          <p className="text-xs text-muted-foreground text-center">
            O código expira em 10 minutos
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Verificar código
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResendCode}
          disabled={isLoading}
        >
          Reenviar código
        </Button>
      </div>
    </form>
  );
}
