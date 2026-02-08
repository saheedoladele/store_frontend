import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { reportsApi } from '@/lib/api/reports.api';
import { DashboardStats as DashboardStatsType } from '@/types/reports';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <div className={`text-xs flex items-center space-x-1 ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {changeType === 'positive' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{change} from last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reportsApi.getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = stats ? [
    {
      title: "Total Revenue",
      value: `$${stats.total_revenue?.toLocaleString() || '0'}`,
      change: stats.revenue_change ? `${stats.revenue_change > 0 ? '+' : ''}${stats.revenue_change.toFixed(1)}%` : '',
      changeType: (stats.revenue_change || 0) >= 0 ? "positive" as const : "negative" as const,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Orders",
      value: stats.total_orders?.toLocaleString() || '0',
      change: stats.orders_change ? `${stats.orders_change > 0 ? '+' : ''}${stats.orders_change.toFixed(1)}%` : '',
      changeType: (stats.orders_change || 0) >= 0 ? "positive" as const : "negative" as const,
      icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Products",
      value: stats.total_products?.toLocaleString() || '0',
      change: stats.products_change ? `${stats.products_change > 0 ? '+' : ''}${stats.products_change.toFixed(1)}%` : '',
      changeType: (stats.products_change || 0) >= 0 ? "positive" as const : "negative" as const,
      icon: <Package className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Customers",
      value: stats.total_customers?.toLocaleString() || '0',
      change: stats.customers_change ? `${stats.customers_change > 0 ? '+' : ''}${stats.customers_change.toFixed(1)}%` : '',
      changeType: (stats.customers_change || 0) >= 0 ? "positive" as const : "negative" as const,
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    }
  ] : [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};