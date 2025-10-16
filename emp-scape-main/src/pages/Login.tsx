import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Shield, Users, Clock, ClipboardList, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Language } from '@/i18n/translations';

// API endpoints
const API_ENDPOINTS = {
  sendOtp: 'http://127.0.0.1:8000/auth/send-otp',
  verifyOtp: 'http://127.0.0.1:8000/auth/verify-otp'
};

// Configure axios defaults
axios.defaults.baseURL = '';  // Using absolute URLs
axios.defaults.headers.post['Content-Type'] = 'application/json';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      detail?: string;
    };
  };
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      setError('');
      const response = await axios.post(API_ENDPOINTS.sendOtp, {
        email: email
      });
      
      if (response.status === 200 || response.status === 201) {
        setOtpSent(true);
        toast({
          title: "Success",
          description: "OTP sent successfully",
        });
      }
    } catch (err) {
      console.error('OTP send error:', err);
      const apiError = err as ApiError;
      let errorMessage = 'Failed to send OTP';
      
      if (apiError.response?.data?.detail) {
        errorMessage = apiError.response.data.detail;
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (!apiError.response) {
        errorMessage = 'Unable to connect to the server. Please check if the server is running.';
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      setError('');
      const response = await axios.post(API_ENDPOINTS.verifyOtp, {
        email: email,
        otp: otp
      });
      
      if (response.status === 200 || response.status === 201) {
        const userData = response.data;
        console.log('Login Response:', userData); // Debug log
        
        // Convert role to lowercase for consistency
        const userRole = userData.role?.toLowerCase();
        
        toast({
          title: "Success",
          description: "OTP verified successfully. Role: " + userRole,
        });

        // Determine redirect path based on user role
        const roleRoutes: Record<string, string> = {
          admin: '/admin',
          hr: '/hr',
          manager: '/manager',
          team_lead: '/team_lead',
          employee: '/employee'
        };

        // Log the role and redirect path for debugging
        console.log('User Role:', userRole);
        const redirectPath = roleRoutes[userRole] || '/';
        console.log('Redirect Path:', redirectPath);
        
        // Call the auth context login method with the verified data
        await login({
          user_id: userData.user_id,
          email: userData.email,
          name: userData.name,
          role: userRole,
          access_token: userData.access_token,
          token_type: userData.token_type
        });
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      const apiError = err as ApiError;
      let errorMessage = 'Failed to verify OTP';
      
      if (apiError.response?.data?.detail) {
        errorMessage = apiError.response.data.detail;
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (!apiError.response) {
        errorMessage = 'Unable to connect to the server. Please check if the server is running.';
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:flex-1 bg-gradient-soft p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">S</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Shekru Web</h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Complete Employee Management Solution
          </h2>
          
          <p className="text-muted-foreground mb-8">
            Streamline your workforce management with our comprehensive platform featuring attendance tracking, 
            task management, and leave management - all in one place.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm">Attendance Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-success" />
              <span className="text-sm">Task Management</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              <span className="text-sm">Team Collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              <span className="text-sm">Role-Based Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:flex-1 p-8 lg:p-12 flex items-center justify-center bg-card">
        <div className="max-w-md w-full">
          {/* Language Selector */}
          <div className="flex justify-end mb-6">
            <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
              <SelectTrigger className="w-[140px]">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{t.auth.loginTitle}</CardTitle>
              <CardDescription className="text-center">
                Enter your email to receive an OTP for secure login
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.auth.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                    ) : null}
                    {isLoading ? "Sending OTP..." : t.auth.sendOtp}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">{t.auth.otp}</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      required
                      disabled={isLoading}
                      className="text-center tracking-widest text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      OTP sent to {email}
                    </p>
                  </div>
                  
                  {error && (
                    <div className="text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                    ) : null}
                    {isLoading ? "Verifying..." : t.auth.verifyOtp}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setError('');
                    }}
                    disabled={isLoading}
                  >
                    Change Email
                  </Button>
                </form>
              )}
            </CardContent>
            
            <CardFooter>
              <p className="text-xs text-center text-muted-foreground w-full">
                By logging in, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;