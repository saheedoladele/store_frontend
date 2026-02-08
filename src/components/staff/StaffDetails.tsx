import React, { useState } from 'react';
import { Staff, StaffFormData } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StaffForm } from './StaffForm';
import { staffApi } from '@/lib/api/staff.api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Mail, Phone, MapPin, Calendar, DollarSign, TrendingUp, Clock, Trash2 } from 'lucide-react';

interface StaffDetailsProps {
  staff: Staff;
  onClose: () => void;
  onUpdate?: () => void;
}

// Mock performance data
const mockPerformance = [
  {
    period: '2024-01',
    sales_count: 45,
    sales_total: 12500.00,
    customer_satisfaction: 4.8,
    attendance_rate: 98,
    performance_score: 92
  },
  {
    period: '2023-12',
    sales_count: 38,
    sales_total: 10200.00,
    customer_satisfaction: 4.6,
    attendance_rate: 95,
    performance_score: 88
  },
];

export const StaffDetails: React.FC<StaffDetailsProps> = ({ staff, onClose, onUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleEditStaff = async (staffData: StaffFormData) => {
    try {
      const response = await staffApi.updateStaff(staff.id, staffData);
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Staff member updated successfully",
          variant: "success",
        });
        setIsEditModalOpen(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to update staff member",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStaff = async () => {
    setIsDeleting(true);
    try {
      const response = await staffApi.deleteStaff(staff.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
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
          description: response.error?.message || "Failed to delete staff member",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'cashier': return 'bg-blue-100 text-blue-800';
      case 'inventory_clerk': return 'bg-green-100 text-green-800';
      case 'sales_associate': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{staff.name}</h2>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>{staff.email}</span>
            </div>
            {staff.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{staff.phone}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getRoleBadgeColor(staff.role)}>
              {staff.role.replace('_', ' ')}
            </Badge>
            <Badge className={getStatusBadgeColor(staff.status)}>
              {staff.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Staff
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

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hire Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(staff.hire_date).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.floor((Date.now() - new Date(staff.hire_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.salary ? `$${Number(staff.salary || 0).toLocaleString()}` : 'N/A'}
            </div>
            {staff.commission_rate && (
              <p className="text-xs text-muted-foreground">
                {Number(staff.commission_rate || 0)}% commission
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.last_login ? new Date(staff.last_login).toLocaleDateString() : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Details Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
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
                  <p className="text-sm text-muted-foreground">{staff.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">{staff.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <p className="text-sm text-muted-foreground">{staff.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <p className="text-sm text-muted-foreground">{staff.department || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Hire Date</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(staff.hire_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {staff.address && (
                <div>
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Address</span>
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {staff.address}
                    {staff.city && `, ${staff.city}`}
                    {staff.postal_code && ` ${staff.postal_code}`}
                  </p>
                </div>
              )}

              {staff.emergency_contact && (
                <div>
                  <label className="text-sm font-medium">Emergency Contact</label>
                  <p className="text-sm text-muted-foreground">
                    {staff.emergency_contact.name} ({staff.emergency_contact.relationship})
                    <br />
                    {staff.emergency_contact.phone}
                    {staff.emergency_contact.email && ` - ${staff.emergency_contact.email}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Sales Count</TableHead>
                    <TableHead>Sales Total</TableHead>
                    <TableHead>Customer Satisfaction</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Performance Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPerformance.map((performance) => (
                    <TableRow key={performance.period}>
                      <TableCell>{performance.period}</TableCell>
                      <TableCell>{performance.sales_count}</TableCell>
                      <TableCell>${performance.sales_total.toFixed(2)}</TableCell>
                      <TableCell>{performance.customer_satisfaction}/5.0</TableCell>
                      <TableCell>{performance.attendance_rate}%</TableCell>
                      <TableCell>
                        <Badge variant={performance.performance_score >= 90 ? 'default' : 'secondary'}>
                          {performance.performance_score}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Point of Sale</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Process Sales</span>
                        <Badge variant="default">Granted</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Refunds</span>
                        <Badge variant={staff.role === 'manager' ? 'default' : 'secondary'}>
                          {staff.role === 'manager' ? 'Granted' : 'Denied'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Inventory</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Products</span>
                        <Badge variant="default">Granted</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Manage Products</span>
                        <Badge variant={staff.role === 'manager' || staff.role === 'inventory_clerk' ? 'default' : 'secondary'}>
                          {staff.role === 'manager' || staff.role === 'inventory_clerk' ? 'Granted' : 'Denied'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Customers</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Customers</span>
                        <Badge variant="default">Granted</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Edit Customers</span>
                        <Badge variant={staff.role === 'manager' ? 'default' : 'secondary'}>
                          {staff.role === 'manager' ? 'Granted' : 'Denied'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Reports</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Reports</span>
                        <Badge variant={staff.role === 'manager' ? 'default' : 'secondary'}>
                          {staff.role === 'manager' ? 'Granted' : 'Denied'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Export Data</span>
                        <Badge variant={staff.role === 'manager' ? 'default' : 'secondary'}>
                          {staff.role === 'manager' ? 'Granted' : 'Denied'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Staff Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <StaffForm 
            onSubmit={handleEditStaff} 
            initialData={{
              name: staff.name,
              email: staff.email,
              phone: staff.phone,
              role: staff.role,
              department: staff.department,
              hire_date: staff.hire_date,
              salary: staff.salary,
              commission_rate: staff.commission_rate,
              address: staff.address,
              city: staff.city,
              postal_code: staff.postal_code
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
              This action cannot be undone. This will permanently delete the staff member
              "{staff.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
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