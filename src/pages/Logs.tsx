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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  Shield,
  Loader2,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { activityLogsApi } from "@/lib/api/activity-logs.api";
import { ActivityLog } from "@/types/activity-log";
import { useToast } from "@/hooks/use-toast";

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    action: "all",
    entityType: "all",
    severity: "all",
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();
  const itemsPerPage = 50;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchTerm, filters]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filters.action && filters.action !== "all") {
        params.action = filters.action;
      }

      if (filters.entityType && filters.entityType !== "all") {
        params.entityType = filters.entityType;
      }

      if (filters.severity && filters.severity !== "all") {
        params.severity = filters.severity;
      }

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await activityLogsApi.getLogs(params);
      if (response.success && response.data) {
        setLogs(response.data.logs);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to fetch activity logs",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action: "all",
      entityType: "all",
      severity: "all",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const formatAction = (action: string) => {
    return action
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Activity Logs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Security and traceability logs for all system activities
            </p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </CardTitle>
            <CardDescription>Filter activity logs by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs by description, action, or user name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Action</label>
                  <Select
                    value={filters.action}
                    onValueChange={(value) => handleFilterChange("action", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="product.created">Product Created</SelectItem>
                      <SelectItem value="product.updated">Product Updated</SelectItem>
                      <SelectItem value="product.deleted">Product Deleted</SelectItem>
                      <SelectItem value="category.created">Category Created</SelectItem>
                      <SelectItem value="category.updated">Category Updated</SelectItem>
                      <SelectItem value="category.deleted">Category Deleted</SelectItem>
                      <SelectItem value="sale.completed">Sale Completed</SelectItem>
                      <SelectItem value="customer.created">Customer Created</SelectItem>
                      <SelectItem value="customer.updated">Customer Updated</SelectItem>
                      <SelectItem value="customer.deleted">Customer Deleted</SelectItem>
                      <SelectItem value="staff.created">Staff Created</SelectItem>
                      <SelectItem value="staff.updated">Staff Updated</SelectItem>
                      <SelectItem value="staff.deleted">Staff Deleted</SelectItem>
                      <SelectItem value="user.login">User Login</SelectItem>
                      <SelectItem value="user.logout">User Logout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Entity Type</label>
                  <Select
                    value={filters.entityType}
                    onValueChange={(value) => handleFilterChange("entityType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Severity</label>
                  <Select
                    value={filters.severity}
                    onValueChange={(value) => handleFilterChange("severity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {((filters.action && filters.action !== "all") || (filters.entityType && filters.entityType !== "all") || (filters.severity && filters.severity !== "all") || filters.startDate || filters.endDate || searchTerm) && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>
              Showing {logs.length} of {total} logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{log.user?.name || "Unknown"}</div>
                              <div className="text-muted-foreground text-xs">
                                {log.user?.email || "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{formatAction(log.action)}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium capitalize">{log.entity_type}</div>
                              {log.entity_id && (
                                <div className="text-muted-foreground text-xs font-mono">
                                  {log.entity_id.substring(0, 8)}...
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="text-sm truncate" title={log.description}>
                              {log.description || "No description"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityBadgeColor(log.severity)}>
                              <div className="flex items-center gap-1">
                                {getSeverityIcon(log.severity)}
                                <span className="capitalize">{log.severity}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-mono text-muted-foreground">
                            {log.ip_address || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Logs;
