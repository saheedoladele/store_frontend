import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Download } from "lucide-react";
import { Sale } from "@/types/pos";
import { useAuth } from "@/contexts/AuthContext";

interface InvoicePrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  open,
  onOpenChange,
  sale,
}) => {
  const { tenant } = useAuth();

  useEffect(() => {
    // Auto-print when modal opens (if tenant settings allow)
    if (open && sale && tenant?.settings?.auto_print_receipt) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [open, sale, tenant?.settings?.auto_print_receipt]);

  if (!sale) return null;

  const handlePrint = () => {
    const invoiceHTML = generateInvoiceHTML(sale);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownload = () => {
    const invoiceHTML = generateInvoiceHTML(sale);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const generateInvoiceHTML = (sale: Sale): string => {
    const businessName = tenant?.name || "Store Name";
    const businessAddress = tenant?.settings?.business_address || "";
    const businessPhone = tenant?.settings?.business_phone || "";
    const businessEmail = tenant?.settings?.business_email || "";
    const receiptFooter = tenant?.settings?.receipt_footer || "";
    const currency = tenant?.settings?.currency || "USD";
    const invoiceNumber = `INV-${sale.id.substring(0, 8).toUpperCase()}`;
    const issueDate = new Date(sale.created_at);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 40px;
      color: #333;
      line-height: 1.6;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: #1f2937;
    }
    .invoice-number {
      font-size: 18px;
      color: #6b7280;
    }
    .invoice-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .section h3 {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .section p {
      margin: 4px 0;
      color: #1f2937;
    }
    .invoice-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 40px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    .detail-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      background: #f9fafb;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      border-bottom: 2px solid #e5e7eb;
    }
    th.text-right {
      text-align: right;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
    }
    td.text-right {
      text-align: right;
    }
    .invoice-summary {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .summary-box {
      width: 300px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .summary-row.total {
      border-top: 2px solid #e5e7eb;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: bold;
    }
    .summary-label {
      color: #6b7280;
    }
    .summary-value {
      color: #1f2937;
    }
    .invoice-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .status-completed {
      background: #d1fae5;
      color: #065f46;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">${invoiceNumber}</div>
    </div>
    <div>
      <span class="status-badge status-completed">${sale.status}</span>
    </div>
  </div>

  <div class="invoice-body">
    <div class="section">
      <h3>From</h3>
      <p><strong>${businessName}</strong></p>
      ${businessAddress ? `<p>${businessAddress}</p>` : ''}
      ${businessPhone ? `<p>${businessPhone}</p>` : ''}
      ${businessEmail ? `<p>${businessEmail}</p>` : ''}
    </div>
    <div class="section">
      <h3>Bill To</h3>
      <p><strong>${sale.customer?.name || "Walk-in Customer"}</strong></p>
      ${sale.customer?.email ? `<p>${sale.customer.email}</p>` : ''}
      ${sale.customer?.phone ? `<p>${sale.customer.phone}</p>` : ''}
    </div>
  </div>

  <div class="invoice-details">
    <div class="detail-item">
      <span class="detail-label">Issue Date</span>
      <span class="detail-value">${issueDate.toLocaleDateString()}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Due Date</span>
      <span class="detail-value">${dueDate.toLocaleDateString()}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Payment Method</span>
      <span class="detail-value">${sale.payment_method.replace('_', ' ').toUpperCase()}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Payment Date</span>
      <span class="detail-value">${issueDate.toLocaleDateString()}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${sale.items?.map(item => `
        <tr>
          <td>${item.product?.name || "Product"}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${currency} ${Number(item.unit_price || 0).toFixed(2)}</td>
          <td class="text-right">${currency} ${Number(item.total_price || 0).toFixed(2)}</td>
        </tr>
      `).join('') || ''}
    </tbody>
  </table>

  <div class="invoice-summary">
    <div class="summary-box">
      <div class="summary-row">
        <span class="summary-label">Subtotal</span>
        <span class="summary-value">${currency} ${Number(sale.subtotal || 0).toFixed(2)}</span>
      </div>
      ${Number(sale.tax_amount || 0) > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Tax</span>
        <span class="summary-value">${currency} ${Number(sale.tax_amount || 0).toFixed(2)}</span>
      </div>
      ` : ''}
      ${Number(sale.discount_amount || 0) > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Discount</span>
        <span class="summary-value">-${currency} ${Number(sale.discount_amount || 0).toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="summary-row total">
        <span class="summary-label">Total</span>
        <span class="summary-value">${currency} ${Number(sale.total_amount || 0).toFixed(2)}</span>
      </div>
    </div>
  </div>

  ${receiptFooter ? `
  <div class="invoice-footer">
    ${receiptFooter}
  </div>
  ` : ''}
</body>
</html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Invoice - Sale #{sale.id.substring(0, 8).toUpperCase()}</DialogTitle>
              <DialogDescription>
                Your invoice is ready for printing
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {sale.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">From</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{tenant?.name || "Store Name"}</p>
                {tenant?.settings?.business_address && (
                  <p className="text-muted-foreground">
                    {tenant.settings.business_address}
                  </p>
                )}
                {tenant?.settings?.business_phone && (
                  <p className="text-muted-foreground">
                    {tenant.settings.business_phone}
                  </p>
                )}
                {tenant?.settings?.business_email && (
                  <p className="text-muted-foreground">
                    {tenant.settings.business_email}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bill To</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{sale.customer?.name || "Walk-in Customer"}</p>
                {sale.customer?.email && (
                  <p className="text-muted-foreground">{sale.customer.email}</p>
                )}
                {sale.customer?.phone && (
                  <p className="text-muted-foreground">{sale.customer.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Invoice Number</p>
              <p className="font-medium">INV-{sale.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Issue Date</p>
              <p className="font-medium">
                {new Date(sale.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">
                {sale.payment_method.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{sale.status}</p>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items && sale.items.length > 0 ? (
                    sale.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product?.name || "Product"}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${Number(item.unit_price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${Number(item.total_price || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end">
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${Number(sale.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(sale.tax_amount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${Number(sale.tax_amount || 0).toFixed(2)}</span>
                </div>
              )}
              {Number(sale.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-${Number(sale.discount_amount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${Number(sale.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          {tenant?.settings?.receipt_footer && (
            <div className="border-t pt-4 text-center text-sm text-muted-foreground">
              {tenant.settings.receipt_footer}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
