import { useState, useEffect } from "react";
import { User, Camera, Smile, Image as ImageIcon, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sb } from "@/lib/sb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AvatarImageEditor } from "./AvatarImageEditor";
import { EmojiPickerDialog } from "./EmojiPickerDialog";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { passwordSchema } from "@/lib/passwordValidation";

interface ProfileMenuProps {
  userId?: string;
}

export const ProfileMenu = ({ userId }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "🐷",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [uploading, setUploading] = useState(false);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;

    const { data, error } = await sb
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao carregar perfil:", error);
      return;
    }

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        avatar_url: data.avatar_url || "🐷",
      });
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    const { error } = await sb
      .from("profiles")
      .update({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Erro ao salvar perfil");
      return;
    }

    toast.success("Perfil atualizado!");
    setOpen(false);
  };

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
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setOpen(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !userId) return;

    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setImageEditorOpen(true);
  };

  const handleSaveCroppedImage = async (croppedImage: Blob) => {
    if (!userId) return;

    setUploading(true);

    const fileName = `${userId}/avatar-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(fileName, croppedImage, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao fazer upload da imagem");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("profiles").getPublicUrl(fileName);

    setProfile({ ...profile, avatar_url: data.publicUrl });
    setUploading(false);
    toast.success("Foto atualizada!");
  };

  const handleEmojiSelect = (emoji: string) => {
    setProfile({ ...profile, avatar_url: emoji });
    toast.success("Emoji atualizado!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile.avatar_url.startsWith("http") ? profile.avatar_url : undefined} />
            <AvatarFallback>{profile.avatar_url.startsWith("http") ? <User className="w-4 h-4" /> : profile.avatar_url}</AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url.startsWith("http") ? profile.avatar_url : undefined} />
                <AvatarFallback className="text-4xl">{profile.avatar_url.startsWith("http") ? <User className="w-12 h-12" /> : profile.avatar_url}</AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {uploading ? "Enviando..." : "Foto"}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEmojiPickerOpen(true)}
                >
                  <Smile className="w-4 h-4 mr-2" />
                  Emoji
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              Salvar
            </Button>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Alterar Senha</h3>
            </div>

            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input
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
              <Label>Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirme a nova senha"
              />
            </div>

            <Button onClick={handleChangePassword} className="w-full">
              Alterar Senha
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {tempImageUrl && (
        <AvatarImageEditor
          open={imageEditorOpen}
          onClose={() => {
            setImageEditorOpen(false);
            setTempImageUrl(null);
          }}
          imageUrl={tempImageUrl}
          onSave={handleSaveCroppedImage}
        />
      )}

      <EmojiPickerDialog
        open={emojiPickerOpen}
        onClose={() => setEmojiPickerOpen(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </Dialog>
  );
};
