import { useState, useEffect } from "react";
import { Image as ImageIcon, Smile, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AvatarImageEditor } from "./AvatarImageEditor";
import { EmojiPickerDialog } from "./EmojiPickerDialog";
import { CoverImage } from "./CoverImage";
import { ThemeToggle } from "./ThemeToggle";
import { ColorEditor } from "./ColorEditor";

interface AppearanceSettingsProps {
  userId?: string;
}

export const AppearanceSettings = ({ userId }: AppearanceSettingsProps) => {
  const [avatarUrl, setAvatarUrl] = useState("🐷");
  const [uploading, setUploading] = useState(false);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadAvatar();
    }
  }, [userId]);

  const loadAvatar = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao carregar avatar:", error);
      return;
    }

    if (data) {
      setAvatarUrl(data.avatar_url || "🐷");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setTempImageUrl(e.target?.result as string);
      setImageEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async (croppedBlob: Blob) => {
    if (!userId) return;

    setUploading(true);
    try {
      const fileExt = "jpg";
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Foto de perfil atualizada!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao atualizar foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectEmoji = async (emoji: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: emoji })
      .eq("id", userId);

    if (error) {
      toast.error("Erro ao atualizar emoji");
      return;
    }

    setAvatarUrl(emoji);
    toast.success("Emoji atualizado!");
  };

  const isEmoji = avatarUrl.length <= 4;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Capa do Perfil</CardTitle>
          <CardDescription>
            Personalize a capa do seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CoverImage userId={userId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>
            Altere sua foto de perfil ou escolha um emoji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {isEmoji ? (
                <AvatarFallback className="text-4xl bg-muted">
                  {avatarUrl}
                </AvatarFallback>
              ) : (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              )}
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                  disabled={uploading}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {uploading ? "Enviando..." : "Carregar Imagem"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEmojiPickerOpen(true)}
                >
                  <Smile className="h-4 w-4 mr-2" />
                  Escolher Emoji
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Recomendado: imagem quadrada de pelo menos 200x200px
              </p>
            </div>
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </CardContent>
      </Card>

      <ColorEditor />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Palette className="w-5 h-5" />
            Tema
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Escolha entre temas padrão, daltônicos ou personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <AvatarImageEditor
        open={imageEditorOpen}
        onClose={() => {
          setImageEditorOpen(false);
          setTempImageUrl(null);
        }}
        imageUrl={tempImageUrl || ""}
        onSave={handleSaveAvatar}
      />

      <EmojiPickerDialog
        open={emojiPickerOpen}
        onClose={() => setEmojiPickerOpen(false)}
        onEmojiSelect={handleSelectEmoji}
      />
    </div>
  );
};
