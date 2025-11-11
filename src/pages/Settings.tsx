import { AccountDeletion } from "@/components/AccountDeletion";

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

      <AccountDeletion userId={userId} />
    </div>
  );
};