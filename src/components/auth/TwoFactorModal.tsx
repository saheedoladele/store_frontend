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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Shield, Loader2, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  isLoading?: boolean;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  open,
  onClose,
  onVerify,
  isLoading = false,
}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Clear code and error when modal closes
  useEffect(() => {
    if (!open) {
      setCode("");
      setError(null);
    }
  }, [open]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    try {
      await onVerify(code);
      // Success - modal will be closed by parent component
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
      setCode(""); // Clear code on error
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter"
    ) {
      return;
    }
    // Allow numbers
    if (e.key >= "0" && e.key <= "9") {
      return;
    }
    // Prevent all other keys
    e.preventDefault();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Only close when user explicitly closes (not when opening)
      if (!isOpen) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter the 6-digit code from your authenticator app to complete login
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="twoFactorCode" className="text-center block">
              Authentication Code
            </Label>
            <Input
              id="twoFactorCode"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              placeholder="000000"
              maxLength={6}
              required
              disabled={isLoading}
              className="text-center text-3xl tracking-[0.5em] font-mono h-16 text-lg"
              autoComplete="one-time-code"
            />
            <p className="text-xs text-muted-foreground text-center">
              You can also use a backup code if you've lost access to your authenticator app
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Having trouble? Make sure your device's time is synchronized correctly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
