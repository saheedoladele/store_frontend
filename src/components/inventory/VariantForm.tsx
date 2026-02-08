import React, { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { ProductVariant } from '@/types/inventory';

interface VariantFormProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
}

export function VariantForm({ variants, onVariantsChange }: VariantFormProps) {
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantData, setVariantData] = useState({
    name: '',
    sku: '',
    price: '',
    stock_quantity: '',
    attributes: {} as { [key: string]: string }
  });

  const [newAttribute, setNewAttribute] = useState({ key: '', value: '' });

  const handleAddVariant = () => {
    setEditingVariant(null);
    setVariantData({
      name: '',
      sku: '',
      price: '',
      stock_quantity: '',
      attributes: {}
    });
    setShowVariantDialog(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantData({
      name: variant.name,
      sku: variant.sku,
      price: variant.price.toString(),
      stock_quantity: variant.stock_quantity.toString(),
      attributes: { ...variant.attributes }
    });
    setShowVariantDialog(true);
  };

  const handleDeleteVariant = (variantId: string) => {
    const updatedVariants = variants.filter(v => v.id !== variantId);
    onVariantsChange(updatedVariants);
  };

  const handleSaveVariant = () => {
    if (!variantData.name || !variantData.sku || !variantData.price) {
      return;
    }

    // Generate a temporary ID for new variants (using crypto.randomUUID if available, otherwise a simple UUID-like string)
    const generateTempId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback: generate a UUID-like string
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const variant: ProductVariant = {
      id: editingVariant?.id || generateTempId(),
      product_id: editingVariant?.product_id || '', // Will be set by parent component
      name: variantData.name,
      sku: variantData.sku,
      price: parseFloat(variantData.price),
      stock_quantity: parseInt(variantData.stock_quantity) || 0,
      attributes: variantData.attributes
    };

    let updatedVariants;
    if (editingVariant) {
      updatedVariants = variants.map(v => v.id === editingVariant.id ? variant : v);
    } else {
      updatedVariants = [...variants, variant];
    }

    onVariantsChange(updatedVariants);
    setShowVariantDialog(false);
  };

  const handleAddAttribute = () => {
    if (newAttribute.key && newAttribute.value) {
      setVariantData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [newAttribute.key]: newAttribute.value
        }
      }));
      setNewAttribute({ key: '', value: '' });
    }
  };

  const handleRemoveAttribute = (key: string) => {
    setVariantData(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return {
        ...prev,
        attributes: newAttributes
      };
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Product Variants</CardTitle>
            <Button 
              type="button"
              onClick={handleAddVariant} 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No variants added yet. Click "Add Variant" to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{variant.name}</span>
                      <Badge variant="secondary">{variant.sku}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ${variant.price}
                      </span>
                    </div>
                    <div className="flex space-x-2 mt-1">
                      {Object.entries(variant.attributes).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVariant(variant)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant-name">Variant Name *</Label>
                <Input
                  id="variant-name"
                  value={variantData.name}
                  onChange={(e) => setVariantData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Red, Large, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-sku">SKU *</Label>
                <Input
                  id="variant-sku"
                  value={variantData.sku}
                  onChange={(e) => setVariantData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Variant SKU"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant-price">Price *</Label>
                <Input
                  id="variant-price"
                  type="number"
                  step="0.01"
                  value={variantData.price}
                  onChange={(e) => setVariantData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-stock">Stock Quantity</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  value={variantData.stock_quantity}
                  onChange={(e) => setVariantData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Attributes</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Attribute name (e.g., Color)"
                  value={newAttribute.key}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, key: e.target.value }))}
                />
                <Input
                  placeholder="Attribute value (e.g., Red)"
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                />
                <Button 
                  type="button"
                  onClick={handleAddAttribute} 
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {Object.entries(variantData.attributes).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(variantData.attributes).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="flex items-center space-x-1">
                      <span>{key}: {value}</span>
                      <button
                        onClick={() => handleRemoveAttribute(key)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVariantDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleSaveVariant}
              >
                {editingVariant ? 'Update' : 'Add'} Variant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}