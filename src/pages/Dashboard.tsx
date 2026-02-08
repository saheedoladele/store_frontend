import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { QuickActionsModal } from "@/components/dashboard/QuickActionsModal";
import { QuickSaleModal } from "@/components/pos/QuickSaleModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, AlertTriangle } from "lucide-react";
import { inventoryApi } from "@/lib/api/inventory.api";
import { Product } from "@/types/inventory";
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [defaultActionTab, setDefaultActionTab] = useState("product");
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoadingLowStock, setIsLoadingLowStock] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      setIsLoadingLowStock(true);
      try {
        const response = await inventoryApi.getLowStockProducts();
        if (response.success && response.data) {
          setLowStockProducts(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch low stock products:", error);
      } finally {
        setIsLoadingLowStock(false);
      }
    };

    fetchLowStockProducts();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-product":
        setDefaultActionTab("product");
        setQuickActionsOpen(true);
        break;
      case "register-customer":
        setDefaultActionTab("customer");
        setQuickActionsOpen(true);
        break;
      case "view-reports":
        setDefaultActionTab("reports");
        setQuickActionsOpen(true);
        break;
      default:
        setQuickActionsOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button onClick={() => setQuickSaleOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Quick Sale
            </Button>
          </div>
        </div>

        <DashboardStats />

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
          <SalesOverview />

          <div className="lg:col-span-3">
            <RecentActivity />
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleQuickAction("add-product")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleQuickAction("register-customer")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Register Customer
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleQuickAction("view-reports")}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                Products running low on inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLowStock ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : lowStockProducts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No low stock products
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1 mr-2">{product.name}</span>
                      <Badge 
                        variant={product.stock_quantity === 0 ? "destructive" : "secondary"}
                      >
                        {product.stock_quantity} left
                      </Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="link" size="sm" asChild>
                        <a href="/inventory">View all ({lowStockProducts.length})</a>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <QuickSaleModal open={quickSaleOpen} onOpenChange={setQuickSaleOpen} />
        <QuickActionsModal
          open={quickActionsOpen}
          onOpenChange={setQuickActionsOpen}
          defaultTab={defaultActionTab}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
