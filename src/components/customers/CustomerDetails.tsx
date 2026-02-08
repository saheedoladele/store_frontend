import React, { useState, useEffect } from "react";
import { Customer, CustomerFormData } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerForm } from "./CustomerForm";
import { customersApi } from "@/lib/api/customers.api";
import { posApi } from "@/lib/api/pos.api";
import { Sale } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Mail, Phone, MapPin, Calendar, Star, ShoppingBag, CreditCard, Trash2 } from "lucide-react";

interface CustomerDetailsProps {
  customer: Customer;
  onClose: () => void;
  onUpdate?: () => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  onClose,
  onUpdate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerSales = async () => {
      setIsLoadingSales(true);
      try {
        const response = await posApi.getSales();
        if (response.success && response.data) {
          // Filter sales for this customer
          const customerSales = response.data.filter(
            (sale: Sale) => sale.customer_id === customer.id
          );
          setSales(customerSales);
        }
      } catch (error) {
        console.error("Failed to fetch customer sales:", error);
      } finally {
        setIsLoadingSales(false);
      }
    };

    fetchCustomerSales();
  }, [customer.id]);

  const handleEditCustomer = async (customerData: CustomerFormData) => {
    try {
      const response = await customersApi.updateCustomer(customer.id, customerData);
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Customer updated successfully",
          variant: "success",
        });
        setIsEditModalOpen(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to update customer",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async () => {
    setIsDeleting(true);
    try {
      const response = await customersApi.deleteCustomer(customer.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Customer deleted successfully",
          variant: "success",
        });
        setIsDeleteDialogOpen(false);
        if (onUpdate) {
          onUpdate();
        }
        onClose();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to delete customer",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete customer. Customer may have associated sales.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getMembershipBadgeColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-100 text-purple-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "silver":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {customer.email && (
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
          <Badge className={getMembershipBadgeColor(customer.membership_tier)}>
            {customer.membership_tier} Member
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Customer
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.total_purchases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(customer.total_spent || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Loyalty Points
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.loyalty_points}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.last_visit
                ? new Date(customer.last_visit).toLocaleDateString()
                : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-sm text-muted-foreground">
                    {customer.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    {customer.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">
                    {customer.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Member Since</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {customer.address && (
                <div>
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Address</span>
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {customer.address}
                    {customer.city && `, ${customer.city}`}
                    {customer.postal_code && ` ${customer.postal_code}`}
                  </p>
                </div>
              )}

              {customer.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-muted-foreground">
                    {customer.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSales ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading sales...</span>
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No purchase history available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {new Date(sale.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{sale.items?.length || 0}</TableCell>
                        <TableCell>${Number(sale.total_amount || 0).toFixed(2)}</TableCell>
                        <TableCell className="capitalize">
                          {sale.payment_method.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sale.status === "completed"
                                ? "default"
                                : sale.status === "refunded"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {sale.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {customer.loyalty_points}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current Points
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {customer.membership_tier}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Membership Tier
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {1000 - customer.loyalty_points}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Points to Next Tier
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Platinum</span>
                  <span>
                    {Math.round((customer.loyalty_points / 1000) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(customer.loyalty_points / 1000) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleEditCustomer}
            initialData={{
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              postal_code: customer.postal_code,
              notes: customer.notes,
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              "{customer.name}". If the customer has associated sales, this action will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
