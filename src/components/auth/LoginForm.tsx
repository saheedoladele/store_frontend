import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { authApi } from '@/lib/api/auth.api';
import { TwoFactorModal } from './TwoFactorModal';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();

  // Debug: Track when showTwoFactorModal changes
  useEffect(() => {
    console.log("showTwoFactorModal changed to:", showTwoFactorModal);
  }, [showTwoFactorModal]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     // Initial login
  //     const result = await login(email, password);
  //     if (result  && result.requiresTwoFactor) {
  //       setShowTwoFactorModal(true);
  //       setTempToken(result.tempToken || null);
  //       setIsLoading(false)
        
  //       toast({
  //         title: "Two-Factor Authentication Required",
  //         description: "Please enter the code from your authenticator app.",
  //         variant: "warning",
  //       });
  //     } else {
  //       toast({
  //         title: "Welcome back!",
  //         description: "You've been successfully logged in.",
  //         variant: "success",
  //       });
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Login failed",
  //       description: error instanceof Error ? error.message : "Please check your credentials and try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const result = await login(email, password);
  
      if (result && typeof result === 'object' && result.requiresTwoFactor) {
        setTempToken(result.tempToken || null);
        setShowTwoFactorModal(true);
        setIsLoading(false);
        return;
      }
  
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleTwoFactorVerify = async (code: string) => {
    if (!tempToken) {
      throw new Error("Session expired. Please login again.");
    }

    setIsVerifyingTwoFactor(true);
    try {
      const response = await authApi.verifyTwoFactorLogin(code, tempToken);
      if (response.success && response.data) {
        const { user, tenant, token } = response.data;
        
        // Store auth data in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("tenant", JSON.stringify(tenant));
        localStorage.setItem("token", token);
        
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
          variant: "success",
        });
        
        // Close modal and redirect
        setShowTwoFactorModal(false);
        setTempToken(null);
        
        // Reload the page to trigger AuthContext to read from localStorage
        window.location.href = "/dashboard";
      } else {
        throw new Error(response.error?.message || "2FA verification failed");
      }
    } finally {
      setIsVerifyingTwoFactor(false);
    }
  };

  const handleTwoFactorModalClose = () => {
    setShowTwoFactorModal(false);
    setTempToken(null);
    // Clear password for security
    setPassword("");
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Placeholder for social login
    toast({
      title: "Coming soon",
      description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login will be available soon.`,
      variant: "warning",
    });
  };
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <img 
            src="/images/storix.png" 
            alt="Store Logo" 
            className="h-10 w-auto"
          />
          
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">
          Enter your email and password to access your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="h-11"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="pr-10 h-11"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isLoading}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Remember Me
            </Label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Your Password?
          </Link>
        </div>

        {/* Login Button */}
        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log In
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or Login With
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 bg-white hover:bg-gray-50"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 bg-white hover:bg-gray-50"
            onClick={() => handleSocialLogin('apple')}
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </Button>
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <span className="text-sm text-muted-foreground">
            Don't Have An Account?{' '}
          </span>
          <Link
            to="/register"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Register Now.
          </Link>
        </div>
      </form>

      {/* Two-Factor Authentication Modal */}
      <TwoFactorModal
        open={showTwoFactorModal}
        onClose={handleTwoFactorModalClose}
        onVerify={handleTwoFactorVerify}
        isLoading={isVerifyingTwoFactor}
      />
    </div>
  );
};