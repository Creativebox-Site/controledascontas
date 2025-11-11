import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface BulkImportProps {
  type: "transactions" | "categories" | "investments";
  onImport: (data: any[]) => Promise<void>;
  onClose: () => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const BulkImport = ({ type, onImport, onClose }: BulkImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const templates = {
    transactions: {
      filename: "template_transacoes.xls",
      columns: ["descricao", "valor", "tipo", "categoria", "data", "moeda"],
      sheetName: "Transações"
    },
    categories: {
      filename: "template_categorias.xls",
      columns: ["nome", "tipo", "essencial", "cor"],
      sheetName: "Categorias"
    },
    investments: {
      filename: "template_investimentos.xls",
      columns: ["categoria", "valor", "data", "moeda"],
      sheetName: "Investimentos"
    }
  };

  const downloadTemplate = () => {
    const template = templates[type];
    const ws = XLSX.utils.aoa_to_sheet([template.columns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, template.sheetName);
    XLSX.writeFile(wb, template.filename);
    toast.success("Template baixado com sucesso!");
  };

  const validateFile = (fileData: any[], fileName: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const template = templates[type];

    // Validar nome do arquivo
    if (!fileName.includes(template.filename.replace(".xls", ""))) {
      errors.push(`O nome do arquivo deve conter "${template.filename.replace(".xls", "")}"`);
    }

    // Validar extensão
    if (!fileName.endsWith(".xls") && !fileName.endsWith(".xlsx")) {
      errors.push("O arquivo deve ter extensão .xls ou .xlsx");
    }

    // Validar se há dados
    if (!fileData || fileData.length === 0) {
      errors.push("O arquivo está vazio");
      return { isValid: false, errors, warnings };
    }

    // Validar colunas
    const fileColumns = Object.keys(fileData[0] || {});
    const missingColumns = template.columns.filter(col => !fileColumns.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Colunas faltando: ${missingColumns.join(", ")}`);
    }

    // Validar dados numéricos
    fileData.forEach((row, index) => {
      if (row.valor) {
        const valorStr = String(row.valor);
        
        // Verificar se usa ponto ao invés de vírgula
        if (valorStr.includes(".")) {
          warnings.push(`Linha ${index + 2}: O valor contém ponto (.). Use vírgula (,) como separador decimal`);
        }

        // Verificar se é um número válido
        const valorNumber = parseFloat(valorStr.replace(",", "."));
        if (isNaN(valorNumber)) {
          errors.push(`Linha ${index + 2}: Valor inválido "${row.valor}"`);
        }
      }
    });

    // Validações específicas por tipo
    if (type === "transactions") {
      fileData.forEach((row, index) => {
        if (row.tipo && !["receita", "despesa"].includes(row.tipo.toLowerCase())) {
          errors.push(`Linha ${index + 2}: Tipo deve ser "receita" ou "despesa"`);
        }
      });
    }

    if (type === "categories") {
      fileData.forEach((row, index) => {
        if (row.tipo && !["receita", "despesa"].includes(row.tipo.toLowerCase())) {
          errors.push(`Linha ${index + 2}: Tipo deve ser "receita" ou "despesa"`);
        }
        if (row.essencial && !["sim", "não", "nao", "true", "false"].includes(String(row.essencial).toLowerCase())) {
          errors.push(`Linha ${index + 2}: Essencial deve ser "sim" ou "não"`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setParsedData(jsonData);
        const validationResult = validateFile(jsonData, selectedFile.name);
        setValidation(validationResult);

        if (validationResult.warnings.length > 0) {
          toast.warning("Arquivo tem avisos. Verifique antes de importar.");
        }
      } catch (error) {
        toast.error("Erro ao ler arquivo");
        setValidation({
          isValid: false,
          errors: ["Erro ao processar arquivo. Verifique o formato."],
          warnings: []
        });
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    if (!validation?.isValid) {
      toast.error("Corrija os erros antes de importar");
      return;
    }

    if (validation.warnings.length > 0) {
      const confirm = window.confirm(
        "O arquivo contém avisos. Deseja continuar mesmo assim?\n\n" + 
        validation.warnings.join("\n")
      );
      if (!confirm) return;
    }

    try {
      // Normalizar dados antes de importar
      const normalizedData = parsedData.map(row => {
        const normalized: any = { ...row };
        
        // Converter valores com vírgula para ponto
        if (normalized.valor) {
          normalized.valor = parseFloat(String(normalized.valor).replace(",", "."));
        }
        
        // Normalizar campos booleanos
        if (normalized.essencial) {
          const val = String(normalized.essencial).toLowerCase();
          normalized.essencial = ["sim", "true", "1"].includes(val);
        }

        return normalized;
      });

      await onImport(normalizedData);
      toast.success(`${parsedData.length} registros importados com sucesso!`);
      onClose();
    } catch (error) {
      toast.error("Erro ao importar dados");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Dados em Lote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription>
            Primeiro, faça o download do template para preencher os dados corretamente.
          </AlertDescription>
        </Alert>

        <Button onClick={downloadTemplate} variant="outline" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Baixar Template
        </Button>

        <div className="space-y-2">
          <Label>Selecionar Arquivo</Label>
          <Input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
          />
        </div>

        {validation && (
          <div className="space-y-2">
            {validation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Erros encontrados:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.errors.map((error, idx) => (
                      <li key={idx} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Avisos:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.isValid && validation.errors.length === 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Arquivo validado com sucesso! {parsedData.length} registros encontrados.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            disabled={!validation?.isValid}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Dados
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
