import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProductForm } from "@/components/inventory/ProductForm";
import { ProductList } from "@/components/inventory/ProductList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, AlertTriangle, Loader2 } from "lucide-react";
import { Product } from "@/types/inventory";
import { inventoryApi } from "@/lib/api/inventory.api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Inventory: React.FC = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const response = await inventoryApi.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        // Don't clear existing products on error, just show the error
        toast({
          title: "Error",
          description: response.error?.message || "Failed to fetch products",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Don't clear existing products on error
      toast({
        title: "Error",
        description: "Failed to fetch products. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await inventoryApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      // Silently fail - categories are not critical for this page
      console.error('Failed to fetch categories:', error);
    }
  };

  const lowStockProducts = products.filter(
    (p) => (Number(p.stock_quantity) || 0) <= (Number(p.min_stock_level) || 0)
  );
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock_quantity) || 0),
    0
  );

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    // Refresh products without showing loading state to avoid blank page
    fetchProducts(false);
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteProductId(product.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductId) return;

    setIsDeleting(true);
    try {
      const response = await inventoryApi.deleteProduct(deleteProductId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
          variant: "success",
        });
        await fetchProducts();
        setDeleteProductId(null);
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <Button onClick={handleAddProduct} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <Badge variant="secondary">$</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {lowStockProducts.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Product Search</CardTitle>
            <CardDescription>
              Find products by name, SKU, or barcode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product List */}
        {isLoading && products.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading products...
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <ProductList
              products={products}
              searchTerm={searchTerm}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteClick}
            />
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                {deleteProductId && products.find(p => p.id === deleteProductId) && (
                  <> "{products.find(p => p.id === deleteProductId)?.name}"</>
                )}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Product Form Modal */}
        <ProductForm
          open={showProductForm}
          onOpenChange={(open) => {
            setShowProductForm(open);
            if (!open) {
              setEditingProduct(null);
            }
          }}
          product={editingProduct}
          onSaved={handleProductSaved}
        />
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
