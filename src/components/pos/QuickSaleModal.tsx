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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickSaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface QuickSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({ open, onOpenChange }) => {
  const [items, setItems] = useState<QuickSaleItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    if (!itemName.trim() || !itemPrice.trim()) {
      toast({
        title: "Error",
        description: "Please enter both item name and price",
        variant: "destructive"
      });
      return;
    }

    const newItem: QuickSaleItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      price: parseFloat(itemPrice),
      quantity: 1
    };

    setItems([...items, newItem]);
    setItemName('');
    setItemPrice('');
  };

  const updateQuantity = (id: string, change: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const processSale = async () => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the sale",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Sale Completed!",
      description: `Sale of $${getTotalAmount().toFixed(2)} processed successfully`,
    });

    // Reset form
    setItems([]);
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Sale</DialogTitle>
          <DialogDescription>
            Add items and process a quick sale
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Item Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
            </div>
            <div>
              <Label htmlFor="item-price">Price ($)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
            </div>
            <Button onClick={addItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="space-y-2">
              <Label>Items ({items.length})</Label>
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${Number(item.price || 0).toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Badge variant="secondary">{item.quantity}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <Badge variant="outline">
                        Total: ${(item.price * item.quantity).toFixed(2)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Total and Actions */}
          {items.length > 0 && (
            <div className="space-y-3 pt-3 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>${getTotalAmount().toFixed(2)}</span>
              </div>
              <Button 
                onClick={processSale} 
                className="w-full" 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
