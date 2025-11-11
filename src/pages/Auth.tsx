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
import { Wallet, Eye, EyeOff, ShieldCheck, Mail, X, Lock } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { signUpSchema, validatePassword, passwordSchema } from "@/lib/passwordValidation";

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
  const [updatePasswordDialogOpen, setUpdatePasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    // Detectar se o usuário veio de um link de recuperação de senha
    const checkRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        setUpdatePasswordDialogOpen(true);
      }
    };

    checkRecoverySession();
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const fullName = formData.get("fullName") as string;

    // Validação com zod
    try {
      signUpSchema.parse({ fullName, email, password, confirmPassword });
    } catch (error: any) {
      setLoading(false);
      const firstError = error.errors?.[0]?.message || "Erro na validação dos dados";
      toast.error(firstError);
      return;
    }

    // Validação extra de senha forte
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setLoading(false);
      toast.error(passwordValidation.errors[0]);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName }
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
      // Create default categories
      await supabase.rpc('create_default_categories', { p_user_id: data.user.id });
      toast.success("Conta criada com sucesso! Bem-vindo ao Controle Financeiro.");
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

    // Verificar se o usuário tem categorias
    if (data.user) {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', data.user.id)
        .limit(1);

      // Se não tiver nenhuma categoria, adicionar as padrão
      if (!categoriesError && (!categories || categories.length === 0)) {
        await supabase.rpc('create_default_categories', { p_user_id: data.user.id });
        toast.success("Login realizado! Categorias padrão adicionadas à sua conta.");
      } else {
        toast.success("Login realizado com sucesso! Bem-vindo de volta.");
      }
    }

    setLoading(false);
    navigate("/");
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("reset-email") as string;

    if (!email) {
      toast.error("Email é obrigatório");
      setResetLoading(false);
      return;
    }

    // Enviar email de reset (Supabase não retorna erro se email não existe por segurança)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });

    setResetLoading(false);

    if (error) {
      toast.error("Erro ao enviar email: " + error.message);
      return;
    }

    // Como o Supabase não retorna erro para emails não cadastrados (por segurança),
    // sempre mostraremos mensagem de sucesso
    toast.success("Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.");
    setResetDialogOpen(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!newPassword || !confirmNewPassword) {
      toast.error("Preencha todos os campos");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("As senhas não coincidem");
      setLoading(false);
      return;
    }

    // Validar senha com os mesmos requisitos do cadastro
    try {
      passwordSchema.parse(newPassword);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || "Senha não atende aos requisitos de segurança";
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao atualizar senha: " + error.message);
      return;
    }

    toast.success("Senha atualizada com sucesso! Faça login com sua nova senha.");
    setUpdatePasswordDialogOpen(false);
    setNewPassword("");
    setConfirmNewPassword("");
    
    // Limpar o hash da URL
    window.history.replaceState(null, "", window.location.pathname);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Controle Financeiro</CardTitle>
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
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="login-password" 
                      name="password" 
                      type={showLoginPassword ? "text" : "password"} 
                      placeholder="••••••" 
                      required 
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
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
                          <Input 
                            id="reset-email" 
                            name="reset-email" 
                            type="email" 
                            placeholder="seu@email.com" 
                            required 
                          />
                        </div>
                        <Alert>
                          <ShieldCheck className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Por segurança, se o email existir em nossa base, você receberá 
                            um link para redefinir sua senha. O link expira em 1 hora.
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
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input 
                    id="signup-name" 
                    name="fullName" 
                    type="text" 
                    placeholder="Seu nome completo" 
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    name="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    required 
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="signup-password" 
                      name="password" 
                      type={showSignupPassword ? "text" : "password"} 
                      placeholder="Senha segura" 
                      required 
                      className="pr-10"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <PasswordStrengthIndicator password={signupPassword} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      name="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Digite a senha novamente" 
                      required 
                      className="pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {confirmPassword && signupPassword !== confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <X className="w-3 h-3" />
                      As senhas não coincidem
                    </p>
                  )}
                  {confirmPassword && signupPassword === confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Senhas coincidem
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta com segurança"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de atualização de senha após clicar no link do email */}
      <Dialog open={updatePasswordDialogOpen} onOpenChange={setUpdatePasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center">Redefinir Senha</DialogTitle>
            <DialogDescription className="text-center">
              Digite sua nova senha com segurança
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="w-3 h-3" />
                  As senhas não coincidem
                </p>
              )}
              {confirmNewPassword && newPassword === confirmNewPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Senhas coincidem
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar Senha"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;