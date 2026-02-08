import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Search,
  Save,
  Shield,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Staff } from "@/types/staff";
import { staffApi } from "@/lib/api/staff.api";
import { permissionsApi } from "@/lib/api/permissions.api";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSION_GROUPS, PERMISSIONS } from "@/constants/permissions";
import { Separator } from "@/components/ui/separator";

const Permissions: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Staff | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { canManagePermissions } = usePermissions();

  useEffect(() => {
    if (canManagePermissions()) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const staffResponse = await staffApi.getStaff();

      if (staffResponse.success && staffResponse.data) {
        setStaff(staffResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPermissions = async (member: Staff) => {
    setSelectedMember(member);
    try {
      const response = await permissionsApi.getStaffPermissions(member.id);

      if (response.success && response.data) {
        setSelectedPermissions(response.data || []);
      } else {
        setSelectedPermissions(member.permissions || []);
      }
    } catch (error) {
      setSelectedPermissions(member.permissions || []);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedMember) return;

    setIsSaving(true);
    try {
      const response = await permissionsApi.updateStaffPermissions(selectedMember.id, {
        permissions: selectedPermissions,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Permissions updated successfully",
          variant: "success",
        });
        setSelectedMember(null);
        fetchData();
      } else {
        throw new Error("Failed to update permissions");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update permissions",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleToggleGroup = (groupKey: string) => {
    const group = PERMISSION_GROUPS[groupKey as keyof typeof PERMISSION_GROUPS];
    if (!group) return;

    const allGroupPermissionsSelected = group.permissions.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allGroupPermissionsSelected) {
      // Remove all permissions from this group
      setSelectedPermissions((prev) =>
        prev.filter((p) => !group.permissions.includes(p))
      );
    } else {
      // Add all permissions from this group
      setSelectedPermissions((prev) => {
        const newPermissions = [...prev];
        group.permissions.forEach((p) => {
          if (!newPermissions.includes(p)) {
            newPermissions.push(p);
          }
        });
        return newPermissions;
      });
    }
  };

  const filteredMembers = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canManagePermissions()) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You don't have permission to manage permissions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Permissions Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage access and permissions for staff members
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>
                  Select a staff member to manage their permissions
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Loading staff...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No staff members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.status === "active" ? "default" : "secondary"
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(member.permissions || []).length} permissions
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPermissions(member)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Drawer */}
      {selectedMember && (
        <Sheet open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[700px] flex flex-col">
            <SheetHeader>
              <SheetTitle>
                Manage Permissions - {selectedMember.name}
              </SheetTitle>
              <SheetDescription>
                Select the pages and actions this user can access
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6 flex-1 overflow-y-auto pr-2">
                {/* Reorder groups to show requested pages first */}
                {Object.entries(PERMISSION_GROUPS)
                  .sort(([a], [b]) => {
                    // Priority order: transactions, billing, customers, staff, returns, reports first
                    const priority = ['transactions', 'billing', 'customers', 'staff', 'returns', 'reports'];
                    const aIndex = priority.indexOf(a);
                    const bIndex = priority.indexOf(b);
                    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    return 0;
                  })
                  .map(([groupKey, group]) => {
                    const allSelected = group.permissions.every((p) =>
                      selectedPermissions.includes(p)
                    );
                    const someSelected = group.permissions.some((p) =>
                      selectedPermissions.includes(p)
                    );

                  return (
                    <div key={groupKey} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${groupKey}`}
                          checked={allSelected}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = someSelected && !allSelected;
                            }
                          }}
                          onCheckedChange={() => handleToggleGroup(groupKey)}
                        />
                        <Label
                          htmlFor={`group-${groupKey}`}
                          className="text-sm font-semibold cursor-pointer"
                        >
                          {group.label}
                        </Label>
                      </div>
                      <div className="ml-6 space-y-2">
                        {group.permissions.map((permission) => {
                          const permissionKey = Object.keys(PERMISSIONS).find(
                            (key) => PERMISSIONS[key as keyof typeof PERMISSIONS] === permission
                          );
                          
                          // Create more user-friendly labels
                          let permissionLabel = permissionKey
                            ? permissionKey
                                .replace(/_/g, " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                            : permission;

                          // Improve specific permission labels
                          const labelMap: Record<string, string> = {
                            "Dashboard View": "View Dashboard",
                            "Pos View": "View POS",
                            "Pos Create Sale": "Create Sales",
                            "Pos View Sales": "View Sales History",
                            "Pos Cancel Sale": "Cancel Sales",
                            "Pos Refund": "Process Refunds",
                            "Inventory View": "View Inventory",
                            "Inventory View Products": "View Products",
                            "Inventory Create Product": "Create Products",
                            "Inventory Edit Product": "Edit Products",
                            "Inventory Delete Product": "Delete Products",
                            "Inventory Manage Stock": "Manage Stock Levels",
                            "Categories View": "View Categories",
                            "Categories Create": "Create Categories",
                            "Categories Edit": "Edit Categories",
                            "Categories Delete": "Delete Categories",
                            "Customers View": "View Customers",
                            "Customers Create": "Create Customers",
                            "Customers Edit": "Edit Customers",
                            "Customers Delete": "Delete Customers",
                            "Customers View Details": "View Customer Details",
                            "Staff View": "View Staff",
                            "Staff Create": "Create Staff",
                            "Staff Edit": "Edit Staff",
                            "Staff Delete": "Delete Staff",
                            "Staff View Details": "View Staff Details",
                            "Staff Manage Permissions": "Manage Permissions",
                            "Reports View": "View Reports",
                            "Reports View Sales": "View Sales Reports",
                            "Reports View Analytics": "View Analytics",
                            "Reports Export": "Export Reports",
                            "Billing View": "View Billing",
                            "Billing View Invoices": "View Invoices",
                            "Billing Download Invoices": "Download Invoices",
                            "Returns View": "View Returns",
                            "Returns Create": "Create Returns",
                            "Returns Approve": "Approve Returns",
                            "Returns Reject": "Reject Returns",
                            "Transactions View": "View Transactions",
                            "Transactions Export": "Export Transactions",
                            "Settings View": "View Settings",
                            "Settings Edit General": "Edit General Settings",
                            "Settings Edit Pos": "Edit POS Settings",
                            "Settings Edit Inventory": "Edit Inventory Settings",
                            "Settings Edit Notifications": "Edit Notification Settings",
                            "Settings Edit Integrations": "Edit Integration Settings",
                            "Logs View": "View Activity Logs",
                            "Logs Export": "Export Activity Logs",
                          };

                          permissionLabel = labelMap[permissionLabel] || permissionLabel;

                          return (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={`perm-${permission}`}
                                checked={selectedPermissions.includes(permission)}
                                onCheckedChange={() => handleTogglePermission(permission)}
                              />
                              <Label
                                htmlFor={`perm-${permission}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {permissionLabel}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                      <Separator />
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t bg-background">
              <Button
                variant="outline"
                onClick={() => setSelectedMember(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePermissions} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Permissions
                  </>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </DashboardLayout>
  );
};

export default Permissions;
