import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, User, FileText, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({ 
  open, 
  onOpenChange, 
  defaultTab = 'product' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Product form state
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // Customer form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handleAddProduct = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      toast({
        title: "Error",
        description: "Please enter product name and price",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Product Added!",
      description: `${productName} has been added to your inventory`,
    });

    // Reset form
    setProductName('');
    setProductPrice('');
    setProductStock('');
    setProductDescription('');
    setIsLoading(false);
  };

  const handleAddCustomer = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter customer name and email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Customer Registered!",
      description: `${customerName} has been added to your customer list`,
    });

    // Reset form
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setIsLoading(false);
  };

  const handleViewReports = () => {
    toast({
      title: "Reports",
      description: "Reports feature will be available soon",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Actions</DialogTitle>
          <DialogDescription>
            Perform common tasks quickly
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="product">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="product-name">Product Name *</Label>
                  <Input
                    id="product-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="product-price">Price ($) *</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="product-stock">Initial Stock</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Product description (optional)"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleAddProduct} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isLoading ? 'Adding...' : 'Add Product'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Register Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer-name">Full Name *</Label>
                  <Input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Email *</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">Phone Number</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <Button 
                  onClick={handleAddCustomer} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isLoading ? 'Registering...' : 'Register Customer'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Access your business reports and analytics
                </p>
                <div className="grid gap-2">
                  <Button variant="outline" onClick={handleViewReports}>
                    Daily Sales Report
                  </Button>
                  <Button variant="outline" onClick={handleViewReports}>
                    Inventory Report
                  </Button>
                  <Button variant="outline" onClick={handleViewReports}>
                    Customer Report
                  </Button>
                  <Button variant="outline" onClick={handleViewReports}>
                    Financial Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};