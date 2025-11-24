import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck, Mail, X } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import logoCreativeBox from "@/assets/logo-creative-box.png";
import { signUpSchema, validatePassword } from "@/lib/passwordValidation";
const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Detectar se o usuário veio de um link de recuperação de senha
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      navigate('/update-password');
      return;
    }

    // Ouvir eventos do Supabase para detectar PASSWORD_RECOVERY (mais robusto)
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPasswordValue = formData.get("confirmPassword") as string;

    // Validação: senha deve ser igual à confirmação
    if (password !== confirmPasswordValue) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado. Tente fazer login.");
      } else {
        toast.error("Erro ao criar conta: " + error.message);
      }
      return;
    }
    if (data.user) {
      // Como auto_confirm_email está ativo, usuário já está autenticado
      toast.success("Conta criada com sucesso! Bem-vindo!");
      navigate("/");
    }
  };
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) {
      toast.error("Por favor, preencha email e senha");
      setLoading(false);
      return;
    }
    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setLoading(false);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos. Verifique seus dados e tente novamente.");
      } else {
        toast.error("Erro ao fazer login: " + error.message);
      }
      return;
    }
    setLoading(false);
    toast.success("Login realizado com sucesso! Bem-vindo de volta.");
    navigate("/");
  };
  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("reset-email") as string || "").trim();
    if (!email) {
      toast.error("Email é obrigatório");
      setResetLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, digite um email válido");
      setResetLoading(false);
      return;
    }
    try {
      // Usar edge function personalizada para enviar e-mail com branding
      const {
        data,
        error
      } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email
        }
      });
      setResetLoading(false);
      if (error) {
        console.error("send-password-reset error:", error);
        toast.error("Erro ao processar solicitação. Tente novamente mais tarde.");
        return;
      }
      toast.success(data.message || "Se este e-mail estiver cadastrado, você receberá um link de recuperação. Verifique sua caixa de entrada e spam.");
      setResetDialogOpen(false);

      // Limpar o formulário
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      setResetLoading(false);
      console.error("Error in password reset:", error);
      toast.error("Erro ao processar solicitação. Tente novamente mais tarde.");
    }
  };
  
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center animate-fade-in">
              <img src={logoCreativeBox} alt="Creative Box Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl animate-fade-in">App Controle | Creative Box</CardTitle>
          <CardDescription>Gerencie suas finanças de forma inteligente</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <Alert className="mb-4">
                  <AlertDescription className="text-xs text-muted-foreground">
                    Não tem uma conta ainda? Use a aba <strong>Cadastrar</strong> para criar sua conta.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input id="login-password" name="password" type={showLoginPassword ? "text" : "password"} placeholder="••••••" required className="pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                      {showLoginPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="link" className="px-0 text-sm">
                        Esqueci a senha
                      </Button>
                    </DialogTrigger>
                     <DialogContent>
                      <DialogHeader>
                        <div className="flex justify-center mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <DialogTitle className="text-center">Recuperar Senha</DialogTitle>
                        <DialogDescription className="text-center">
                          Enviamos um e-mail para redefinir sua senha com segurança.
                          Digite seu email cadastrado abaixo.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email cadastrado</Label>
                          <Input id="reset-email" name="reset-email" type="email" placeholder="seu@email.com" required />
                        </div>
                        <Alert>
                          <ShieldCheck className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Se este e-mail estiver cadastrado, você receberá um link para 
                            redefinir sua senha. Verifique sua caixa de entrada e spam. 
                            O link expira em 1 hora.
                          </AlertDescription>
                        </Alert>
                        <Button type="submit" className="w-full" disabled={resetLoading}>
                          {resetLoading ? "Enviando..." : "Enviar link de recuperação"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Alert className="mb-4">
                  <AlertDescription className="text-xs text-muted-foreground">
                    Já tem uma conta? Use a aba <strong>Entrar</strong> para fazer login.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="seu@email.com" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Input id="signup-password" name="password" type={showSignupPassword ? "text" : "password"} placeholder="Senha segura" required className="pr-10" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                      {showSignupPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                  <PasswordStrengthIndicator password={signupPassword} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Digite a senha novamente" required className="pr-10" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                  {confirmPassword && signupPassword !== confirmPassword && <p className="text-xs text-destructive flex items-center gap-1">
                      <X className="w-3 h-3" />
                      As senhas não coincidem
                    </p>}
                  {confirmPassword && signupPassword === confirmPassword && <p className="text-xs text-green-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Senhas coincidem
                    </p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta com segurança"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;