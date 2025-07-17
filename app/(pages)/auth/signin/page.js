"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Store, Calculator, TrendingUp, Shield, Users, BarChart3, Mail, Lock } from "lucide-react";
import { redirectByRole } from "@/lib/auth-helpers";
import Image from "next/image";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const [callbackUrl, setCallbackUrl] = useState("/");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cb = urlParams.get("callbackUrl");
    if (cb) setCallbackUrl(cb);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Get user session to determine redirect
        const session = await getSession();
        if (session?.user?.role) {
          const redirectUrl = redirectByRole(session.user.role);
          router.push(redirectUrl);
        } else {
          router.push(callbackUrl);
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
   <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
        <div className="text-center space-y-6">
      <div className="flex justify-center">
        <Image
          src="/ebiz-logo.png"
          alt="BIZ LOGIST Logo"
          width={85}
          height={85}
          className="object-contain"
        />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">BIZ LOGIST</h1>
        <p className="text-muted-foreground text-lg">POS & Accounting System</p>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Multi-user</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </div>
        </div>
      </div>
    </div>

          {/* Login Form */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-card-foreground">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to your account to continue</p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-card-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-card-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Protected & Powered by{' '}
                  <a
                    href="https://bizlogist.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-bold underline transition-colors"
                  >
                    BIZLOGIST
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4">Demo Credentials</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <span className="font-medium text-foreground">Admin</span>
                <span className="text-muted-foreground">admin@demo.com / admin123</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <span className="font-medium text-foreground">Cashier</span>
                <span className="text-muted-foreground">cashier@demo.com / cashier123</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <span className="font-medium text-foreground">Accountant</span>
                <span className="text-muted-foreground">accountant@demo.com / accountant123</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/5 to-accent/5 items-center justify-center p-8">
        <div className="max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <div className="grid grid-cols-2 gap-2">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Complete Business Solution</h2>
            <p className="text-muted-foreground text-lg">
              Streamline your business operations with our comprehensive POS and accounting system.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Point of Sale</h3>
                <p className="text-sm text-muted-foreground">Complete POS system with inventory management</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Accounting</h3>
                <p className="text-sm text-muted-foreground">Advanced financial management and reporting</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Analytics</h3>
                <p className="text-sm text-muted-foreground">Real-time insights and business intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
