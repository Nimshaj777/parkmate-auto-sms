import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, LogOut, Copy, Download, RefreshCw, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GeneratedCode {
  code: string;
  duration: number;
  timestamp: string;
}

export function AdminCodeGenerator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [count, setCount] = useState<number>(1);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [generating, setGenerating] = useState(false);
  const [codeStats, setCodeStats] = useState({ total: 0, used: 0, unused: 0 });

  useEffect(() => {
    checkAuth();
  }, []);

  // Session timeout (30 minutes)
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const timeout = setTimeout(() => {
        handleLogout();
        toast({ 
          title: "Session Expired", 
          description: "Please login again for security",
          variant: "destructive"
        });
      }, 30 * 60 * 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, isAdmin]);

  // Load code statistics
  useEffect(() => {
    if (isAdmin) {
      loadCodeStats();
    }
  }, [isAdmin, generatedCodes]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!roleData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      await checkAuth();
      toast({ title: "Login Successful", description: "Welcome, Admin!" });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    toast({ title: "Logged Out", description: "See you next time!" });
  };

  const generateCodes = async () => {
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-activation-code', {
        body: { duration, count, villaCount: 1 }
      });

      if (error) throw error;

      const newCodes: GeneratedCode[] = data.codes.map((code: string) => ({
        code,
        duration: data.duration,
        timestamp: new Date().toISOString()
      }));

      setGeneratedCodes([...newCodes, ...generatedCodes]);
      
      const codeType = duration === 5 ? 'Trial' : 'Subscription';
      toast({
        title: "Codes Generated Successfully!",
        description: `${count} ${codeType} code(s) generated for ${duration} days`
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate codes",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Code ${code} copied to clipboard` });
  };

  const copyAllCodes = () => {
    const allCodes = generatedCodes.map(c => c.code).join('\n');
    navigator.clipboard.writeText(allCodes);
    toast({ title: "Copied!", description: `${generatedCodes.length} codes copied` });
  };

  const downloadCSV = () => {
    const csv = [
      'Code,Duration (days),Generated At',
      ...generatedCodes.map(c => `${c.code},${c.duration},${c.timestamp}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activation-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "Downloaded!", description: "Codes exported to CSV" });
  };

  const loadCodeStats = async () => {
    try {
      const { data, error } = await supabase
        .from('activation_codes')
        .select('is_used');
      
      if (error) throw error;
      
      const total = data?.length || 0;
      const used = data?.filter(c => c.is_used).length || 0;
      
      setCodeStats({
        total,
        used,
        unused: total - used
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const quickGenerate = async (type: 'trial' | 'monthly' | 'quarterly' | 'yearly', quantity: number) => {
    const durations = {
      trial: 5,
      monthly: 30,
      quarterly: 90,
      yearly: 365
    };
    
    setDuration(durations[type]);
    setCount(quantity);
    
    // Auto-trigger generation
    setTimeout(async () => {
      await generateCodes();
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You do not have admin privileges.</p>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Generate activation codes</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Code Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Codes</p>
                <p className="text-2xl font-bold">{codeStats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Used Codes</p>
                <p className="text-2xl font-bold">{codeStats.used}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Codes</p>
                <p className="text-2xl font-bold">{codeStats.unused}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Generation Presets */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Quick Generate</h2>
          <p className="text-sm text-muted-foreground mb-4">
            One-click code generation for common scenarios
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={() => quickGenerate('trial', 10)}
              variant="outline"
              className="justify-start h-auto p-4"
              disabled={generating}
            >
              <div className="flex items-start gap-3 w-full">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold">Generate 10 Trial Codes</div>
                  <div className="text-xs text-muted-foreground">5-day trial period</div>
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={() => quickGenerate('monthly', 10)}
              variant="outline"
              className="justify-start h-auto p-4"
              disabled={generating}
            >
              <div className="flex items-start gap-3 w-full">
                <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold">Generate 10 Monthly Codes</div>
                  <div className="text-xs text-muted-foreground">30-day subscription</div>
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={() => quickGenerate('quarterly', 5)}
              variant="outline"
              className="justify-start h-auto p-4"
              disabled={generating}
            >
              <div className="flex items-start gap-3 w-full">
                <Zap className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold">Generate 5 Quarterly Codes</div>
                  <div className="text-xs text-muted-foreground">90-day subscription</div>
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={() => quickGenerate('yearly', 5)}
              variant="outline"
              className="justify-start h-auto p-4"
              disabled={generating}
            >
              <div className="flex items-start gap-3 w-full">
                <Zap className="h-5 w-5 text-purple-500 mt-0.5" />
                <div className="text-left">
                  <div className="font-semibold">Generate 5 Yearly Codes</div>
                  <div className="text-xs text-muted-foreground">365-day subscription</div>
                </div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Custom Code Generator */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Code Generation</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Each code activates one villa with up to 20 vehicles. Users can add unlimited villas by activating each one separately.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Code Type & Duration</Label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Trial</Badge>
                      5 Days
                    </div>
                  </SelectItem>
                  <SelectItem value="30">30 Days (1 Month)</SelectItem>
                  <SelectItem value="60">60 Days (2 Months)</SelectItem>
                  <SelectItem value="90">90 Days (3 Months)</SelectItem>
                  <SelectItem value="180">180 Days (6 Months)</SelectItem>
                  <SelectItem value="365">365 Days (1 Year)</SelectItem>
                </SelectContent>
              </Select>
              {duration === 5 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Free trial code - expires in 5 days
                </p>
              )}
            </div>
            
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of codes to generate
              </p>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateCodes} 
                disabled={generating}
                className="w-full"
              >
                {generating ? 'Generating...' : 'Generate Codes'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Generated Codes List */}
        {generatedCodes.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Generated Codes ({generatedCodes.length})</h2>
              <div className="flex gap-2">
                <Button onClick={copyAllCodes} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
                <Button onClick={downloadCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {generatedCodes.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <code className="text-lg font-mono font-bold">{item.code}</code>
                    <div className="flex gap-2 mt-1">
                      {item.duration === 5 ? (
                        <Badge variant="outline" className="border-primary text-primary">
                          Trial - {item.duration} days
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{item.duration} days</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => copyCode(item.code)}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
