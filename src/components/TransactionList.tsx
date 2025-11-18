import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Upload, Filter, ArrowUpDown, X } from "lucide-react";
import { toast } from "sonner";
import { TransactionForm } from "./TransactionForm";
import { TransactionBulkImport } from "./TransactionBulkImport";
import { BulkEditDialog } from "./BulkEditDialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: "income" | "expense" | "investment";
  date: string;
  category_id: string;
  series_id?: string;
  categories?: {
    id: string;
    name: string;
    color: string;
    is_essential: boolean;
  };
}

interface TransactionListProps {
  userId?: string;
  currency: string;
  filterType?: "income" | "expense" | "investment";
  showEdit?: boolean;
  refreshKey?: number;
}

interface Category {
  id: string;
  name: string;
  is_essential: boolean;
}

export const TransactionList = ({ userId, currency, filterType, showEdit, refreshKey }: TransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at_desc");
  const [essentialFilter, setEssentialFilter] = useState<string>("all");

  useEffect(() => {
    if (userId) {
      loadCategories();
      loadTransactions();
      fetchExchangeRate();
    }
  }, [userId, filterType, refreshKey, searchText, typeFilter, categoryFilter, minAmount, maxAmount, sortBy, essentialFilter]);

  useEffect(() => {
    if (!userId) return;

    // Reload quando a aba fica visível novamente
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTransactions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      setExchangeRate(data.rates.BRL);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const loadCategories = async () => {
    let query = supabase
      .from("categories")
      .select("id, name, is_essential")
      .eq("user_id", userId);

    // Filtrar por tipo se filterType estiver definido
    if (filterType) {
      query = query.eq("type", filterType);
    }

    const { data, error } = await query;

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadTransactions = async () => {
    let query = supabase
      .from("transactions")
      .select("*, categories(id, name, color, is_essential)")
      .eq("user_id", userId);
    
    if (filterType) {
      query = query.eq("type", filterType);
    }

    // Filtro de tipo
    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    // Filtro de categoria
    if (categoryFilter !== "all") {
      query = query.eq("category_id", categoryFilter);
    }

    // Filtro de valor mínimo
    if (minAmount) {
      query = query.gte("amount", parseFloat(minAmount));
    }

    // Filtro de valor máximo
    if (maxAmount) {
      query = query.lte("amount", parseFloat(maxAmount));
    }

    // Ordenação
    const [sortField, sortDirection] = sortBy.split("_");
    const ascending = sortDirection === "asc";
    
    if (sortField === "created") {
      query = query.order("created_at", { ascending });
    } else if (sortField === "date") {
      query = query.order("date", { ascending });
    } else if (sortField === "amount") {
      query = query.order("amount", { ascending });
    } else if (sortField === "description") {
      query = query.order("description", { ascending });
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar transações");
      return;
    }

    let filteredData = (data as any) || [];

    // Filtro de pesquisa de texto
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter((t: Transaction) => 
        t.description.toLowerCase().includes(searchLower) ||
        t.categories?.name.toLowerCase().includes(searchLower) ||
        t.amount.toString().includes(searchLower) ||
        t.currency.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de essencial/não essencial
    if (essentialFilter !== "all") {
      const isEssential = essentialFilter === "essential";
      filteredData = filteredData.filter((t: Transaction) => 
        t.categories?.is_essential === isEssential
      );
    }

    setTransactions(filteredData);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta transação?")) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir transação");
    } else {
      toast.success("Transação excluída!");
      setSelectedIds(new Set());
      loadTransactions();
    }
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm("Deseja realmente excluir toda a série de transações repetidas?")) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("series_id", seriesId);

    if (error) {
      toast.error("Erro ao excluir série");
    } else {
      toast.success("Série excluída!");
      setSelectedIds(new Set());
      loadTransactions();
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      toast.error("Selecione pelo menos uma transação");
      return;
    }

    if (!confirm(`Deseja realmente excluir ${selectedIds.size} transação(ões)?`)) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .in("id", Array.from(selectedIds));

    if (error) {
      toast.error("Erro ao excluir transações");
    } else {
      toast.success(`${selectedIds.size} transação(ões) excluída(s)!`);
      setSelectedIds(new Set());
      loadTransactions();
    }
  };

  const handleBulkEdit = async (updates: Partial<Transaction>) => {
    if (selectedIds.size === 0) {
      toast.error("Selecione pelo menos uma transação");
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .update(updates)
      .in("id", Array.from(selectedIds));

    if (error) {
      toast.error("Erro ao atualizar transações");
    } else {
      toast.success(`${selectedIds.size} transação(ões) atualizada(s)!`);
      setSelectedIds(new Set());
      setShowBulkEditDialog(false);
      loadTransactions();
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const clearFilters = () => {
    setSearchText("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setMinAmount("");
    setMaxAmount("");
    setEssentialFilter("all");
  };

  const convertAmount = (amount: number, transactionCurrency: string) => {
    if (currency === transactionCurrency) return amount;
    
    if (currency === "BRL" && transactionCurrency === "USD") {
      return amount * exchangeRate;
    }
    
    if (currency === "USD" && transactionCurrency === "BRL") {
      return amount / exchangeRate;
    }
    
    return amount;
  };

  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: curr
    }).format(amount);
  };

  return (
    <>
      {showBulkImport && (
        <TransactionBulkImport
          userId={userId}
          currency={currency}
          onClose={() => setShowBulkImport(false)}
          onImportComplete={() => {
            setShowBulkImport(false);
            loadTransactions();
          }}
        />
      )}

      {showEdit ? (
        <>
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Transação</DialogTitle>
              </DialogHeader>
              {editingTransaction && (
                <TransactionForm
                  userId={userId}
                  transaction={editingTransaction}
                  onClose={() => {
                    setShowEditDialog(false);
                    setEditingTransaction(null);
                    loadTransactions();
                  }}
                  currency={currency}
                />
              )}
            </DialogContent>
          </Dialog>

          <BulkEditDialog
            open={showBulkEditDialog}
            onOpenChange={setShowBulkEditDialog}
            selectedCount={selectedIds.size}
            categories={categories}
            onSave={handleBulkEdit}
            type="transaction"
          />
        </>
      ) : (
        editingTransaction && (
          <TransactionForm
            userId={userId}
            transaction={editingTransaction}
            onClose={() => {
              setEditingTransaction(null);
              loadTransactions();
            }}
            currency={currency}
          />
        )
      )}

      <Card>
         <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <CardTitle className="text-base sm:text-lg">Histórico de Transações</CardTitle>
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkEditDialog(true)}
                  className="text-xs sm:text-sm"
                >
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Editar ({selectedIds.size})
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteSelected} 
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Excluir ({selectedIds.size})
                </Button>
              </div>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Filtros
                  {(searchText || typeFilter !== "all" || categoryFilter !== "all" || minAmount || maxAmount || essentialFilter !== "all") && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {[searchText, typeFilter !== "all", categoryFilter !== "all", minAmount, maxAmount, essentialFilter !== "all"].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filtros</h4>
                    {(searchText || typeFilter !== "all" || categoryFilter !== "all" || minAmount || maxAmount || essentialFilter !== "all") && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Pesquisar</Label>
                    <Input
                      placeholder="Buscar em descrição, categoria..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="investment">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Despesa</Label>
                    <Select value={essentialFilter} onValueChange={setEssentialFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="essential">Essencial</SelectItem>
                        <SelectItem value="non-essential">Não Essencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Valor mínimo</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor máximo</Label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Ordenar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-4">
                  <h4 className="font-semibold">Ordenar por</h4>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at_desc">Inserção (Mais recente)</SelectItem>
                      <SelectItem value="created_at_asc">Inserção (Mais antiga)</SelectItem>
                      <SelectItem value="date_desc">Data (Mais recente)</SelectItem>
                      <SelectItem value="date_asc">Data (Mais antiga)</SelectItem>
                      <SelectItem value="amount_desc">Valor (Maior)</SelectItem>
                      <SelectItem value="amount_asc">Valor (Menor)</SelectItem>
                      <SelectItem value="description_asc">Descrição (A-Z)</SelectItem>
                      <SelectItem value="description_desc">Descrição (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={() => setShowBulkImport(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importar em Lote
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Checkbox
                checked={selectedIds.size === transactions.length && transactions.length > 0}
                onCheckedChange={handleSelectAll}
                id="select-all"
              />
              <Label htmlFor="select-all" className="cursor-pointer text-xs sm:text-sm">
                Selecionar tudo ({transactions.length})
              </Label>
            </div>
          )}
          <div className="space-y-2 sm:space-y-3">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-xs sm:text-sm">
              Nenhuma transação encontrada.
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => {
            const convertedAmount = convertAmount(transaction.amount, transaction.currency);
            const isSelected = selectedIds.has(transaction.id);
            return (
              <Card key={transaction.id} className={isSelected ? "border-primary" : ""}>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto sm:flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(transaction.id)}
                      className="flex-shrink-0"
                    />
                    <div 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: transaction.categories?.color || '#888' }}
                    >
                      <span className="text-white text-xs font-bold">
                        {transaction.categories?.name?.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate text-sm sm:text-base">{transaction.description}</h4>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <span className="truncate">{transaction.categories?.name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">{transaction.date.split('T')[0].split('-').reverse().join('/')}</span>
                        {transaction.currency !== currency && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </Badge>
                          </>
                        )}
                        {transaction.series_id && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="secondary" className="text-xs">
                              Série
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
                    <span className={`text-base sm:text-lg font-bold ${
                      transaction.type === "income" ? "text-success" : "text-destructive"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(convertedAmount, currency)}
                    </span>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      {transaction.series_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSeries(transaction.series_id!)}
                          title="Deletar série completa"
                          className="h-8 w-8"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                        </Button>
                      )}
                      {showEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setShowEditDialog(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                      {!showEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTransaction(transaction)}
                          className="h-8 w-8"
                        >
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};