import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ReportSection {
  id: string;
  label: string;
  selected: boolean;
}

export interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category?: string;
}

export interface GoalData {
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  icon: string;
  progress: number;
}

export interface CategoryData {
  name: string;
  total: number;
  percentage: number;
  color: string;
}

export interface ReportData {
  userName: string;
  userEmail: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  totalInvestments: number;
  currency: string;
  sections: ReportSection[];
  transactions?: TransactionData[];
  goals?: GoalData[];
  categoryExpenses?: CategoryData[];
  monthlyData?: Array<{ month: string; income: number; expense: number; investment: number }>;
  insights?: string[];
}

const addPageHeader = (pdf: jsPDF, pageNum: number, totalPages: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Linha de topo
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.5);
  pdf.line(10, 10, pageWidth - 10, 10);
  
  // Rodapé
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    10,
    pageHeight - 10
  );
  pdf.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 10, pageHeight - 10, { align: "right" });
};

const addSectionTitle = (pdf: jsPDF, title: string, yPos: number): number => {
  pdf.setFontSize(16);
  pdf.setTextColor(59, 130, 246);
  pdf.text(title, 20, yPos);
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(20, yPos + 2, pageWidth - 20, yPos + 2);
  
  return yPos + 10;
};

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value);
};

export const generateReportPDF = async (data: ReportData): Promise<Blob> => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;
  let pageNumber = 1;

  pdf.setFont("helvetica");

  // ==================== CAPA ====================
  pdf.setFontSize(28);
  pdf.setTextColor(59, 130, 246);
  pdf.text("Relatório Financeiro", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 8;
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Análise Completa", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.userName, pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 6;
  pdf.setFontSize(10);
  pdf.setTextColor(120, 120, 120);
  pdf.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), pageWidth / 2, yPosition, { align: "center" });

  // Resumo Financeiro
  yPosition += 20;
  pdf.setFontSize(18);
  pdf.setTextColor(59, 130, 246);
  pdf.text("Resumo Financeiro", 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(12);
  
  const summaryItems = [
    { label: "Total de Receitas:", value: formatCurrency(data.totalIncome, data.currency), color: [16, 185, 129] },
    { label: "Total de Despesas:", value: formatCurrency(data.totalExpense, data.currency), color: [239, 68, 68] },
    { label: "Total em Investimentos:", value: formatCurrency(data.totalInvestments, data.currency), color: [59, 130, 246] },
    { label: "Saldo:", value: formatCurrency(data.balance, data.currency), color: data.balance >= 0 ? [16, 185, 129] : [239, 68, 68] },
  ];

  summaryItems.forEach((item) => {
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.label, 25, yPosition);
    pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
    pdf.setFontSize(14);
    pdf.text(item.value, pageWidth - 25, yPosition, { align: "right" });
    pdf.setFontSize(12);
    yPosition += 8;
  });

  // Índice
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setTextColor(59, 130, 246);
  pdf.text("Índice", 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  const selectedSections = data.sections.filter(s => s.selected);
  
  selectedSections.forEach((section, index) => {
    pdf.text(`${index + 1}. ${section.label}`, 25, yPosition);
    yPosition += 7;
  });

  addPageHeader(pdf, pageNumber, 1); // Será atualizado depois

  // ==================== NOVA PÁGINA - DESPESAS POR CATEGORIA ====================
  if (data.categoryExpenses && data.categoryExpenses.length > 0) {
    pdf.addPage();
    pageNumber++;
    yPosition = 20;
    
    yPosition = addSectionTitle(pdf, "Despesas por Categoria", yPosition);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Cabeçalho da tabela
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, pageWidth - 40, 8, "F");
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Categoria", 25, yPosition + 5);
    pdf.text("Valor", pageWidth - 70, yPosition + 5);
    pdf.text("%", pageWidth - 30, yPosition + 5);
    
    yPosition += 10;
    pdf.setFont("helvetica", "normal");
    
    data.categoryExpenses.slice(0, 15).forEach((cat) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        pageNumber++;
        yPosition = 20;
      }
      
      // Cor da categoria
      const color = cat.color.match(/\d+/g);
      if (color && color.length === 3) {
        pdf.setFillColor(parseInt(color[0]), parseInt(color[1]), parseInt(color[2]));
        pdf.circle(22, yPosition - 1, 1.5, "F");
      }
      
      pdf.text(cat.name, 27, yPosition);
      pdf.text(formatCurrency(cat.total, data.currency), pageWidth - 70, yPosition);
      pdf.text(`${cat.percentage.toFixed(1)}%`, pageWidth - 30, yPosition);
      yPosition += 7;
    });
  }

  // ==================== TRANSAÇÕES RECENTES ====================
  if (data.transactions && data.transactions.length > 0) {
    pdf.addPage();
    pageNumber++;
    yPosition = 20;
    
    yPosition = addSectionTitle(pdf, "Transações Recentes", yPosition);
    
    // Cabeçalho da tabela
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, pageWidth - 40, 8, "F");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("Data", 25, yPosition + 5);
    pdf.text("Descrição", 50, yPosition + 5);
    pdf.text("Categoria", 110, yPosition + 5);
    pdf.text("Valor", pageWidth - 30, yPosition + 5, { align: "right" });
    
    yPosition += 10;
    pdf.setFont("helvetica", "normal");
    
    // Ordenar por data (mais recente primeiro)
    const sortedTransactions = [...data.transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sortedTransactions.slice(0, 30).forEach((transaction) => {
      if (yPosition > pageHeight - 25) {
        pdf.addPage();
        pageNumber++;
        yPosition = 20;
      }
      
      const color = transaction.type === "income" 
        ? [16, 185, 129] 
        : transaction.type === "expense" 
        ? [239, 68, 68]
        : [59, 130, 246];
      
      pdf.setTextColor(80, 80, 80);
      pdf.text(format(new Date(transaction.date), "dd/MM/yy", { locale: ptBR }), 25, yPosition);
      pdf.text(transaction.description.substring(0, 25), 50, yPosition);
      pdf.text((transaction.category || "-").substring(0, 20), 110, yPosition);
      
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(formatCurrency(transaction.amount, data.currency), pageWidth - 30, yPosition, { align: "right" });
      
      yPosition += 6;
    });
  }

  // ==================== METAS E PROGRESSO ====================
  if (data.goals && data.goals.length > 0) {
    pdf.addPage();
    pageNumber++;
    yPosition = 20;
    
    yPosition = addSectionTitle(pdf, "Metas e Progresso", yPosition);
    
    pdf.setFontSize(10);
    
    data.goals.forEach((goal) => {
      if (yPosition > pageHeight - 35) {
        pdf.addPage();
        pageNumber++;
        yPosition = 20;
      }
      
      // Nome e ícone
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${goal.icon} ${goal.name}`, 25, yPosition);
      
      yPosition += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      
      // Valores
      pdf.text(
        `${formatCurrency(goal.current_amount, data.currency)} de ${formatCurrency(goal.target_amount, data.currency)}`,
        25,
        yPosition
      );
      
      yPosition += 5;
      
      // Barra de progresso
      const barWidth = pageWidth - 50;
      const progressWidth = (barWidth * goal.progress) / 100;
      
      // Fundo da barra
      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(25, yPosition, barWidth, 5, 2, 2, "F");
      
      // Progresso
      if (progressWidth > 0) {
        pdf.setFillColor(59, 130, 246);
        pdf.roundedRect(25, yPosition, progressWidth, 5, 2, 2, "F");
      }
      
      // Percentual
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(9);
      pdf.text(`${goal.progress.toFixed(1)}%`, pageWidth - 25, yPosition + 4, { align: "right" });
      
      yPosition += 10;
      
      // Data alvo
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(
        `Meta: ${format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}`,
        25,
        yPosition
      );
      
      yPosition += 12;
    });
  }

  // ==================== EVOLUÇÃO MENSAL ====================
  if (data.monthlyData && data.monthlyData.length > 0) {
    pdf.addPage();
    pageNumber++;
    yPosition = 20;
    
    yPosition = addSectionTitle(pdf, "Evolução Mensal", yPosition);
    
    pdf.setFontSize(9);
    
    // Cabeçalho
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, pageWidth - 40, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.text("Mês", 25, yPosition + 5);
    pdf.text("Receitas", 60, yPosition + 5);
    pdf.text("Despesas", 100, yPosition + 5);
    pdf.text("Investimentos", 140, yPosition + 5);
    
    yPosition += 10;
    pdf.setFont("helvetica", "normal");
    
    data.monthlyData.forEach((month) => {
      if (yPosition > pageHeight - 25) {
        pdf.addPage();
        pageNumber++;
        yPosition = 20;
      }
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(month.month, 25, yPosition);
      
      pdf.setTextColor(16, 185, 129);
      pdf.text(formatCurrency(month.income, data.currency), 60, yPosition);
      
      pdf.setTextColor(239, 68, 68);
      pdf.text(formatCurrency(month.expense, data.currency), 100, yPosition);
      
      pdf.setTextColor(59, 130, 246);
      pdf.text(formatCurrency(month.investment, data.currency), 140, yPosition);
      
      yPosition += 7;
    });
  }

  // ==================== INSIGHTS ====================
  if (data.insights && data.insights.length > 0) {
    pdf.addPage();
    pageNumber++;
    yPosition = 20;
    
    yPosition = addSectionTitle(pdf, "Insights Financeiros", yPosition);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    data.insights.forEach((insight, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        pageNumber++;
        yPosition = 20;
      }
      
      // Número do insight
      pdf.setFillColor(59, 130, 246);
      pdf.circle(23, yPosition - 2, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text((index + 1).toString(), 23, yPosition, { align: "center" });
      
      // Texto do insight
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(insight, pageWidth - 60);
      pdf.text(lines, 30, yPosition);
      
      yPosition += lines.length * 6 + 8;
    });
  }

  // Atualizar números de página
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addPageHeader(pdf, i, totalPages);
  }

  return pdf.output("blob");
};

export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printPDF = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 1000);
  };
};

export const shareViaWhatsApp = async (phoneNumber: string, message: string, pdfBlob?: Blob, fileName?: string): Promise<string | null> => {
  const formattedPhone = phoneNumber.replace(/\D/g, "");
  let encodedMessage = encodeURIComponent(message);
  
  if (pdfBlob && fileName) {
    // Se tiver PDF, adiciona informação sobre o arquivo
    encodedMessage = encodeURIComponent(
      `${message}\n\n📎 Arquivo: ${fileName}\n🔗 Link para download: (será adicionado automaticamente)`
    );
  }
  
  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(url, "_blank");
  
  return url;
};
