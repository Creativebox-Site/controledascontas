import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Trash2, AlertTriangle, FileSpreadsheet, FileJson } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface AccountDeletionProps {
  userId?: string;
}

export const AccountDeletion = ({ userId }: AccountDeletionProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleExportExcel = async () => {
    if (!userId) return;
    
    setIsExporting(true);
    try {
      // Fetch all user data
      const [transactionsRes, categoriesRes, goalsRes, profileRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('categories').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).single(),
      ]);

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add sheets
      if (transactionsRes.data) {
        const wsTransactions = XLSX.utils.json_to_sheet(transactionsRes.data);
        XLSX.utils.book_append_sheet(wb, wsTransactions, "Transações");
      }

      if (categoriesRes.data) {
        const wsCategories = XLSX.utils.json_to_sheet(categoriesRes.data);
        XLSX.utils.book_append_sheet(wb, wsCategories, "Categorias");
      }

      if (goalsRes.data) {
        const wsGoals = XLSX.utils.json_to_sheet(goalsRes.data);
        XLSX.utils.book_append_sheet(wb, wsGoals, "Metas");
      }

      if (profileRes.data) {
        const wsProfile = XLSX.utils.json_to_sheet([profileRes.data]);
        XLSX.utils.book_append_sheet(wb, wsProfile, "Perfil");
      }

      // Generate file
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `backup-financeiro-${date}.xlsx`);
      
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!userId) return;
    
    setIsExporting(true);
    try {
      // Fetch all user data
      const [transactionsRes, categoriesRes, goalsRes, profileRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('categories').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).single(),
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        user_id: userId,
        transactions: transactionsRes.data || [],
        categories: categoriesRes.data || [],
        goals: goalsRes.data || [],
        profile: profileRes.data || null,
      };

      // Download JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `backup-financeiro-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    
    setIsDeleting(true);
    try {
      // Refresh session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError || !session) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }

      // Call edge function to delete account
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        // Sign out
        await supabase.auth.signOut();
        
        // Show success dialog
        setShowSuccessDialog(true);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        throw new Error(data?.error || 'Erro ao deletar conta');
      }
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      toast.error(error.message || "Erro ao deletar conta. Tente novamente.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis relacionadas à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="font-semibold">Exportar seus dados</h3>
            <p className="text-sm text-muted-foreground">
              Antes de deletar sua conta, recomendamos que você exporte todos os seus dados.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
              <Button
                variant="outline"
                onClick={handleExportJSON}
                disabled={isExporting}
                className="flex-1"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Exportar JSON
              </Button>
            </div>
          </div>

          {/* Delete Section */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-destructive">Deletar conta permanentemente</h3>
            <p className="text-sm text-muted-foreground">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados serão perdidos permanentemente:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Todas as transações</li>
              <li>Todas as categorias</li>
              <li>Todas as metas</li>
              <li>Configurações de perfil</li>
              <li>Histórico completo</li>
            </ul>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar Minha Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Tem certeza absoluta?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      Esta ação <strong>NÃO PODE SER DESFEITA</strong>. Isso irá deletar permanentemente:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-left">
                      <li>Sua conta</li>
                      <li>Todos os seus dados financeiros</li>
                      <li>Todo o histórico de transações</li>
                      <li>Todas as categorias e metas</li>
                    </ul>
                    <p className="font-semibold">
                      Você exportou seus dados? Esta é sua última chance!
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deletando..." : "Sim, deletar permanentemente"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Conta Deletada</DialogTitle>
            <DialogDescription className="text-center pt-4 space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                  <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-base">
                Sua conta e todos os seus dados foram removidos com <strong>sucesso e segurança</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Você será redirecionado para a página de login em instantes...
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};