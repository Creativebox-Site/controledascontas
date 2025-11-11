import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { passwordSchema } from "@/lib/passwordValidation";

export const PasswordChange = () => {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Validar senha com os mesmos requisitos do cadastro
    try {
      passwordSchema.parse(passwordData.newPassword);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || "Senha não atende aos requisitos de segurança";
      toast.error(errorMessage);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (error) {
      toast.error("Erro ao alterar senha: " + error.message);
      return;
    }

    toast.success("Senha alterada com sucesso!");
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Atualize sua senha de acesso
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova Senha</Label>
          <Input
            id="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            placeholder="Digite a nova senha"
          />
          <PasswordStrengthIndicator 
            password={passwordData.newPassword}
            showRequirements={true}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            placeholder="Confirme a nova senha"
          />
        </div>

        <Button onClick={handleChangePassword} className="w-full">
          Alterar Senha
        </Button>
      </CardContent>
    </Card>
  );
};
