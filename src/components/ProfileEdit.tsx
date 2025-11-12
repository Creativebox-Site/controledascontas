import { useState, useEffect } from "react";
import { User, Image as ImageIcon, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sb } from "@/lib/sb";
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
    birth_date: "",
    phone: "",
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [loadingCep, setLoadingCep] = useState(false);
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
      .select("full_name, avatar_url, birth_date, phone, zip_code, street, number, complement, neighborhood, city, state")
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
        birth_date: data.birth_date || "",
        phone: data.phone || "",
        zip_code: data.zip_code || "",
        street: data.street || "",
        number: data.number || "",
        complement: data.complement || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
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
        birth_date: profile.birth_date,
        phone: profile.phone,
        zip_code: profile.zip_code,
        street: profile.street,
        number: profile.number,
        complement: profile.complement,
        neighborhood: profile.neighborhood,
        city: profile.city,
        state: profile.state,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Erro ao salvar perfil");
      return;
    }

    toast.success("Perfil atualizado com sucesso!");
  };

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    
    // Aplica máscara ao CEP
    let maskedCep = cleanCep;
    if (cleanCep.length > 5) {
      maskedCep = cleanCep.slice(0, 5) + "-" + cleanCep.slice(5, 8);
    }
    
    setProfile({ ...profile, zip_code: maskedCep });

    // Busca endereço se CEP estiver completo
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        
        // ===== VALIDAÇÃO DE RESPOSTA DA API =====
        if (!response.ok) {
          throw new Error("Erro ao consultar CEP");
        }
        
        const data = await response.json();
        
        // Validar estrutura da resposta
        if (typeof data !== 'object' || data === null) {
          throw new Error("Resposta inválida da API");
        }
        
        if (data.erro) {
          toast.error("CEP não encontrado");
        } else {
          // Validar e sanitizar cada campo antes de usar
          const sanitizeString = (str: any): string => {
            if (typeof str !== 'string') return '';
            return str.trim().substring(0, 255); // Limitar tamanho
          };
          
          setProfile(prev => ({
            ...prev,
            street: sanitizeString(data.logradouro),
            neighborhood: sanitizeString(data.bairro),
            city: sanitizeString(data.localidade),
            state: sanitizeString(data.uf).substring(0, 2).toUpperCase(),
          }));
          toast.success("Endereço encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast.error("Erro ao buscar CEP");
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleanPhone = value.replace(/\D/g, "");
    
    // Aplica máscara (55) 9 9999-9999
    let maskedPhone = cleanPhone;
    if (cleanPhone.length > 0) {
      maskedPhone = "(" + cleanPhone.slice(0, 2);
      if (cleanPhone.length > 2) {
        maskedPhone += ") " + cleanPhone.slice(2, 3);
      }
      if (cleanPhone.length > 3) {
        maskedPhone += " " + cleanPhone.slice(3, 7);
      }
      if (cleanPhone.length > 7) {
        maskedPhone += "-" + cleanPhone.slice(7, 11);
      }
    }
    
    setProfile({ ...profile, phone: maskedPhone });
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
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={profile.birth_date}
              onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Celular</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(55) 9 9999-9999"
              maxLength={16}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP</Label>
            <Input
              id="zip_code"
              value={profile.zip_code}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              disabled={loadingCep}
            />
            {loadingCep && <p className="text-sm text-muted-foreground">Buscando endereço...</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Endereço</Label>
            <Input
              id="street"
              value={profile.street}
              onChange={(e) => setProfile({ ...profile, street: e.target.value })}
              placeholder="Rua, Avenida..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={profile.number}
                onChange={(e) => setProfile({ ...profile, number: e.target.value })}
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={profile.complement}
                onChange={(e) => setProfile({ ...profile, complement: e.target.value })}
                placeholder="Apto, Bloco..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={profile.neighborhood}
              onChange={(e) => setProfile({ ...profile, neighborhood: e.target.value })}
              placeholder="Bairro"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                placeholder="UF"
                maxLength={2}
              />
            </div>
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
