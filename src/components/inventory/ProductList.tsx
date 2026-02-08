import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Edit, Eye, AlertTriangle, Trash2 } from 'lucide-react';
import { Product } from '@/types/inventory';

interface ProductListProps {
  products: Product[];
  searchTerm: string;
  onEditProduct: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, searchTerm, onEditProduct, onDeleteProduct }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products ({filteredProducts.length})</CardTitle>
        <CardDescription>Manage your product inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No products found matching your search.' : 'No products in inventory.'}
            </div>
          ) : (
            paginatedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{product.name}</h3>
                    {product.stock_quantity <= product.min_stock_level && (
                      <Badge variant="destructive" className="flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                    {!product.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    SKU: {product.sku} | Stock: {product.stock_quantity} units
                  </p>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">${Number(product.price || 0).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Cost: ${Number(product.cost || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onDeleteProduct && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onDeleteProduct(product)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
