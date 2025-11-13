import { AccountDeletion } from "@/components/AccountDeletion";
import { PasswordChange } from "@/components/PasswordChange";
import { ProfileEdit } from "@/components/ProfileEdit";
import { AppearanceSettings } from "@/components/AppearanceSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsProps {
  userId?: string;
}

export const Settings = ({ userId }: SettingsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Configurações</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie suas preferências e dados da conta
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6 mt-6">
          <ProfileEdit userId={userId} />
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <AppearanceSettings userId={userId} />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <PasswordChange />
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6 mt-6">
          <AccountDeletion userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};