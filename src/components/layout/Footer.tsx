import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const { tenant } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>
              © {currentYear} {tenant?.name || "Store Management System"}. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Add privacy policy link
              }}
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Add terms of service link
              }}
            >
              Terms of Service
            </a>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              <span>for your business</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
