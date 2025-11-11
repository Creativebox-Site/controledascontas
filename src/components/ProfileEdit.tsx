import { useState, useEffect } from "react";
import { User, Image as ImageIcon, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AvatarImageEditor } from "./AvatarImageEditor";
import { EmojiPickerDialog } from "./EmojiPickerDialog";
import { CoverImage } from "./CoverImage";

interface ProfileEditProps {
  userId?: string;
}

export const ProfileEdit = ({ userId }: ProfileEditProps) => {
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "🐷",
    document: "",
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

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, document")
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
        document: data.document || "",
      });
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        document: profile.document,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Erro ao salvar perfil");
      return;
    }

    toast.success("Perfil atualizado com sucesso!");
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
    toast.success("Emoji selecionado!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="relative">
          <CoverImage userId={userId} />
        </div>
        
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>
            Altere sua foto de perfil ou escolha um emoji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url.startsWith("http") ? profile.avatar_url : undefined} />
              <AvatarFallback className="text-5xl">
                {profile.avatar_url.startsWith("http") ? <User className="w-16 h-16" /> : profile.avatar_url}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById("avatar-upload")?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {uploading ? "Enviando..." : "Escolher Foto"}
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
                onClick={() => setEmojiPickerOpen(true)}
              >
                <Smile className="w-4 h-4 mr-2" />
                Escolher Emoji
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">Documento (CPF/CNPJ)</Label>
            <Input
              id="document"
              value={profile.document}
              onChange={(e) => setProfile({ ...profile, document: e.target.value })}
              placeholder="000.000.000-00"
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

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
    </div>
  );
};
