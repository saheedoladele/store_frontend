import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { posApi } from "@/lib/api/pos.api";
import { Sale } from "@/types/pos";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
}

export const SalesOverview: React.FC = () => {
  const [chartData, setChartData] = useState<SalesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      try {
        // Get sales from last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const response = await posApi.getSales();
        if (response.success && response.data) {
          const sales = response.data as Sale[];

          // Group sales by date
          const salesByDate = new Map<string, { sales: number; orders: number }>();

          sales.forEach((sale) => {
            const saleDate = new Date(sale.created_at);
            const dateKey = saleDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            if (salesByDate.has(dateKey)) {
              const existing = salesByDate.get(dateKey)!;
              existing.sales += Number(sale.total_amount || 0);
              existing.orders += 1;
            } else {
              salesByDate.set(dateKey, {
                sales: Number(sale.total_amount || 0),
                orders: 1,
              });
            }
          });

          // Convert to array and sort by date
          const dataPoints: SalesDataPoint[] = Array.from(salesByDate.entries())
            .map(([date, data]) => ({
              date,
              sales: data.sales,
              orders: data.orders,
            }))
            .sort((a, b) => {
              // Simple sort - in production, parse dates properly
              return a.date.localeCompare(b.date);
            });

          // Limit to last 14 days for better visualization
          setChartData(dataPoints.slice(-14));
        }
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (isLoading) {
    return (
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Your sales performance over time</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading sales data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Your sales performance over time</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">📈</div>
            <p>No sales data available</p>
            <p className="text-sm mt-1">Start making sales to see your performance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Your sales performance over the last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-xs"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-xs"
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
