import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/auth.api";
import { Footer } from "@/components/layout/Footer";
import { Mail, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword({ email: data.email });

      if (response.success) {
        setIsSuccess(true);
        toast({
          title: "Email sent",
          description: response.data?.message || "If an account exists with this email, a password reset link has been sent.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to send reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Link>
                </Button>
              </div>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-6">
                    <div className="rounded-full bg-green-100 p-3">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button onClick={() => navigate("/login")} className="w-full">
                      Back to Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsSuccess(false)}
                      className="w-full"
                    >
                      Send another email
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              )}

              <div className="mt-4 text-center text-sm">
                <Link
                  to="/login"
                  className="text-primary hover:underline"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
