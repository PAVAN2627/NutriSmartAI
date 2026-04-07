import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const checkAndRedirect = async (uid: string) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists() && snap.data().profileCompleted) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.success("Account ready! Let's set up your profile.");
      navigate("/onboarding");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await checkAndRedirect(result.user.uid);
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill in all fields");
    if (isSignUp && !form.name.trim()) return toast.error("Please enter your name");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(result.user, { displayName: form.name.trim() });
        await checkAndRedirect(result.user.uid);
      } else {
        const result = await signInWithEmailAndPassword(auth, form.email, form.password);
        await checkAndRedirect(result.user.uid);
      }
    } catch (error: any) {
      const msg: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered. Try logging in.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Invalid email or password.",
      };
      toast.error(msg[error.code] || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative"
      style={{
        backgroundImage: "url('/Gemini_Generated_Image_1jsqse1jsqse1jsq.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-5 left-5 z-10 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="max-w-md w-full bg-card/95 backdrop-blur-md p-8 rounded-3xl shadow-elevated relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-card">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-heading">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            {isSignUp
              ? "Sign up to start your personalized nutrition journey."
              : "Sign in to access your NutriSmart dashboard."}
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google */}
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-11"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-4 h-4 mr-2 bg-white rounded-full p-0.5"
          />
          Continue with Google
        </Button>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => { setIsSignUp((p) => !p); setForm({ name: "", email: "", password: "" }); }}
            className="text-primary font-semibold hover:underline ml-1"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
