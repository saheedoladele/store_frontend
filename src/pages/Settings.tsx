import React, { useState, useRef, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  Building,
  ShoppingCart,
  Package,
  Bell,
  Zap,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Clock,
  CreditCard,
  Shield,
  User,
  Calendar,
  Barcode,
  Database,
  Mail,
  Key,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { tenantApi } from "@/lib/api/tenant.api";
import { useToast } from "@/hooks/use-toast";
import { TwoFactorSetup } from "@/components/settings/TwoFactorSetup";

const Settings: React.FC = () => {
  const { tenant, refreshTenant } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const defaultOperatingHours = {
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "10:00", close: "16:00", closed: false },
    sunday: { open: "10:00", close: "16:00", closed: true },
  };

  const [settings, setSettings] = useState({
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    currency: "USD",
    timezone: "America/New_York",
    date_format: "MM/DD/YYYY",
    operating_hours: defaultOperatingHours,
    tax_rate: 8.5,
    receipt_footer: "Thank you for your business!",
    auto_print_receipt: true,
    require_customer_info: false,
    default_payment_method: "cash" as "cash" | "card" | "digital_wallet",
    quick_sale_enabled: true,
    low_stock_threshold: 10,
    auto_reorder: false,
    reorder_point: 5,
    track_serial_numbers: false,
    enable_barcode_scanning: true,
    email_notifications: true,
    sms_notifications: false,
    low_stock_alerts: true,
    daily_sales_report: false,
    invoice_reminders: false,
    stripe_enabled: false,
    stripe_public_key: "",
    email_service_enabled: false,
    backup_enabled: false,
    api_access_enabled: false,
  });

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingSettings(true);
      try {
        // Load tenant data (settings are included in tenant object)
        const tenantResponse = await tenantApi.getTenant();
        if (tenantResponse.success && tenantResponse.data) {
          const tenantData = tenantResponse.data;
          const tenantSettings = tenantData.settings || {};

          // Update logo preview (handle both base64 and URL)
          if (tenantData.logo) {
            const logoUrl = tenantData.logo.startsWith('data:') || tenantData.logo.startsWith('http')
              ? tenantData.logo
              : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${tenantData.logo}`;
            setLogoPreview(logoUrl);
          } else {
            setLogoPreview(null);
          }

          // Update settings state with loaded data
          setSettings({
            business_name: tenantData.name || "",
            business_address: tenantSettings.business_address || "",
            business_phone: tenantSettings.business_phone || "",
            business_email: tenantSettings.business_email || "",
            currency: tenantSettings.currency || "USD",
            timezone: tenantSettings.timezone || "America/New_York",
            date_format: tenantSettings.date_format || "MM/DD/YYYY",
            operating_hours: tenantSettings.operating_hours || defaultOperatingHours,
            tax_rate: tenantSettings.tax_rate !== undefined ? tenantSettings.tax_rate : 8.5,
            receipt_footer: tenantSettings.receipt_footer || "Thank you for your business!",
            auto_print_receipt: tenantSettings.auto_print_receipt !== undefined ? tenantSettings.auto_print_receipt : true,
            require_customer_info: tenantSettings.require_customer_info !== undefined ? tenantSettings.require_customer_info : false,
            default_payment_method: tenantSettings.default_payment_method || "cash",
            quick_sale_enabled: tenantSettings.quick_sale_enabled !== undefined ? tenantSettings.quick_sale_enabled : true,
            low_stock_threshold: tenantSettings.low_stock_threshold !== undefined ? tenantSettings.low_stock_threshold : 10,
            auto_reorder: tenantSettings.auto_reorder !== undefined ? tenantSettings.auto_reorder : false,
            reorder_point: tenantSettings.reorder_point !== undefined ? tenantSettings.reorder_point : 5,
            track_serial_numbers: tenantSettings.track_serial_numbers !== undefined ? tenantSettings.track_serial_numbers : false,
            enable_barcode_scanning: tenantSettings.enable_barcode_scanning !== undefined ? tenantSettings.enable_barcode_scanning : true,
            email_notifications: tenantSettings.email_notifications !== undefined ? tenantSettings.email_notifications : true,
            sms_notifications: tenantSettings.sms_notifications !== undefined ? tenantSettings.sms_notifications : false,
            low_stock_alerts: tenantSettings.low_stock_alerts !== undefined ? tenantSettings.low_stock_alerts : true,
            daily_sales_report: tenantSettings.daily_sales_report !== undefined ? tenantSettings.daily_sales_report : false,
            invoice_reminders: tenantSettings.invoice_reminders !== undefined ? tenantSettings.invoice_reminders : false,
            stripe_enabled: tenantSettings.stripe_enabled !== undefined ? tenantSettings.stripe_enabled : false,
            stripe_public_key: tenantSettings.stripe_public_key || "",
            email_service_enabled: tenantSettings.email_service_enabled !== undefined ? tenantSettings.email_service_enabled : false,
            backup_enabled: tenantSettings.backup_enabled !== undefined ? tenantSettings.backup_enabled : false,
            api_access_enabled: tenantSettings.api_access_enabled !== undefined ? tenantSettings.api_access_enabled : false,
          });
        } else {
          toast({
            title: "Error",
            description: tenantResponse.error?.message || "Failed to load settings",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Sync logo preview with tenant data when tenant changes
  useEffect(() => {
    if (tenant?.logo) {
      const logoUrl = tenant.logo.startsWith('data:') || tenant.logo.startsWith('http')
        ? tenant.logo
        : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${tenant.logo}`;
      setLogoPreview(logoUrl);
    } else {
      setLogoPreview(null);
    }
  }, [tenant?.logo]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64
          const base64String = canvas.toDataURL(file.type, 0.9);
          resolve(base64String);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB before resizing)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      // Resize image to max 250x250 and convert to base64
      const base64String = await resizeImage(file, 250, 250);
      setLogoPreview(base64String);
      await handleLogoUpload(base64String);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      });
      setIsUploadingLogo(false);
    }
  };

  const handleLogoUpload = async (base64String: string) => {
    try {
      const response = await tenantApi.uploadLogo(base64String);
      if (response.success && response.data) {
        toast({
          title: "Logo uploaded!",
          description: "Your logo has been successfully uploaded.",
          variant: "success",
        });
        // Update preview with new logo (base64 or URL)
        if (response.data.logo) {
          // If it's base64, use it directly, otherwise construct URL
          const logoUrl = response.data.logo.startsWith('data:') || response.data.logo.startsWith('http')
            ? response.data.logo
            : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${response.data.logo}`;
          setLogoPreview(logoUrl);
        }
        // Refresh tenant data to get updated logo
        await refreshTenant();
      } else {
        toast({
          title: "Upload failed",
          description: response.error?.message || "Failed to upload logo",
          variant: "destructive",
        });
        // Revert preview on error
        if (tenant?.logo) {
          const logoUrl = tenant.logo.startsWith('data:') || tenant.logo.startsWith('http')
            ? tenant.logo
            : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${tenant.logo}`;
          setLogoPreview(logoUrl);
        } else {
          setLogoPreview(null);
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
      if (tenant?.logo) {
        const logoUrl = tenant.logo.startsWith('data:') || tenant.logo.startsWith('http')
          ? tenant.logo
          : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${tenant.logo}`;
        setLogoPreview(logoUrl);
      } else {
        setLogoPreview(null);
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsUploadingLogo(true);
    try {
      const response = await tenantApi.updateTenant({ logo: null });
      if (response.success) {
        setLogoPreview(null);
        toast({
          title: "Logo removed",
          description: "Your logo has been removed.",
        });
        // Refresh tenant data
        await refreshTenant();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to remove logo",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove logo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update tenant name if changed
      if (settings.business_name && settings.business_name !== tenant?.name) {
        const tenantResponse = await tenantApi.updateTenant({ name: settings.business_name });
        if (!tenantResponse.success) {
          toast({
            title: "Save failed",
            description: tenantResponse.error?.message || "Failed to update business name",
            variant: "destructive",
          });
          return;
        }
        // Refresh tenant after name update
        await refreshTenant();
      }

      // Update all settings
      const settingsData = {
        currency: settings.currency,
        timezone: settings.timezone,
        date_format: settings.date_format,
        business_address: settings.business_address,
        business_phone: settings.business_phone,
        business_email: settings.business_email,
        operating_hours: settings.operating_hours,
        tax_rate: settings.tax_rate,
        receipt_footer: settings.receipt_footer,
        auto_print_receipt: settings.auto_print_receipt,
        require_customer_info: settings.require_customer_info,
        default_payment_method: settings.default_payment_method,
        quick_sale_enabled: settings.quick_sale_enabled,
        low_stock_threshold: settings.low_stock_threshold,
        auto_reorder: settings.auto_reorder,
        reorder_point: settings.reorder_point,
        track_serial_numbers: settings.track_serial_numbers,
        enable_barcode_scanning: settings.enable_barcode_scanning,
        email_notifications: settings.email_notifications,
        sms_notifications: settings.sms_notifications,
        low_stock_alerts: settings.low_stock_alerts,
        daily_sales_report: settings.daily_sales_report,
        invoice_reminders: settings.invoice_reminders,
        stripe_enabled: settings.stripe_enabled,
        stripe_public_key: settings.stripe_public_key,
        email_service_enabled: settings.email_service_enabled,
        backup_enabled: settings.backup_enabled,
        api_access_enabled: settings.api_access_enabled,
      };

      const response = await tenantApi.updateSettings(settingsData);
      if (response.success) {
        toast({
          title: "Settings saved!",
          description: "Your settings have been successfully updated.",
          variant: "success",
        });
        // Refresh tenant data to sync with backend
        await refreshTenant();
      } else {
        toast({
          title: "Save failed",
          description: response.error?.message || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOperatingHoursChange = (
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value,
        },
      },
    }));
  };

  if (isLoadingSettings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
            <TabsTrigger value="pos" className="text-xs sm:text-sm">POS</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs sm:text-sm">Inventory</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integrations</TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            {/* Logo Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Store Logo
                </CardTitle>
                <CardDescription>
                  Upload your store logo to display on receipts and invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Store logo"
                          className="h-24 w-24 object-contain border rounded-lg bg-muted p-2"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={handleRemoveLogo}
                          disabled={isUploadingLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="logo-upload">Logo Image</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {isUploadingLogo ? "Uploading..." : logoPreview ? "Change Logo" : "Upload Logo"}
                        </Button>
                        {logoPreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleRemoveLogo}
                            disabled={isUploadingLogo}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Image will be automatically resized to max 250x250px. Max file size: 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Configure your business details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      value={settings.business_name}
                      onChange={(e) =>
                        handleInputChange("business_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_email">Business Email</Label>
                    <Input
                      id="business_email"
                      type="email"
                      value={settings.business_email}
                      onChange={(e) =>
                        handleInputChange("business_email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_phone">Business Phone</Label>
                    <Input
                      id="business_phone"
                      value={settings.business_phone}
                      onChange={(e) =>
                        handleInputChange("business_phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) =>
                        handleInputChange("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="NGN">NGN - Naira</SelectItem>
                        <SelectItem value="CFR">CFR - Cefer </SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                        <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_format">Date Format</Label>
                    <Select
                      value={settings.date_format}
                      onValueChange={(value) =>
                        handleInputChange("date_format", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_address">Business Address</Label>
                  <Textarea
                    id="business_address"
                    value={settings.business_address}
                    onChange={(e) =>
                      handleInputChange("business_address", e.target.value)
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) =>
                        handleInputChange("timezone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Phoenix">Arizona Time</SelectItem>
                        <SelectItem value="America/Anchorage">Alaska Time</SelectItem>
                        <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Operating Hours
                </CardTitle>
                <CardDescription>
                  Set your business operating hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.operating_hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-24">
                      <Label className="capitalize">{day}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) =>
                          handleOperatingHoursChange(day, "closed", !checked)
                        }
                      />
                      <Label className="text-sm text-muted-foreground">
                        {hours.closed ? "Closed" : "Open"}
                      </Label>
                    </div>
                    {!hours.closed && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`${day}-open`} className="text-sm">Open</Label>
                          <Input
                            id={`${day}-open`}
                            type="time"
                            value={hours.open}
                            onChange={(e) =>
                              handleOperatingHoursChange(day, "open", e.target.value)
                            }
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`${day}-close`} className="text-sm">Close</Label>
                          <Input
                            id={`${day}-close`}
                            type="time"
                            value={hours.close}
                            onChange={(e) =>
                              handleOperatingHoursChange(day, "close", e.target.value)
                            }
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* POS Settings */}
          <TabsContent value="pos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Point of Sale Settings
                </CardTitle>
                <CardDescription>
                  Configure your POS system behavior and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={settings.tax_rate}
                      onChange={(e) =>
                        handleInputChange(
                          "tax_rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_payment_method">Default Payment Method</Label>
                    <Select
                      value={settings.default_payment_method}
                      onValueChange={(value: "cash" | "card" | "digital_wallet") =>
                        handleInputChange("default_payment_method", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_print_receipt"
                      checked={settings.auto_print_receipt}
                      onCheckedChange={(checked) =>
                        handleInputChange("auto_print_receipt", checked)
                      }
                    />
                    <Label htmlFor="auto_print_receipt">
                      Auto Print Receipt
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require_customer_info"
                      checked={settings.require_customer_info}
                      onCheckedChange={(checked) =>
                        handleInputChange("require_customer_info", checked)
                      }
                    />
                    <Label htmlFor="require_customer_info">
                      Require Customer Information
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="quick_sale_enabled"
                      checked={settings.quick_sale_enabled}
                      onCheckedChange={(checked) =>
                        handleInputChange("quick_sale_enabled", checked)
                      }
                    />
                    <Label htmlFor="quick_sale_enabled">
                      Enable Quick Sale Mode
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt_footer">Receipt Footer</Label>
                  <Textarea
                    id="receipt_footer"
                    value={settings.receipt_footer}
                    onChange={(e) =>
                      handleInputChange("receipt_footer", e.target.value)
                    }
                    rows={3}
                    placeholder="Thank you message or additional info"
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will appear at the bottom of all receipts
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Settings */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Inventory Management
                </CardTitle>
                <CardDescription>
                  Configure inventory tracking and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="low_stock_threshold">
                      Low Stock Threshold
                    </Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      min="0"
                      value={settings.low_stock_threshold}
                      onChange={(e) =>
                        handleInputChange(
                          "low_stock_threshold",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when stock falls below this quantity
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorder_point">Reorder Point</Label>
                    <Input
                      id="reorder_point"
                      type="number"
                      min="0"
                      value={settings.reorder_point}
                      onChange={(e) =>
                        handleInputChange(
                          "reorder_point",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum stock level before reordering
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="low_stock_alerts"
                      checked={settings.low_stock_alerts}
                      onCheckedChange={(checked) =>
                        handleInputChange("low_stock_alerts", checked)
                      }
                    />
                    <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_reorder"
                      checked={settings.auto_reorder}
                      onCheckedChange={(checked) =>
                        handleInputChange("auto_reorder", checked)
                      }
                    />
                    <Label htmlFor="auto_reorder">
                      Auto Reorder When Stock is Low
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track_serial_numbers"
                      checked={settings.track_serial_numbers}
                      onCheckedChange={(checked) =>
                        handleInputChange("track_serial_numbers", checked)
                      }
                    />
                    <Label htmlFor="track_serial_numbers">
                      Track Serial Numbers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable_barcode_scanning"
                      checked={settings.enable_barcode_scanning}
                      onCheckedChange={(checked) =>
                        handleInputChange("enable_barcode_scanning", checked)
                      }
                    />
                    <Label htmlFor="enable_barcode_scanning">
                      Enable Barcode Scanning
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) =>
                        handleInputChange("email_notifications", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms_notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      id="sms_notifications"
                      checked={settings.sms_notifications}
                      onCheckedChange={(checked) =>
                        handleInputChange("sms_notifications", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when inventory is running low
                      </p>
                    </div>
                    <Switch
                      id="low_stock_alerts"
                      checked={settings.low_stock_alerts}
                      onCheckedChange={(checked) =>
                        handleInputChange("low_stock_alerts", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="daily_sales_report">Daily Sales Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily sales summary via email
                      </p>
                    </div>
                    <Switch
                      id="daily_sales_report"
                      checked={settings.daily_sales_report}
                      onCheckedChange={(checked) =>
                        handleInputChange("daily_sales_report", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="invoice_reminders">Invoice Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminders for pending invoices
                      </p>
                    </div>
                    <Switch
                      id="invoice_reminders"
                      checked={settings.invoice_reminders}
                      onCheckedChange={(checked) =>
                        handleInputChange("invoice_reminders", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Gateway - Stripe
                </CardTitle>
                <CardDescription>
                  Configure Stripe payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stripe_enabled">Enable Stripe</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept card payments through Stripe
                    </p>
                  </div>
                  <Switch
                    id="stripe_enabled"
                    checked={settings.stripe_enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("stripe_enabled", checked)
                    }
                  />
                </div>
                {settings.stripe_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="stripe_public_key">Stripe Public Key</Label>
                    <Input
                      id="stripe_public_key"
                      type="text"
                      placeholder="pk_test_..."
                      value={settings.stripe_public_key}
                      onChange={(e) =>
                        handleInputChange("stripe_public_key", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Stripe publishable key (starts with pk_)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Service
                </CardTitle>
                <CardDescription>
                  Configure email service integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_service_enabled">Enable Email Service</Label>
                    <p className="text-sm text-muted-foreground">
                      Send transactional emails and notifications
                    </p>
                  </div>
                  <Switch
                    id="email_service_enabled"
                    checked={settings.email_service_enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("email_service_enabled", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  Backup & Data
                </CardTitle>
                <CardDescription>
                  Manage data backup and export settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="backup_enabled">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup your data daily
                    </p>
                  </div>
                  <Switch
                    id="backup_enabled"
                    checked={settings.backup_enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("backup_enabled", checked)
                    }
                  />
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Database className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  API Access
                </CardTitle>
                <CardDescription>
                  Manage API access and integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="api_access_enabled">Enable API Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow third-party applications to access your data via API
                    </p>
                  </div>
                  <Switch
                    id="api_access_enabled"
                    checked={settings.api_access_enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("api_access_enabled", checked)
                    }
                  />
                </div>
                {settings.api_access_enabled && (
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Key className="mr-2 h-4 w-4" />
                      Generate API Key
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Subscription Information
                </CardTitle>
                <CardDescription>
                  View and manage your subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenant?.subscription && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{tenant.subscription.plan} Plan</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          Status: {tenant.subscription.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Next billing date</p>
                        <p className="font-medium">
                          {new Date(tenant.subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        Upgrade Plan
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Manage Billing
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TwoFactorSetup onEnabled={refreshTenant} />
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed: Never
                      </p>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">
                        Manage your active login sessions
                      </p>
                    </div>
                    <Button variant="outline">View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export or delete your account data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Database className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Download a copy of all your data in JSON format
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
