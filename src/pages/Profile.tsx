import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { CoverImage } from "@/components/CoverImage";

interface ProfileProps {
  userId?: string;
}

export const Profile = ({ userId }: ProfileProps) => {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, birth_date, phone, zip_code, street, number, complement, neighborhood, city, state")
      .eq("id", userId)
      .single();

    setLoading(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Perfil</h2>
        <p className="text-muted-foreground mt-2">
          Visualize suas informações de perfil
        </p>
      </div>

      <Card className="max-w-2xl">
        <div className="relative">
          <CoverImage userId={userId} />
        </div>
        
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-background -mt-20 shadow-lg">
              <AvatarImage src={profile.avatar_url.startsWith("http") ? profile.avatar_url : undefined} />
              <AvatarFallback className="text-5xl bg-primary/10">
                {profile.avatar_url.startsWith("http") ? <User className="w-16 h-16" /> : profile.avatar_url}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-2 w-full">
              <h3 className="text-2xl font-bold">{profile.full_name || "Sem nome"}</h3>
              {profile.birth_date && (
                <p className="text-muted-foreground">
                  Data de Nascimento: {new Date(profile.birth_date).toLocaleDateString('pt-BR')}
                </p>
              )}
              {profile.phone && (
                <p className="text-muted-foreground">Celular: {profile.phone}</p>
              )}
              {profile.street && (
                <p className="text-muted-foreground">
                  Endereço: {profile.street}, {profile.number}
                  {profile.complement && ` - ${profile.complement}`}
                  {profile.neighborhood && ` - ${profile.neighborhood}`}
                  {profile.city && ` - ${profile.city}`}
                  {profile.state && `/${profile.state}`}
                  {profile.zip_code && ` - CEP: ${profile.zip_code}`}
                </p>
              )}
            </div>

            <div className="w-full pt-4 border-t">
              <p className="text-sm text-center text-muted-foreground">
                Para editar suas informações, acesse{" "}
                <span className="font-semibold text-primary">Configurações</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
