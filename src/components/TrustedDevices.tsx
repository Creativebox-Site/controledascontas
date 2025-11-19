import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Trash2, 
  MapPin, 
  Clock, 
  Shield,
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TrustedDevice {
  id: string;
  device_fingerprint: string;
  device_name: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  last_used_at: string | null;
}

export function TrustedDevices() {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false });

      if (error) throw error;

      setDevices(data || []);
    } catch (error: any) {
      console.error("Error loading devices:", error);
      toast.error("Erro ao carregar dispositivos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;

    try {
      const { error } = await supabase
        .from('trusted_devices')
        .delete()
        .eq('id', deviceToDelete);

      if (error) throw error;

      toast.success("Dispositivo removido com sucesso");
      setDevices(devices.filter(d => d.id !== deviceToDelete));
      setDeviceToDelete(null);
    } catch (error: any) {
      console.error("Error deleting device:", error);
      toast.error("Erro ao remover dispositivo");
    }
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Monitor;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return Smartphone;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return Tablet;
    }
    return Monitor;
  };

  const getDeviceType = (userAgent: string | null) => {
    if (!userAgent) return "Dispositivo desconhecido";
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone')) return "iPhone";
    if (ua.includes('ipad')) return "iPad";
    if (ua.includes('android')) {
      if (ua.includes('mobile')) return "Android (Mobile)";
      return "Android (Tablet)";
    }
    if (ua.includes('windows')) return "Windows";
    if (ua.includes('mac')) return "Mac";
    if (ua.includes('linux')) return "Linux";
    
    return "Dispositivo desconhecido";
  };

  const getBrowserName = (userAgent: string | null) => {
    if (!userAgent) return "";
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('edg')) return "Edge";
    if (ua.includes('chrome')) return "Chrome";
    if (ua.includes('firefox')) return "Firefox";
    if (ua.includes('safari')) return "Safari";
    if (ua.includes('opera')) return "Opera";
    
    return "";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dispositivos Confiáveis
          </CardTitle>
          <CardDescription>
            Carregando dispositivos...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dispositivos Confiáveis
          </CardTitle>
          <CardDescription>
            Gerencie os dispositivos que acessaram sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum dispositivo registrado. Faça login com OTP para registrar este dispositivo.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.user_agent);
                const deviceType = getDeviceType(device.user_agent);
                const browser = getBrowserName(device.user_agent);
                const isCurrentDevice = device.last_used_at && 
                  new Date(device.last_used_at).getTime() > Date.now() - 60000; // Último minuto

                return (
                  <div
                    key={device.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex gap-3 flex-1">
                      <div className="mt-1">
                        <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {device.device_name || deviceType}
                          </p>
                          {isCurrentDevice && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              Ativo agora
                            </span>
                          )}
                        </div>
                        
                        {browser && (
                          <p className="text-sm text-muted-foreground">
                            {browser}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                          {device.ip_address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {device.ip_address}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Criado em {format(new Date(device.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          
                          {device.last_used_at && (
                            <span className="flex items-center gap-1">
                              Último acesso: {format(new Date(device.last_used_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeviceToDelete(device.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {devices.length > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Se você não reconhece algum dispositivo, remova-o imediatamente e altere sua senha.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deviceToDelete} onOpenChange={() => setDeviceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover dispositivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Este dispositivo será removido da lista de dispositivos confiáveis. 
              O usuário precisará fazer login novamente neste dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDevice} className="bg-destructive hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
