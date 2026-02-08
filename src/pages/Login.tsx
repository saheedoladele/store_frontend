import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

const Login: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col p-8 lg:p-12">
        <div className="max-w-md mx-auto w-full flex flex-col h-full">
          <LoginForm />
          
          {/* Footer */}
          <div className="mt-auto pt-8 border-t flex items-center justify-between text-sm text-muted-foreground">
            <span>Copyright © {currentYear} Storix Enterprises LTD.</span>
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
          </div>
        </div>
      </div>

      {/* Right Side - Dashboard Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-8">
        <img 
          src="/images/store_dashbord.PNG" 
          alt="Store Dashboard Preview" 
          className="w-full h-full object-contain rounded-lg shadow-lg px-8"
        />
      </div>
    </div>
  );
};

export default Login;
