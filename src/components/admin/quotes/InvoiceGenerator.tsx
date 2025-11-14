'use client';
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { FileDown, LoaderCircle } from "lucide-react";
import type { QuoteFormValues } from "@/app/admin/quotes/[id]/page";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type LineItem = {
  productName: string;
  qty: number;
  unitPrice: number;
  options?: { label: string, value: string }[];
};

type Summary = {
    subtotal: number;
    discount: number;
    delivery: number;
    vat: number;
    total: number;
    depositAmount: number;
    remainingBalance: number;
}

const formatCurrency = (value: number, currency = "₦") =>
  currency + value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


export default function InvoiceGenerator({
  quote,
  summary,
  fileName = "bomedia-invoice.pdf",
}: {
  quote: QuoteFormValues;
  summary: Summary;
  fileName?: string;
}) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePdf = React.useCallback(() => {
    setIsGenerating(true);
    try {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const margin = { top: 40, left: 40, right: 40 };
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Header ---
        const headerY = margin.top;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.text("BOMedia", margin.left, headerY);

        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.text("Lagos, Nigeria", margin.left, headerY + 14);
        doc.text("info@bomedia.com · +234 802 224 7567", margin.left, headerY + 26);
        
        // --- Invoice Meta (Right) ---
        const rightColX = pageWidth - margin.right;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`QUOTE #${quote.id?.substring(0, 8).toUpperCase() || 'NEW'}`, rightColX, headerY, { align: "right" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Date: ${format(new Date(), 'PP')}`, rightColX, headerY + 14, { align: "right" });
        if (quote.dueDate) {
          doc.text(`Valid Until: ${format(quote.dueDate, 'PP')}`, rightColX, headerY + 26, { align: "right" });
        }
        
        // --- Billed To ---
        const billedY = headerY + 70;
        doc.setFontSize(11);
        doc.setFont("Helvetica", "bold");
        doc.text("BILLED TO:", margin.left, billedY);
        doc.setFont("Helvetica", "normal");
        const billedLines = [
            quote.company || quote.email,
            quote.company ? quote.email : null,
            quote.phone,
        ].filter(Boolean);
        billedLines.forEach((ln, i) => {
            doc.text(String(ln), margin.left, billedY + 14 + (i * 12));
        });

        // --- Line Items Table ---
        const tableBody = quote.lineItems.map((item: LineItem) => {
            const optionsString = item.options?.map(o => `${o.label}: ${o.value}`).join('\n') || '';
            return [
                { content: `${item.productName}\n${optionsString}`, styles: { fontSize: 9 } },
                item.qty.toString(),
                { content: formatCurrency(item.unitPrice), styles: { halign: 'right' } },
                { content: formatCurrency(item.qty * item.unitPrice), styles: { halign: 'right' } },
            ];
        });

        autoTable(doc as any, {
            startY: billedY + (billedLines.length * 12) + 20,
            head: [["Description", "Qty", "Unit Price", "Total"]],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { font: "Helvetica", fontSize: 10, cellPadding: 8, lineColor: [230, 230, 230] },
            columnStyles: {
                0: { cellWidth: 250 },
                1: { halign: "right" },
                2: { halign: "right" },
                3: { halign: "right" },
            },
        });
        
        // --- Totals Section ---
        let finalY = (doc as any).lastAutoTable.finalY + 20;
        const totalsX = pageWidth - margin.right - 200;

        const addTotalLine = (label: string, value: string, fontStyle: 'bold' | 'normal' = 'normal', fontSize: number = 10) => {
            doc.setFont("Helvetica", fontStyle);
            doc.setFontSize(fontSize);
            doc.text(label, totalsX, finalY, { align: 'left' });
            doc.text(value, pageWidth - margin.right, finalY, { align: 'right' });
            finalY += (fontSize * 1.5);
        };
        
        addTotalLine("Subtotal:", formatCurrency(summary.subtotal));
        if(summary.discount > 0) addTotalLine("Discount:", `- ${formatCurrency(summary.discount)}`);
        if(summary.delivery > 0) addTotalLine("Delivery:", formatCurrency(summary.delivery));
        if(summary.vat > 0) addTotalLine(`VAT (${quote.vatRate || 0}%):`, formatCurrency(summary.vat));
        
        finalY += 5; // Add a small gap before the total
        doc.setDrawColor(180);
        doc.line(totalsX, finalY - 8, pageWidth - margin.right, finalY - 8);

        addTotalLine("TOTAL:", formatCurrency(summary.total), 'bold', 12);
        
        if (summary.depositAmount > 0) {
            finalY += 5;
            addTotalLine("Deposit Due:", formatCurrency(summary.depositAmount));
            addTotalLine("Balance Remaining:", formatCurrency(summary.remainingBalance), 'bold', 11);
        }

        // --- Footer Notes ---
        if (quote.notesCustomer) {
            finalY = Math.max(finalY, doc.internal.pageSize.getHeight() - 100);
            doc.setFontSize(9);
            doc.setFont("Helvetica", "normal");
            doc.text("Notes:", margin.left, finalY);
            doc.text(doc.splitTextToSize(quote.notesCustomer, pageWidth - margin.left - margin.right), margin.left, finalY + 12);
        }

        doc.save(fileName);
        toast({ title: 'PDF Generated', description: 'Your PDF has been downloaded.' });
    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({ variant: 'destructive', title: 'PDF Error', description: 'Failed to generate PDF.' });
    } finally {
        setIsGenerating(false);
    }
  }, [quote, summary, fileName, toast]);


  return (
    <Button type="button" variant="secondary" onClick={generatePdf} disabled={isGenerating}>
        {isGenerating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
        Generate PDF
    </Button>
  );
}
