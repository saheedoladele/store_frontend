import React from "react";
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
import {
  Download,
  X,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Invoice } from "@/types/billing";
import { useAuth } from "@/contexts/AuthContext";

interface InvoiceViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onDownload: (invoice: Invoice) => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  open,
  onOpenChange,
  invoice,
  onDownload,
}) => {
  const { tenant } = useAuth();

  if (!invoice) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "sent":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleDownload = () => {
    if (invoice) {
      onDownload(invoice);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Invoice {invoice.invoice_number}</DialogTitle>
              <DialogDescription>
                Invoice details and payment information
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(invoice.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(invoice.status)}
                  <span className="capitalize">{invoice.status}</span>
                </div>
              </Badge>
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
                <p className="font-medium">{invoice.customer_name}</p>
                {invoice.customer_email && (
                  <p className="text-muted-foreground">{invoice.customer_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Issue Date</p>
              <p className="font-medium">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
            {invoice.payment_date && (
              <div>
                <p className="text-muted-foreground">Payment Date</p>
                <p className="font-medium">
                  {new Date(invoice.payment_date).toLocaleDateString()}
                </p>
              </div>
            )}
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
                  {invoice.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        No items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${item.unit_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.total_price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
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
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${invoice.tax_amount.toFixed(2)}</span>
                </div>
              )}
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-${invoice.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${invoice.total_amount.toFixed(2)}</span>
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
      </DialogContent>
    </Dialog>
  );
};
