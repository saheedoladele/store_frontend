import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Search,
  ArrowLeftRight,
  RefreshCw,
  Package,
} from "lucide-react";
import { Sale, SaleItem } from "@/types/pos";
import { Product } from "@/types/inventory";
import { posApi } from "@/lib/api/pos.api";
import { inventoryApi } from "@/lib/api/inventory.api";
import { returnsApi } from "@/lib/api/returns.api";
import { useToast } from "@/hooks/use-toast";
import { CreateReturnFormData } from "@/types/returns";

interface ReturnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnCreated: () => void;
}

interface SelectedReturnItem {
  sale_item_id: string;
  quantity: number;
  max_quantity: number;
  exchange_product_id?: string;
  exchange_variant_id?: string;
  exchange_quantity?: number;
}

export const ReturnForm: React.FC<ReturnFormProps> = ({
  open,
  onOpenChange,
  onReturnCreated,
}) => {
  const [saleSearchTerm, setSaleSearchTerm] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [returnType, setReturnType] = useState<"full_return" | "partial_return" | "exchange">("full_return");
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedReturnItem>>(new Map());
  const [refundMethod, setRefundMethod] = useState<"cash" | "card" | "digital_wallet" | "store_credit">("cash");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSales();
      if (returnType === "exchange") {
        fetchProducts();
      }
    } else {
      // Reset form when modal closes
      setSelectedSale(null);
      setSelectedItems(new Map());
      setSaleSearchTerm("");
      setReturnType("full_return");
      setReason("");
      setNotes("");
    }
  }, [open, returnType]);

  const fetchSales = async () => {
    setIsLoadingSales(true);
    try {
      const response = await posApi.getSales();
      if (response.success && response.data) {
        setSales(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setIsLoadingSales(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await inventoryApi.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSaleSelect = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (sale) {
      setSelectedSale(sale);
      if (returnType === "full_return") {
        // Auto-select all items for full return
        const items = new Map<string, SelectedReturnItem>();
        sale.items?.forEach((item) => {
          items.set(item.id, {
            sale_item_id: item.id,
            quantity: item.quantity,
            max_quantity: item.quantity,
          });
        });
        setSelectedItems(items);
      } else {
        setSelectedItems(new Map());
      }
    }
  };

  const handleItemToggle = (item: SaleItem, checked: boolean) => {
    const newSelectedItems = new Map(selectedItems);
    if (checked) {
      newSelectedItems.set(item.id, {
        sale_item_id: item.id,
        quantity: item.quantity,
        max_quantity: item.quantity,
      });
    } else {
      newSelectedItems.delete(item.id);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const item = selectedItems.get(itemId);
    if (item) {
      const maxQty = item.max_quantity;
      const newQty = Math.min(Math.max(1, quantity), maxQty);
      setSelectedItems(
        new Map(selectedItems).set(itemId, {
          ...item,
          quantity: newQty,
        })
      );
    }
  };

  const handleExchangeProductSelect = (itemId: string, productId: string) => {
    const item = selectedItems.get(itemId);
    if (item) {
      setSelectedItems(
        new Map(selectedItems).set(itemId, {
          ...item,
          exchange_product_id: productId,
          exchange_variant_id: undefined,
          exchange_quantity: item.quantity,
        })
      );
    }
  };

  const handleExchangeQuantityChange = (itemId: string, quantity: number) => {
    const item = selectedItems.get(itemId);
    if (item) {
      setSelectedItems(
        new Map(selectedItems).set(itemId, {
          ...item,
          exchange_quantity: Math.max(1, quantity),
        })
      );
    }
  };

  const calculateRefundAmount = (): number => {
    if (!selectedSale) return 0;
    let total = 0;
    selectedItems.forEach((selectedItem) => {
      const saleItem = selectedSale.items?.find((item) => item.id === selectedItem.sale_item_id);
      if (saleItem) {
        total += Number(saleItem.unit_price || 0) * selectedItem.quantity;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (!selectedSale) {
      toast({
        title: "Error",
        description: "Please select a sale",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item to return",
        variant: "destructive",
      });
      return;
    }

    // Validate exchange products
    if (returnType === "exchange") {
      for (const [itemId, selectedItem] of selectedItems.entries()) {
        if (!selectedItem.exchange_product_id) {
          toast({
            title: "Error",
            description: "Please select exchange products for all returned items",
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const returnData: CreateReturnFormData = {
        sale_id: selectedSale.id,
        type: returnType,
        items: Array.from(selectedItems.values()),
        refund_method: refundMethod,
        reason: reason || undefined,
        notes: notes || undefined,
      };

      const response = await returnsApi.createReturn(returnData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Return created successfully",
          variant: "success",
        });
        onReturnCreated();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to create return",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create return",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const searchLower = saleSearchTerm.toLowerCase();
    return (
      sale.id.toLowerCase().includes(searchLower) ||
      (sale.customer?.name && sale.customer.name.toLowerCase().includes(searchLower)) ||
      sale.created_at.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Return</DialogTitle>
          <DialogDescription>
            Process a customer return, partial return, or exchange
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Return Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Return Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={returnType === "full_return" ? "default" : "outline"}
                onClick={() => {
                  setReturnType("full_return");
                  if (selectedSale) {
                    const items = new Map<string, SelectedReturnItem>();
                    selectedSale.items?.forEach((item) => {
                      items.set(item.id, {
                        sale_item_id: item.id,
                        quantity: item.quantity,
                        max_quantity: item.quantity,
                      });
                    });
                    setSelectedItems(items);
                  }
                }}
                className="flex flex-col items-center p-3 h-auto"
              >
                <RefreshCw className="h-4 w-4 mb-1" />
                <span className="text-xs">Full Return</span>
              </Button>
              <Button
                variant={returnType === "partial_return" ? "default" : "outline"}
                onClick={() => {
                  setReturnType("partial_return");
                  setSelectedItems(new Map());
                }}
                className="flex flex-col items-center p-3 h-auto"
              >
                <Package className="h-4 w-4 mb-1" />
                <span className="text-xs">Partial Return</span>
              </Button>
              <Button
                variant={returnType === "exchange" ? "default" : "outline"}
                onClick={() => {
                  setReturnType("exchange");
                  setSelectedItems(new Map());
                  if (products.length === 0) {
                    fetchProducts();
                  }
                }}
                className="flex flex-col items-center p-3 h-auto"
              >
                <ArrowLeftRight className="h-4 w-4 mb-1" />
                <span className="text-xs">Exchange</span>
              </Button>
            </div>
          </div>

          {/* Sale Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Select Sale</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by sale ID, customer name, or date..."
                value={saleSearchTerm}
                onChange={(e) => setSaleSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {!selectedSale && (
              <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg">
                {isLoadingSales ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No sales found
                  </div>
                ) : (
                  filteredSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 border-b cursor-pointer hover:bg-muted"
                      onClick={() => handleSaleSelect(sale.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">
                            {sale.customer?.name || "Walk-in Customer"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sale ID: {sale.id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${Number(sale.total_amount || 0).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {selectedSale && (
              <Card className="mt-2">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">Selected Sale</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSale(null);
                        setSelectedItems(new Map());
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">
                        {selectedSale.customer?.name || "Walk-in Customer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-medium">${Number(selectedSale.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(selectedSale.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-medium">{selectedSale.items?.length || 0} items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Items Selection */}
          {selectedSale && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {returnType === "full_return"
                  ? "Items to Return (All Selected)"
                  : returnType === "partial_return"
                  ? "Select Items to Return"
                  : "Select Items to Exchange"}
              </Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {returnType !== "full_return" && <TableHead className="w-12"></TableHead>}
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Sold Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      {returnType !== "full_return" && (
                        <TableHead className="text-right">Return Qty</TableHead>
                      )}
                      {returnType === "exchange" && (
                        <>
                          <TableHead>Exchange Product</TableHead>
                          <TableHead className="text-right">Exchange Qty</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items?.map((item) => {
                      const isSelected = selectedItems.has(item.id);
                      const selectedItem = selectedItems.get(item.id);
                      return (
                        <TableRow key={item.id}>
                          {returnType !== "full_return" && (
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  handleItemToggle(item, checked as boolean)
                                }
                              />
                            </TableCell>
                          )}
                          <TableCell className="font-medium">
                            {item.product?.name || "Product"}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${Number(item.unit_price || 0).toFixed(2)}
                          </TableCell>
                          {returnType !== "full_return" && (
                            <TableCell className="text-right">
                              {isSelected ? (
                                <Input
                                  type="number"
                                  min={1}
                                  max={item.quantity}
                                  value={selectedItem?.quantity || 1}
                                  onChange={(e) =>
                                    handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                                  }
                                  className="w-20 ml-auto"
                                />
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          )}
                          {returnType === "exchange" && (
                            <>
                              <TableCell>
                                {isSelected ? (
                                  <Select
                                    value={selectedItem?.exchange_product_id || ""}
                                    onValueChange={(value) =>
                                      handleExchangeProductSelect(item.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {products
                                        .filter((p) => p.id !== item.product_id)
                                        .map((product) => (
                                          <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {isSelected && selectedItem?.exchange_product_id ? (
                                  <Input
                                    type="number"
                                    min={1}
                                    value={selectedItem?.exchange_quantity || selectedItem?.quantity || 1}
                                    onChange={(e) =>
                                      handleExchangeQuantityChange(
                                        item.id,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-20 ml-auto"
                                  />
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Refund Details */}
          {selectedSale && selectedItems.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Refund Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refund Amount</span>
                  <span className="font-bold text-lg">${calculateRefundAmount().toFixed(2)}</span>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Refund Method</Label>
                  <Select value={refundMethod} onValueChange={(value: any) => setRefundMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                      <SelectItem value="store_credit">Store Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Reason (Optional)</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for return..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Notes (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedSale || selectedItems.size === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create Return"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
