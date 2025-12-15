import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogIn, UserPlus, Check, X } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password validation
  const passwordValidation = useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const isPasswordValid = passwordValidation.minLength && 
                          passwordValidation.hasUppercase && 
                          passwordValidation.hasSpecialChar;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/admin");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password on signup
    if (isSignUp && !isPasswordValid) {
      toast({
        title: "Password tidak memenuhi syarat",
        description: "Pastikan password memenuhi semua kriteria yang ditentukan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast({ 
          title: "Registrasi berhasil!", 
          description: "Silakan login dengan akun yang sudah dibuat." 
        });
        setIsSignUp(false);
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: "Login berhasil!" });
      }
    } catch (error: any) {
      let message = error.message;
      if (error.message.includes("User already registered")) {
        message = "Email sudah terdaftar. Silakan login.";
      } else if (error.message.includes("Invalid login credentials")) {
        message = "Email atau password salah.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
      {met ? <Check size={14} className="text-green-600" /> : <X size={14} className="text-red-400" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Kembali ke Beranda
        </button>

        <div className="glass-card p-8 bg-card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isSignUp ? "Daftar Akun" : "Login"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp 
                ? "Buat akun baru untuk mengakses fitur upload" 
                : "Masuk ke panel admin"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              {/* Password requirements - only show on signup */}
              {isSignUp && password.length > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Syarat Password:</p>
                  <PasswordRequirement met={passwordValidation.minLength} text="Minimal 8 karakter" />
                  <PasswordRequirement met={passwordValidation.hasUppercase} text="Minimal 1 huruf kapital (A-Z)" />
                  <PasswordRequirement met={passwordValidation.hasSpecialChar} text="Minimal 1 tanda baca (!@#$%^&*)" />
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (isSignUp && !isPasswordValid)}
            >
              {loading ? (
                "Loading..."
              ) : isSignUp ? (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Daftar
                </>
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword("");
              }}
              className="text-sm text-accent hover:underline"
            >
              {isSignUp 
                ? "Sudah punya akun? Login" 
                : "Belum punya akun? Daftar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
