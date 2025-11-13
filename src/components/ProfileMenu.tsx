import { useState, useEffect } from "react";
import { Smile, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AvatarImageEditor } from "./AvatarImageEditor";
import { EmojiPickerDialog } from "./EmojiPickerDialog";

interface ProfileMenuProps {
  userId?: string;
}

export const ProfileMenu = ({ userId }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Avatar className="h-8 w-8 cursor-pointer">
              {isEmoji ? (
                <AvatarFallback className="text-lg bg-muted">
                  {avatarUrl}
                </AvatarFallback>
              ) : (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              )}
            </Avatar>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Foto de Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Avatar className="h-24 w-24">
                {isEmoji ? (
                  <AvatarFallback className="text-5xl bg-muted">
                    {avatarUrl}
                  </AvatarFallback>
                ) : (
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                )}
              </Avatar>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                disabled={uploading}
                className="w-full"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {uploading ? "Enviando..." : "Carregar Imagem"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEmojiPickerOpen(true);
                }}
                className="w-full"
              >
                <Smile className="h-4 w-4 mr-2" />
                Escolher Emoji
              </Button>
            </div>
            
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
};
