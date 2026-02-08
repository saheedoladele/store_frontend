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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Eye,
  Download,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { Sale } from "@/types/pos";
import { Return } from "@/types/returns";
import { Transaction, TransactionType } from "@/types/transactions";
import { posApi } from "@/lib/api/pos.api";
import { returnsApi } from "@/lib/api/returns.api";
import { useToast } from "@/hooks/use-toast";

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<TransactionType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const itemsPerPage = 20;
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Fetch both sales and returns
      const [salesResponse, returnsResponse] = await Promise.all([
        posApi.getSales(),
        returnsApi.getReturns(),
      ]);

      const allTransactions: Transaction[] = [];

      // Convert sales to transactions
      if (salesResponse.success && salesResponse.data) {
        salesResponse.data.forEach((sale: Sale) => {
          allTransactions.push({
            id: `sale-${sale.id}`,
            type: "sale",
            transaction_id: sale.id,
            customer_id: sale.customer_id,
            customer: sale.customer,
            amount: Number(sale.total_amount || 0),
            payment_method: sale.payment_method,
            status: sale.status,
            items_count: sale.items?.length || 0,
            created_at: sale.created_at,
            updated_at: sale.updated_at,
            sale: sale,
          });
        });
      }

      // Convert returns to transactions
      if (returnsResponse.success && returnsResponse.data) {
        returnsResponse.data.forEach((returnItem: Return) => {
          allTransactions.push({
            id: `return-${returnItem.id}`,
            type: "return",
            transaction_id: returnItem.id,
            customer_id: returnItem.customer_id,
            customer: returnItem.customer || returnItem.sale?.customer,
            amount: -Number(returnItem.refund_amount || 0), // Negative for returns
            payment_method: returnItem.refund_method,
            status: returnItem.status,
            items_count: returnItem.items?.length || 0,
            created_at: returnItem.created_at,
            updated_at: returnItem.updated_at,
            return: returnItem,
          });
        });
      }

      // Sort by date (newest first)
      allTransactions.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTransactions(allTransactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string, type: TransactionType) => {
    if (type === "sale") {
      switch (status) {
        case "completed":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "cancelled":
        case "refunded":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      }
    } else {
      switch (status) {
        case "approved":
        case "completed":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "rejected":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      }
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.customer?.name &&
        transaction.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || transaction.type === selectedType;
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const stats = {
    total: transactions.length,
    sales: transactions.filter((t) => t.type === "sale").length,
    returns: transactions.filter((t) => t.type === "return").length,
    totalRevenue: transactions
      .filter((t) => t.type === "sale" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    totalRefunds: transactions
      .filter((t) => t.type === "return" && (t.status === "approved" || t.status === "completed"))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    netAmount: transactions
      .filter(
        (t) =>
          (t.type === "sale" && t.status === "completed") ||
          (t.type === "return" && (t.status === "approved" || t.status === "completed"))
      )
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Transactions
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchTransactions} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.sales} sales, {stats.returns} returns
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">From completed sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${stats.totalRefunds.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">From approved returns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.netAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Revenue - Refunds</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  View all sales and returns in one place
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value as TransactionType | "all");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sale">Sales</SelectItem>
                    <SelectItem value="return">Returns</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Loading transactions...</p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge
                            variant={transaction.type === "sale" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {transaction.type === "sale" ? (
                              <ArrowUpCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <ArrowDownCircle className="mr-1 h-3 w-3" />
                            )}
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.transaction_id.substring(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {transaction.customer?.name || "Walk-in Customer"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              transaction.amount >= 0
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {transaction.amount >= 0 ? "+" : ""}
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize">
                          {transaction.payment_method.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status, transaction.type)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedTransaction(transaction)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                              <PaginationLink className="pointer-events-none">...</PaginationLink>
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
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Transaction Details - {selectedTransaction.type.toUpperCase()}
              </DialogTitle>
              <DialogDescription>
                {selectedTransaction.transaction_id.substring(0, 8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge className="capitalize mt-1">
                    {selectedTransaction.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={getStatusColor(selectedTransaction.status, selectedTransaction.type)}
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedTransaction.customer?.name || "Walk-in Customer"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">
                    {selectedTransaction.payment_method.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p
                    className={`font-bold text-lg ${
                      selectedTransaction.amount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.amount >= 0 ? "+" : ""}
                    ${Math.abs(selectedTransaction.amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedTransaction.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Sale Details */}
              {selectedTransaction.type === "sale" && selectedTransaction.sale && (
                <div>
                  <h3 className="font-semibold mb-3">Sale Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.sale.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || "Product"}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${Number(item.unit_price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${Number(item.total_price || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${Number(selectedTransaction.sale.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {Number(selectedTransaction.sale.tax_amount || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span>${Number(selectedTransaction.sale.tax_amount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {Number(selectedTransaction.sale.discount_amount || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount</span>
                          <span>-${Number(selectedTransaction.sale.discount_amount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${Number(selectedTransaction.sale.total_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Details */}
              {selectedTransaction.type === "return" && selectedTransaction.return && (
                <div>
                  <h3 className="font-semibold mb-3">Return Details</h3>
                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Return Type</p>
                      <Badge className="capitalize">
                        {selectedTransaction.return.type.replace("_", " ")}
                      </Badge>
                    </div>
                    {selectedTransaction.return.reason && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reason</p>
                        <p className="font-medium">{selectedTransaction.return.reason}</p>
                      </div>
                    )}
                    {selectedTransaction.return.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="font-medium">{selectedTransaction.return.notes}</p>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-3">Returned Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Refund Amount</TableHead>
                        {selectedTransaction.return.type === "exchange" && (
                          <TableHead>Exchange Product</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.return.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || "Product"}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${Number(item.refund_amount || 0).toFixed(2)}
                          </TableCell>
                          {selectedTransaction.return?.type === "exchange" && (
                            <TableCell>
                              {item.exchange_product?.name || "N/A"}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <div className="w-64">
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Refund</span>
                        <span className="text-red-600">
                          ${Number(selectedTransaction.return.refund_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default Transactions;
