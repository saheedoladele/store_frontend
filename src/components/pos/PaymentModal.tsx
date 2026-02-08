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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  Loader2,
  User,
  X,
  Search,
} from "lucide-react";
import { CartItem, Sale } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";
import { posApi } from "@/lib/api/pos.api";
import { customersApi } from "@/lib/api/customers.api";
import { Customer } from "@/types/customer";
import { InvoicePrintModal } from "./InvoicePrintModal";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  total: number;
  onPaymentComplete: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  cart,
  total,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "mobile"
  >("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async (search?: string) => {
    setIsLoadingCustomers(true);
    try {
      const response = await customersApi.getCustomers(search);
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      // Silently fail - customer selection is optional
      console.error("Failed to fetch customers:", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Fetch customers when modal opens
  useEffect(() => {
    if (open) {
      fetchCustomers();
    } else {
      // Reset customer selection when modal closes
      setSelectedCustomerId("");
      setCustomerSearchTerm("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounced customer search
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => {
      fetchCustomers(customerSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerSearchTerm, open]);

  const change = parseFloat(cashReceived) - total;

  const handlePayment = async () => {
    if (paymentMethod === "cash" && parseFloat(cashReceived) < total) {
      toast({
        title: "Insufficient Payment",
        description: "Cash received is less than the total amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Map payment method to backend enum
      const backendPaymentMethod = 
        paymentMethod === "mobile" ? "digital_wallet" : paymentMethod;

      // Prepare sale data
      const saleData = {
        ...(selectedCustomerId && { customer_id: selectedCustomerId }),
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        payment_method: backendPaymentMethod as "cash" | "card" | "digital_wallet" | "store_credit",
      };

      const response = await posApi.createSale(saleData);

      if (response.success && response.data) {
        toast({
          title: "Payment Successful!",
          description: `Sale completed for $${total.toFixed(2)}`,
          variant: "success",
        });
        
        // Set the completed sale and show invoice
        setCompletedSale(response.data);
        setShowInvoice(true);
        
        // Close payment modal
        onOpenChange(false);
        setCashReceived("");
        setSelectedCustomerId("");
        setCustomerSearchTerm("");
        
        // Call payment complete callback
        onPaymentComplete();
      } else {
        toast({
          title: "Payment Failed",
          description: response.error?.message || "Failed to process payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "An error occurred while processing payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: Banknote },
    { id: "card", label: "Card", icon: CreditCard },
    { id: "mobile", label: "Mobile Pay", icon: Smartphone },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>Complete the sale transaction</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Customer (Optional)
            </Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              {selectedCustomerId && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {customers.find(c => c.id === selectedCustomerId)?.name || "Selected Customer"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomerId("");
                      setCustomerSearchTerm("");
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {!selectedCustomerId && !isLoadingCustomers && customers.length > 0 && (
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer or skip for walk-in" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
                          {(customer.email || customer.phone) && (
                            <span className="text-xs text-muted-foreground">
                              {customer.email || customer.phone}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!selectedCustomerId && isLoadingCustomers && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading customers...</span>
                </div>
              )}
              {!selectedCustomerId && !isLoadingCustomers && customerSearchTerm && customers.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No customers found. Sale will be recorded as walk-in customer.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for walk-in customers
            </p>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product_name} x{item.quantity}
                  </span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div>
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod(method.id)}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <method.icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{method.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === "cash" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="cash-received">Cash Received</Label>
                <Input
                  id="cash-received"
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {cashReceived && parseFloat(cashReceived) >= total && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <Badge variant="outline" className="font-medium">
                      ${change.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={
                isProcessing ||
                (paymentMethod === "cash" && parseFloat(cashReceived) < total)
              }
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Sale"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        open={showInvoice}
        onOpenChange={(open) => {
          setShowInvoice(open);
          if (!open) {
            setCompletedSale(null);
          }
        }}
        sale={completedSale}
      />
    </Dialog>
  );
};
