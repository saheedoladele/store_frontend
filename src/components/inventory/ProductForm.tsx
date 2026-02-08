import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { VariantForm } from "./VariantForm";
import { Product, Category, ProductVariant } from "@/types/inventory";
import { inventoryApi } from "@/lib/api/inventory.api";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories?: Category[];
  onSaved?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  product,
  categories: propCategories = [],
  onSaved,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>(propCategories);
  const { toast } = useToast();

  // Initialize categories from props
  useEffect(() => {
    if (propCategories.length > 0) {
      setCategories(propCategories);
    }
  }, [propCategories.length]); // Only depend on length to avoid infinite loops

  // Fetch categories when dialog opens (only once per open)
  useEffect(() => {
    if (!open) return; // Don't fetch when dialog is closed
    
    // If we have categories from props, use them
    if (propCategories.length > 0) {
      setCategories(propCategories);
      return;
    }

    // Otherwise fetch categories (only once when dialog opens)
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await inventoryApi.getCategories();
        if (isMounted && response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false; // Cleanup to prevent state updates after unmount
    };
  }, [open]); // Only depend on open state

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    category_id: "",
    price: "",
    cost: "",
    stock_quantity: "",
    min_stock_level: "",
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [originalVariantIds, setOriginalVariantIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        sku: product.sku,
        barcode: product.barcode || "",
        category_id: product.category_id || "",
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock_quantity: product.stock_quantity.toString(),
        min_stock_level: product.min_stock_level.toString(),
      });
      const productVariants = product.variants || [];
      setVariants(productVariants);
      // Store original variant IDs to distinguish existing vs new variants
      setOriginalVariantIds(new Set(productVariants.map(v => v.id)));
    } else {
      setFormData({
        name: "",
        description: "",
        sku: "",
        barcode: "",
        category_id: "",
        price: "",
        cost: "",
        stock_quantity: "",
        min_stock_level: "",
      });
      setVariants([]);
      setOriginalVariantIds(new Set());
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.sku.trim() || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Helper function to check if a string is a valid UUID
      const isValidUUID = (str: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };

      // Prepare variants: only include id for variants that existed in the original product
      const preparedVariants = variants.length > 0 
        ? variants.map(variant => {
            // Only include id if this variant was in the original product (exists in database)
            const isExistingVariant = variant.id && isValidUUID(variant.id) && originalVariantIds.has(variant.id);
            
            if (isExistingVariant) {
              // Existing variant - include id for update
              return {
                id: variant.id,
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                cost: variant.cost || 0,
                stock_quantity: variant.stock_quantity || 0,
                attributes: variant.attributes || {}
              };
            } else {
              // New variant - exclude id, backend will generate it
              return {
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                cost: variant.cost || 0,
                stock_quantity: variant.stock_quantity || 0,
                attributes: variant.attributes || {}
              };
            }
          })
        : undefined;

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || undefined,
        category_id: formData.category_id || undefined,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        min_stock_level: formData.min_stock_level ? parseInt(formData.min_stock_level) : 0,
        variants: preparedVariants,
      };

      const response = product
        ? await inventoryApi.updateProduct(product.id, productData)
        : await inventoryApi.createProduct(productData);

      if (response.success) {
        toast({
          title: product ? "Product Updated!" : "Product Added!",
          description: `${formData.name} has been ${
            product ? "updated" : "added"
          } successfully`,
          variant: "success",
        });
        onSaved?.();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to save product",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update product information"
              : "Add a new product to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="e.g., High-quality product with premium features, durable design, perfect for everyday use..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Suggestions: Describe the product's features, specifications, materials, dimensions, or any important details that help customers understand the product better.
                </p>
              </div>

              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    handleInputChange("category_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Selling Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost Price ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">Current Stock</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      handleInputChange("stock_quantity", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="min_stock_level">Min Stock Level</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    value={formData.min_stock_level}
                    onChange={(e) =>
                      handleInputChange("min_stock_level", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <VariantForm variants={variants} onVariantsChange={setVariants} />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : product
                ? "Update Product"
                : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
