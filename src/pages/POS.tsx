import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { POSCart } from "@/components/pos/POSCart";
import { ProductScanner } from "@/components/pos/ProductScanner";
import { PaymentModal } from "@/components/pos/PaymentModal";
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
import { Search, ShoppingCart, CreditCard, Loader2 } from "lucide-react";
import { Product } from "@/types/inventory";
import { CartItem } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";
import { inventoryApi } from "@/lib/api/inventory.api";

const POS: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await inventoryApi.getProducts();
        if (response.success && response.data) {
          // Filter only active products
          const activeProducts = response.data.filter(p => p.is_active);
          setProducts(activeProducts);
        } else {
          toast({
            title: "Error",
            description: response.error?.message || "Failed to fetch products",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
  );

  const addToCart = (product: Product) => {
    // Check stock availability
    if (product.stock_quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is out of stock`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      // Check if adding one more would exceed stock
      if (existingItem.quantity + 1 > product.stock_quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock_quantity} units available for ${product.name}`,
          variant: "destructive",
        });
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: item.price * (item.quantity + 1),
              }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        product_id: product.id,
        product_name: product.name,
        price: Number(product.price || 0),
        quantity: 1,
        total: Number(product.price || 0),
      };
      setCart([...cart, newItem]);
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
      variant: "success",
    });
  };

  const updateCartItem = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      const item = cart.find((i) => i.id === id);
      if (item) {
        const product = products.find((p) => p.id === item.product_id);
        if (product && quantity > product.stock_quantity) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${product.stock_quantity} units available for ${product.name}`,
            variant: "destructive",
          });
          return;
        }
        setCart(
          cart.map((item) =>
            item.id === id
              ? { ...item, quantity, total: item.price * quantity }
              : item
          )
        );
      }
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }
    setShowPayment(true);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[calc(100vh-8rem)]">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">Point of Sale</h1>
            <Badge variant="outline" className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-1" />
              {cart.length} items
            </Badge>
          </div>

          {/* Search and Scanner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Product Search</CardTitle>
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

            <ProductScanner onProductScanned={addToCart} products={products} />
          </div>

          {/* Product Grid */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Click on a product to add it to cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading products...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No products found matching your search" : "No products available"}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            ${Number(product.price || 0).toFixed(2)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {product.stock_quantity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <POSCart
            cart={cart}
            onUpdateItem={updateCartItem}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
          />

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={cart.length === 0}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        cart={cart}
        total={getCartTotal()}
        onPaymentComplete={clearCart}
      />
    </DashboardLayout>
  );
};

export default POS;
