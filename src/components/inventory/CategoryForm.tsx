import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { inventoryApi } from '@/lib/api/inventory.api';
import { Loader2 } from 'lucide-react';
import type { Category } from '@/types/inventory';

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  categories: Category[];
  onSaved?: () => void;
}

export function CategoryForm({ open, onOpenChange, category, categories, onSaved }: CategoryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: 'none',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || 'none',
      });
    } else {
      setFormData({
        name: '',
        description: '',
    parent_id: 'none',
      });
    }
  }, [category]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Handle parent_id conversion (none = no parent)
      const parentId = formData.parent_id === 'none' ? undefined : formData.parent_id;
      
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }

      const categoryData: Partial<Category> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parent_id: parentId,
      };

      let response;
      if (category) {
        // Update existing category
        response = await inventoryApi.updateCategory(category.id, categoryData);
      } else {
        // Create new category
        response = await inventoryApi.createCategory(categoryData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Category ${category ? 'updated' : 'created'} successfully`,
          variant: "success",
        });

        onOpenChange(false);
        if (onSaved) {
          onSaved();
        }
      } else {
        throw new Error(response.error?.message || `Failed to ${category ? 'update' : 'create'} category`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out the current category from parent options to prevent circular reference
  const parentOptions = categories.filter(cat => 
    !category || cat.id !== category.id
  ).filter(cat => !cat.parent_id); // Only show top-level categories as parent options

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter category name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Electronic devices and accessories, Mobile phones and smartphones, Apparel and fashion items..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              💡 Suggestions: Describe what products belong to this category, its purpose, or any specific characteristics.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent Category</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => handleInputChange('parent_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent</SelectItem>
                {parentOptions.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}