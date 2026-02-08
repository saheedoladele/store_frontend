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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
} from "lucide-react";
import { reportsApi } from "@/lib/api/reports.api";
import { posApi } from "@/lib/api/pos.api";
import { Sale } from "@/types/pos";
import { TopProduct, CategorySales } from "@/types/reports";
import { useToast } from "@/hooks/use-toast";

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<CategorySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Calculate category sales when sales data changes
  useEffect(() => {
    if (sales.length > 0) {
      calculateSalesByCategory(sales);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, selectedCategory]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const params = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const [salesResponse, topProductsResponse] = await Promise.all([
        reportsApi.getSalesReport(Object.keys(params).length > 0 ? params : undefined),
        reportsApi.getTopProducts(10),
      ]);

      if (salesResponse.success && salesResponse.data) {
        setSales(salesResponse.data);
      }

      if (topProductsResponse.success && topProductsResponse.data) {
        setTopProducts(topProductsResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSalesByCategory = (salesData: Sale[]) => {
    const categoryMap = new Map<string, { quantity: number; revenue: number }>();

    salesData.forEach((sale) => {
      sale.items?.forEach((item) => {
        // Filter by selected category if not "all"
        if (selectedCategory !== "all") {
          const itemCategory = item.product?.category?.name?.toLowerCase() || "uncategorized";
          if (itemCategory !== selectedCategory) {
            return;
          }
        }

        const categoryName = item.product?.category?.name || "Uncategorized";
        const existing = categoryMap.get(categoryName) || { quantity: 0, revenue: 0 };
        categoryMap.set(categoryName, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + Number(item.total_price || 0),
        });
      });
    });

    const categorySales: CategorySales[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        quantity_sold: data.quantity,
        total_revenue: data.revenue,
      })
    );

    setSalesByCategory(categorySales.sort((a, b) => b.total_revenue - a.total_revenue));
  };

  // Recalculate category sales when category filter changes
  useEffect(() => {
    if (sales.length > 0) {
      calculateSalesByCategory(sales);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const calculateSalesMetrics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const filterSales = (start: Date, end?: Date) => {
      return sales.filter((sale) => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= start && (!end || saleDate <= end);
      });
    };

    const todaySales = filterSales(today);
    const yesterdaySales = filterSales(yesterday, new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1));
    const thisWeekSales = filterSales(thisWeekStart);
    const lastWeekSales = filterSales(lastWeekStart, lastWeekEnd);
    const thisMonthSales = filterSales(thisMonthStart);
    const lastMonthSales = filterSales(lastMonthStart, lastMonthEnd);

    const calculateTotal = (salesList: Sale[]) => {
      return salesList.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
    };

    const todayTotal = calculateTotal(todaySales);
    const yesterdayTotal = calculateTotal(yesterdaySales);
    const thisWeekTotal = calculateTotal(thisWeekSales);
    const lastWeekTotal = calculateTotal(lastWeekSales);
    const thisMonthTotal = calculateTotal(thisMonthSales);
    const lastMonthTotal = calculateTotal(lastMonthSales);

    const todayChange = yesterdayTotal > 0
      ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
      : todayTotal > 0 ? 100 : 0;
    const weekChange = lastWeekTotal > 0
      ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
      : thisWeekTotal > 0 ? 100 : 0;
    const monthChange = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : thisMonthTotal > 0 ? 100 : 0;

    const avgOrderValue = sales.length > 0
      ? calculateTotal(sales) / sales.length
      : 0;
    const previousAvgOrderValue = lastMonthSales.length > 0
      ? lastMonthTotal / lastMonthSales.length
      : 0;
    const avgOrderChange = previousAvgOrderValue > 0
      ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100
      : avgOrderValue > 0 ? 100 : 0;

    return {
      today: todayTotal,
      todayChange,
      yesterday: yesterdayTotal,
      this_week: thisWeekTotal,
      weekChange,
      this_month: thisMonthTotal,
      monthChange,
      avgOrderValue,
      avgOrderChange,
    };
  };

  const salesMetrics = calculateSalesMetrics();

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sales Reports</h1>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Period</label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={(value) => {
                      setSelectedPeriod(value);
                      const now = new Date();
                      let newStartDate = "";
                      let newEndDate = "";
                      
                      if (value === "daily") {
                        newStartDate = now.toISOString().split("T")[0];
                        newEndDate = now.toISOString().split("T")[0];
                      } else if (value === "weekly") {
                        const weekStart = new Date(now);
                        weekStart.setDate(now.getDate() - now.getDay());
                        newStartDate = weekStart.toISOString().split("T")[0];
                        newEndDate = now.toISOString().split("T")[0];
                      } else if (value === "monthly") {
                        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
                        newEndDate = now.toISOString().split("T")[0];
                      } else if (value === "yearly") {
                        newStartDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
                        newEndDate = now.toISOString().split("T")[0];
                      }
                      
                      setStartDate(newStartDate);
                      setEndDate(newEndDate);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {salesByCategory.map((cat) => (
                        <SelectItem key={cat.category} value={cat.category.toLowerCase()}>
                          {cat.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setSelectedPeriod("custom");
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setSelectedPeriod("custom");
                    }}
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setSelectedPeriod("monthly");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Sales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${salesMetrics.today.toFixed(2)}
              </div>
              <p className={`text-xs ${salesMetrics.todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesMetrics.todayChange >= 0 ? '+' : ''}{salesMetrics.todayChange.toFixed(1)}% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${salesMetrics.this_week.toFixed(2)}
              </div>
              <p className={`text-xs ${salesMetrics.weekChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesMetrics.weekChange >= 0 ? '+' : ''}{salesMetrics.weekChange.toFixed(1)}% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${salesMetrics.this_month.toFixed(2)}
              </div>
              <p className={`text-xs ${salesMetrics.monthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesMetrics.monthChange >= 0 ? '+' : ''}{salesMetrics.monthChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Order Value
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${salesMetrics.avgOrderValue.toFixed(2)}</div>
              <p className={`text-xs ${salesMetrics.avgOrderChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesMetrics.avgOrderChange >= 0 ? '+' : ''}{salesMetrics.avgOrderChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Top Products
              </CardTitle>
              <CardDescription>
                Best selling products this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No product sales data available
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.product_id || product.product_name}>
                          <TableCell className="font-medium">
                            {product.product_name || 'Unknown Product'}
                          </TableCell>
                          <TableCell>{Number(product.quantity_sold || 0)}</TableCell>
                          <TableCell>${Number(product.total_revenue || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Sales by Category
              </CardTitle>
              <CardDescription>
                Revenue breakdown by product category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : salesByCategory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No category sales data available
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesByCategory.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell className="font-medium">
                            {category.category}
                          </TableCell>
                          <TableCell>{category.quantity_sold}</TableCell>
                          <TableCell>${Number(category.total_revenue || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Chart</CardTitle>
            <CardDescription>Sales performance over time</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <p>Interactive sales chart will be implemented here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
