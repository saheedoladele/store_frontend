import React, { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Link } from "react-router-dom";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <>
            <LoginForm />
            <div className="mt-4 text-center">
              <Link
                to="/register"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setIsLogin(false)}
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </>
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;
