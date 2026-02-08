import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Shield,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
  AlertTriangle,
} from "lucide-react";
import { authApi } from "@/lib/api/auth.api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TwoFactorSetupProps {
  onEnabled?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onEnabled }) => {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();
  const { user, refreshTenant } = useAuth();

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      const response = await authApi.enableTwoFactor();
      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setIsSetupOpen(true);
      } else {
        throw new Error("Failed to enable 2FA");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enable two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authApi.verifyTwoFactorSetup(verificationCode);
      if (response.success && response.data) {
        setBackupCodes(response.data.backupCodes);
        setShowBackupCodes(true);
        toast({
          title: "Success",
          description: "Two-factor authentication enabled successfully",
          variant: "success",
        });
        if (onEnabled) {
          onEnabled();
        }
        // Refresh user data to get updated two_factor_enabled status
        await refreshTenant();
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
      variant: "success",
    });
  };

  const handleDownloadBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user?.two_factor_enabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your account is protected with two-factor authentication
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Enabled</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
        <Button onClick={handleEnable} disabled={isEnabling}>
          {isEnabling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Enable 2FA
            </>
          )}
        </Button>
      </div>

      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>

          {!showBackupCodes ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Save your backup codes in a safe place. You'll need them if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>

              {qrCode && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                  <div className="w-full">
                    <Label className="text-xs text-muted-foreground">Manual Entry Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={secret || ""}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(secret || "");
                          toast({
                            title: "Copied",
                            description: "Secret key copied to clipboard",
                            variant: "success",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verifyCode">Enter Verification Code</Label>
                <Input
                  id="verifyCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsSetupOpen(false);
                    setVerificationCode("");
                    setQrCode(null);
                    setSecret(null);
                  }}
                  disabled={isVerifying}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleVerify}
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>2FA Enabled Successfully!</AlertTitle>
                <AlertDescription>
                  Two-factor authentication has been enabled for your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Backup Codes</Label>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Save These Codes</AlertTitle>
                  <AlertDescription>
                    These codes can be used to access your account if you lose your authenticator device. Each code can only be used once.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-sm text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyBackupCodes}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleDownloadBackupCodes}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setIsSetupOpen(false);
                  setShowBackupCodes(false);
                  setVerificationCode("");
                  setQrCode(null);
                  setSecret(null);
                  setBackupCodes([]);
                }}
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
