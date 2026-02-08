import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scan, Loader2 } from 'lucide-react';
import { Product } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

interface ProductScannerProps {
  onProductScanned: (product: Product) => void;
  products: Product[];
}

export const ProductScanner: React.FC<ProductScannerProps> = ({ onProductScanned, products }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!barcode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a barcode",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    
    // Simulate barcode lookup delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Search for product by barcode
    const foundProduct = products.find(
      (product) => product.barcode && product.barcode.toLowerCase() === barcode.trim().toLowerCase()
    );

    if (!foundProduct) {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode: ${barcode}`,
        variant: "destructive"
      });
      setIsScanning(false);
      return;
    }

    onProductScanned(foundProduct);
    setBarcode('');
    setIsScanning(false);

    toast({
      title: "Product Found!",
      description: `${foundProduct.name} added to cart`,
      variant: "success",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Barcode Scanner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            placeholder="Scan or enter barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scan className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};