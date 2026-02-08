import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Send,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
} from "lucide-react";
import { type Invoice } from "@/types/billing";
import { posApi } from "@/lib/api/pos.api";
import { tenantApi } from "@/lib/api/tenant.api";
import { Sale } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceViewModal } from "@/components/billing/InvoiceViewModal";

const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingStats, setBillingStats] = useState({
    totalRevenue: 0,
    pendingInvoices: 0,
    overdue: 0,
    thisMonth: 0,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const { tenant } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const response = await posApi.getSales();
      if (response.success && response.data) {
        // Convert sales to invoices (sorted by date, newest first)
        const sortedSales = [...response.data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const salesToInvoices = sortedSales.map((sale, index) => {
          // Generate invoice number based on sale ID or index
          const invoiceNumber = `INV-${sale.id.substring(0, 8).toUpperCase()}`;
          const issueDate = new Date(sale.created_at);
          const dueDate = new Date(issueDate);
          dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms
          
          // Determine status based on sale status and due date
          let status: Invoice['status'] = 'paid';
          if (sale.status === 'pending') {
            status = new Date() > dueDate ? 'overdue' : 'sent';
          } else if (sale.status === 'cancelled') {
            status = 'cancelled';
          } else if (sale.status === 'completed') {
            status = 'paid';
          } else if (sale.status === 'refunded') {
            status = 'cancelled';
          }

          return {
            id: sale.id,
            invoice_number: invoiceNumber,
            customer_id: sale.customer_id,
            customer_name: sale.customer?.name || "Walk-in Customer",
            customer_email: sale.customer?.email || "",
            items: sale.items?.map(item => ({
              id: item.id,
              product_id: item.product_id,
              description: item.product?.name || "Product",
              quantity: item.quantity,
              unit_price: Number(item.unit_price || 0),
              total_price: Number(item.total_price || 0),
            })) || [],
            subtotal: Number(sale.subtotal || 0),
            tax_amount: Number(sale.tax_amount || 0),
            discount_amount: Number(sale.discount_amount || 0),
            total_amount: Number(sale.total_amount || 0),
            status,
            due_date: dueDate.toISOString().split('T')[0],
            issue_date: issueDate.toISOString().split('T')[0],
            payment_date: sale.status === 'completed' ? sale.created_at : undefined,
            created_at: sale.created_at,
            updated_at: sale.updated_at,
          } as Invoice;
        });

        setInvoices(salesToInvoices);
        calculateBillingStats(salesToInvoices);
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to fetch invoices",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBillingStats = (invoiceList: Invoice[]) => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalRevenue = invoiceList
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    
    const pendingInvoices = invoiceList.filter(
      inv => inv.status === 'sent'
    ).length;
    
    const overdue = invoiceList.filter(
      inv => inv.status === 'overdue'
    ).length;
    
    const thisMonth = invoiceList
      .filter(inv => {
        const invoiceDate = new Date(inv.issue_date);
        return invoiceDate >= thisMonthStart && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    setBillingStats({
      totalRevenue,
      pendingInvoices,
      overdue,
      thisMonth,
    });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(invoice);
    
    // Create a new window and print/download
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
      };
      
      toast({
        title: "Invoice Ready",
        description: "Invoice is ready for download/printing",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: "Please allow pop-ups to download invoice",
        variant: "destructive",
      });
    }
  };

  const generateInvoiceHTML = (invoice: Invoice): string => {
    const businessName = tenant?.name || "Store Name";
    const businessAddress = tenant?.settings?.business_address || "";
    const businessPhone = tenant?.settings?.business_phone || "";
    const businessEmail = tenant?.settings?.business_email || "";
    const receiptFooter = tenant?.settings?.receipt_footer || "";
    const currency = tenant?.settings?.currency || "USD";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoice_number}</title>
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
    .status-paid {
      background: #d1fae5;
      color: #065f46;
    }
    .status-sent {
      background: #dbeafe;
      color: #1e40af;
    }
    .status-overdue {
      background: #fee2e2;
      color: #991b1b;
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
      <div class="invoice-number">${invoice.invoice_number}</div>
    </div>
    <div>
      <span class="status-badge status-${invoice.status}">${invoice.status}</span>
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
      <p><strong>${invoice.customer_name}</strong></p>
      ${invoice.customer_email ? `<p>${invoice.customer_email}</p>` : ''}
    </div>
  </div>

  <div class="invoice-details">
    <div class="detail-item">
      <span class="detail-label">Issue Date</span>
      <span class="detail-value">${new Date(invoice.issue_date).toLocaleDateString()}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Due Date</span>
      <span class="detail-value">${new Date(invoice.due_date).toLocaleDateString()}</span>
    </div>
    ${invoice.payment_date ? `
    <div class="detail-item">
      <span class="detail-label">Payment Date</span>
      <span class="detail-value">${new Date(invoice.payment_date).toLocaleDateString()}</span>
    </div>
    ` : ''}
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
      ${invoice.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${currency} ${item.unit_price.toFixed(2)}</td>
          <td class="text-right">${currency} ${item.total_price.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="invoice-summary">
    <div class="summary-box">
      <div class="summary-row">
        <span class="summary-label">Subtotal</span>
        <span class="summary-value">${currency} ${invoice.subtotal.toFixed(2)}</span>
      </div>
      ${invoice.tax_amount > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Tax</span>
        <span class="summary-value">${currency} ${invoice.tax_amount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${invoice.discount_amount > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Discount</span>
        <span class="summary-value">-${currency} ${invoice.discount_amount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="summary-row total">
        <span class="summary-label">Total</span>
        <span class="summary-value">${currency} ${invoice.total_amount.toFixed(2)}</span>
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
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customer_email && invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Billing & Invoices
          </h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="text-center text-muted-foreground py-8">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Invoice creation form will be implemented here</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subscription Info */}
        {tenant?.subscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5" />
                Subscription Plan
              </CardTitle>
              <CardDescription>Your current subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-base capitalize">
                      {tenant.subscription.plan} Plan
                    </Badge>
                    <Badge
                      className={
                        tenant.subscription.status === "active"
                          ? "bg-green-100 text-green-800"
                          : tenant.subscription.status === "past_due"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {tenant.subscription.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Next billing date: {new Date(tenant.subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" size="sm">
                    Manage Billing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${billingStats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${billingStats.thisMonth.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {billingStats.pendingInvoices}
              </div>
              <p className="text-xs text-muted-foreground">
                Invoices pending payment
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {billingStats.overdue}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  Manage your invoices and payments
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Loading invoices...</p>
                    </TableCell>
                  </TableRow>
                ) : paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invoice.customer_name}
                          </div>
                          {invoice.customer_email && (
                            <div className="text-sm text-muted-foreground">
                              {invoice.customer_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(invoice.status)}
                            <span className="capitalize">{invoice.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceView(true);
                            }}
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <PaginationItem>
                              <PaginationLink className="pointer-events-none">
                                ...
                              </PaginationLink>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice View Modal */}
      <InvoiceViewModal
        open={showInvoiceView}
        onOpenChange={setShowInvoiceView}
        invoice={selectedInvoice}
        onDownload={handleDownloadInvoice}
      />
    </DashboardLayout>
  );
};

export default Billing;
