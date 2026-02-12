import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, LogOut, AlertTriangle } from "lucide-react";

interface IdleTimeoutModalProps {
  open: boolean;
  timeRemaining: number; // in milliseconds
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export const IdleTimeoutModal: React.FC<IdleTimeoutModalProps> = ({
  open,
  timeRemaining,
  onStayLoggedIn,
  onLogout,
}) => {
  const secondsRemaining = Math.ceil(timeRemaining / 1000);
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const formatTime = () => {
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden" 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription className="text-center">
            You've been inactive for a while. Your session will expire soon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Time remaining:</span>
                <span className="font-mono text-lg font-semibold">
                  {formatTime()}
                </span>
              </div>
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground text-center">
            You will be automatically logged out in {formatTime()} if you don't take any action.
          </p>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onLogout}
              className="flex-1"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout Now
            </Button>
            <Button
              type="button"
              onClick={onStayLoggedIn}
              className="flex-1"
            >
              Stay Logged In
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
