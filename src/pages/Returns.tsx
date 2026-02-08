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
  RefreshCw,
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowLeftRight,
} from "lucide-react";
import { Return } from "@/types/returns";
import { returnsApi } from "@/lib/api/returns.api";
import { useToast } from "@/hooks/use-toast";
import { ReturnForm } from "@/components/returns/ReturnForm";

const Returns: React.FC = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const response = await returnsApi.getReturns();
      if (response.success && response.data) {
        setReturns(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to fetch returns",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch returns",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "full_return":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "partial_return":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "exchange":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch =
      returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.sale_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (returnItem.sale?.customer?.name &&
        returnItem.sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === "all" || returnItem.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReturns = filteredReturns.slice(startIndex, startIndex + itemsPerPage);

  const handleReturnCreated = () => {
    fetchReturns();
    setShowReturnForm(false);
  };

  const handleApproveReturn = async (returnId: string) => {
    try {
      const response = await returnsApi.approveReturn(returnId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Return approved and processed successfully",
          variant: "success",
        });
        fetchReturns();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to approve return",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve return",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: returns.length,
    pending: returns.filter((r) => r.status === "pending").length,
    approved: returns.filter((r) => r.status === "approved" || r.status === "completed").length,
    totalRefund: returns
      .filter((r) => r.status === "approved" || r.status === "completed")
      .reduce((sum, r) => sum + Number(r.refund_amount || 0), 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Returns Management
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchReturns} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowReturnForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Return
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All returns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Processed returns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRefund.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total refund amount</p>
            </CardContent>
          </Card>
        </div>

        {/* Returns List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Returns</CardTitle>
                <CardDescription>Manage customer returns and exchanges</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search returns..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
                    <TableHead>Return ID</TableHead>
                    <TableHead>Sale ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Refund Amount</TableHead>
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
                        <p className="text-sm text-muted-foreground mt-2">Loading returns...</p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No returns found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReturns.map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-medium">
                          {returnItem.id.substring(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {returnItem.sale_id.substring(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {returnItem.sale?.customer?.name || returnItem.customer?.name || "Walk-in"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(returnItem.type)}>
                            {returnItem.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>${Number(returnItem.refund_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(returnItem.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(returnItem.status)}
                              <span className="capitalize">{returnItem.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(returnItem.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedReturn(returnItem)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {returnItem.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                onClick={() => handleApproveReturn(returnItem.id)}
                                title="Approve Return"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
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

      {/* Return Form Modal */}
      <ReturnForm
        open={showReturnForm}
        onOpenChange={setShowReturnForm}
        onReturnCreated={handleReturnCreated}
      />

      {/* Return Details Modal */}
      {selectedReturn && (
        <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Return Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Return ID</p>
                  <p className="font-medium">{selectedReturn.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sale ID</p>
                  <p className="font-medium">{selectedReturn.sale_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge className={getTypeColor(selectedReturn.type)}>
                    {selectedReturn.type.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedReturn.status)}>
                    {selectedReturn.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="font-medium">${Number(selectedReturn.refund_amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refund Method</p>
                  <p className="font-medium capitalize">{selectedReturn.refund_method}</p>
                </div>
              </div>
              {selectedReturn.reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="font-medium">{selectedReturn.reason}</p>
                </div>
              )}
              {selectedReturn.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{selectedReturn.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-2">Returned Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Refund Amount</TableHead>
                      {selectedReturn.type === "exchange" && (
                        <>
                          <TableHead>Exchange Product</TableHead>
                          <TableHead>Exchange Quantity</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedReturn.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name || "Product"}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${Number(item.unit_price || 0).toFixed(2)}</TableCell>
                        <TableCell>${Number(item.refund_amount || 0).toFixed(2)}</TableCell>
                        {selectedReturn.type === "exchange" && (
                          <>
                            <TableCell>
                              {item.exchange_product?.name || "N/A"}
                            </TableCell>
                            <TableCell>{item.exchange_quantity || item.quantity}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default Returns;
