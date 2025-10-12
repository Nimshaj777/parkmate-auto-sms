import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

export function AdminSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/admin'
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account Created!",
          description: "Your account has been created. Please check backend to assign admin role.",
        });

        // Show instructions
        setTimeout(() => {
          toast({
            title: "Next Steps",
            description: "Go to Backend → user_roles table → Insert your user_id with role='admin'",
            duration: 10000
          });
        }, 2000);
      }

    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          <Crown className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Create Admin Account</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Step 1 of 2: Create your account
        </p>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@parkmate.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              At least 6 characters
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              After creating account, go to Backend to assign admin role
            </p>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Button>
            </Link>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <h3 className="font-semibold text-sm mb-2">📋 After Signup:</h3>
          <ol className="text-xs space-y-1 text-muted-foreground">
            <li>1. Copy your User ID from the success message</li>
            <li>2. Open Backend → user_roles table</li>
            <li>3. Insert row: user_id={'{your-id}'}, role='admin'</li>
            <li>4. Return to /admin to login</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
