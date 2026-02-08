import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { posApi } from "@/lib/api/pos.api";
import { Sale } from "@/types/pos";

interface ActivityItem {
  id: string;
  type: "sale" | "inventory" | "customer";
  description: string;
  timestamp: string;
  amount?: string;
  status?: string;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSales = async () => {
      setIsLoading(true);
      try {
        const response = await posApi.getSales();
        if (response.success && response.data) {
          // Convert sales to activity items
          const sales = response.data.slice(0, 10); // Get last 10 sales
          const activityItems: ActivityItem[] = sales.map((sale: Sale) => {
            const saleDate = new Date(sale.created_at);
            const customerName = sale.customer?.name || "Walk-in Customer";
            const itemCount = sale.items?.length || 0;
            
            return {
              id: sale.id,
              type: "sale" as const,
              description: `Sale completed${sale.customer ? ` for ${customerName}` : ''} - ${itemCount} item${itemCount !== 1 ? 's' : ''}`,
              timestamp: formatTimeAgo(saleDate),
              amount: `$${Number(sale.total_amount || 0).toFixed(2)}`,
              status: sale.status || "completed",
            };
          });
          setActivities(activityItems);
        }
      } catch (error) {
        console.error("Failed to fetch recent sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSales();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return "💰";
      case "inventory":
        return "📦";
      case "customer":
        return "👤";
      default:
        return "📋";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your store</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading activities...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {getActivityIcon(activity.type)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {activity.amount && (
                  <span className="text-sm font-medium">{activity.amount}</span>
                )}
                {activity.status && (
                  <Badge
                    variant="secondary"
                    className={getStatusColor(activity.status)}
                  >
                    {activity.status}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
