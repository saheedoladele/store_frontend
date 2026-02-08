import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, X, Trash2 } from 'lucide-react';
import { CartItem } from '@/types/pos';

interface POSCartProps {
  cart: CartItem[];
  onUpdateItem: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const POSCart: React.FC<POSCartProps> = ({ 
  cart, 
  onUpdateItem, 
  onRemoveItem, 
  onClearCart 
}) => {
  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Cart</CardTitle>
            <CardDescription>{cart.length} items</CardDescription>
          </div>
          {cart.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClearCart}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-4">
              Cart is empty. Add products to get started.
            </div>
          ) : (
            <div className="space-y-2 px-4 pb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.product_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${Number(item.price || 0).toFixed(2)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateItem(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Badge variant="secondary" className="min-w-[2rem] text-center">
                        {item.quantity}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateItem(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-right min-w-[3rem]">
                      <p className="font-medium text-sm">${Number(item.total || 0).toFixed(2)}</p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
