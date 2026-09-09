import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck } from "lucide-react";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Sign In & Register — Ambika Traders" },
      {
        name: "description",
        content: "Sign in to access your festive orders, wishlist, and account.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const redirectTarget = search.redirect || "/account";

  const { user, isAdmin, signIn, signUp, resetPassword } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (search.redirect === "/admin" && !isAdmin) {
        navigate({ to: "/account" });
      } else if (isAdmin && (!search.redirect || search.redirect === "/account")) {
        // Direct admin users directly to the Admin Management Console by default
        navigate({ to: "/admin" });
      } else {
        navigate({ to: redirectTarget });
      }
    }
  }, [user, isAdmin, redirectTarget, navigate, search.redirect]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
    } else {
      toast.success("Welcome back!");
      // Navigation is handled reactively by the auth state effect above
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || "Failed to create account.");
    } else {
      toast.success("Account created successfully! Welcome to Ambika Traders.");
      navigate({ to: redirectTarget });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || "Failed to send reset link.");
    } else {
      toast.success("Password reset email sent. Please check your inbox.");
      setTab("signin");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <span className="eyebrow text-xs tracking-widest text-primary uppercase">
            Ambika Traders
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground mt-1">
            {tab === "signin" && "Welcome Back"}
            {tab === "signup" && "Create Your Account"}
            {tab === "forgot" && "Reset Password"}
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            {tab === "signin" && "Sign in to manage your orders and wishlist"}
            {tab === "signup" && "Join our festive atelier for an elevated gifting experience"}
            {tab === "forgot" && "Enter your registered email to receive a recovery link"}
          </p>
        </div>

        {/* Tabs for Sign In vs Sign Up */}
        {tab !== "forgot" && (
          <div className="flex border-b border-border mb-6">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                tab === "signin"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                tab === "signup"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Sign In Form */}
        {tab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => setTab("forgot")}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Forgot Password View */}
        {tab === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Sending link..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => setTab("signin")}
              className="w-full text-xs text-muted-foreground hover:text-foreground text-center pt-2 cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Trust signal */}
        <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>256-Bit Encrypted & Secure Authentication</span>
        </div>
      </div>
    </div>
  );
}
