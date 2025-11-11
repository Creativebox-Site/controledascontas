import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ReportSection {
  id: string;
  label: string;
  selected: boolean;
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
}

export const generateReportPDF = async (data: ReportData): Promise<Blob> => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Configurar fonte
  pdf.setFont("helvetica");

  // Capa
  pdf.setFontSize(24);
  pdf.setTextColor(59, 130, 246); // primary color
  pdf.text("Relatório Financeiro", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;
  pdf.setFontSize(14);
  pdf.setTextColor(100, 100, 100);
  pdf.text(data.userName, pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 8;
  pdf.setFontSize(10);
  pdf.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), pageWidth / 2, yPosition, { align: "center" });

  // Resumo Financeiro
  yPosition += 20;
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Resumo Financeiro", 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(12);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: data.currency,
    }).format(value);
  };

  const summaryItems = [
    { label: "Total de Receitas:", value: formatCurrency(data.totalIncome), color: [16, 185, 129] },
    { label: "Total de Despesas:", value: formatCurrency(data.totalExpense), color: [239, 68, 68] },
    { label: "Total em Investimentos:", value: formatCurrency(data.totalInvestments), color: [59, 130, 246] },
    { label: "Saldo:", value: formatCurrency(data.balance), color: data.balance >= 0 ? [16, 185, 129] : [239, 68, 68] },
  ];

  summaryItems.forEach((item) => {
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.label, 25, yPosition);
    pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
    pdf.text(item.value, pageWidth - 25, yPosition, { align: "right" });
    yPosition += 8;
  });

  // Sumário
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Seções Incluídas", 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(11);
  const selectedSections = data.sections.filter(s => s.selected);
  
  selectedSections.forEach((section, index) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(`${index + 1}. ${section.label}`, 25, yPosition);
    yPosition += 7;
  });

  // Rodapé
  const addFooter = (pageNum: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      20,
      pageHeight - 10
    );
    pdf.text(`Página ${pageNum}`, pageWidth - 20, pageHeight - 10, { align: "right" });
  };

  // Adicionar rodapé na primeira página
  addFooter(1);

  // Se houver mais páginas, adicionar rodapés
  const totalPages = pdf.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(i);
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

export const shareViaWhatsApp = (phoneNumber: string, message: string) => {
  const formattedPhone = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(url, "_blank");
};
