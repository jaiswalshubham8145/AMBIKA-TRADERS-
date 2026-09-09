import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set New Password — Ambika Traders" },
      {
        name: "description",
        content: "Set a new secure password for your Ambika Traders account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cleanPass = password.trim();
  const cleanConfirm = confirmPassword.trim();
  const isMatch = cleanPass.length > 0 && cleanPass === cleanConfirm;
  const isLongEnough = cleanPass.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cleanPass) {
      toast.error("Please enter a new password.");
      return;
    }

    if (!isLongEnough) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (cleanPass !== cleanConfirm) {
      toast.error("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await updatePassword(cleanPass);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || "Failed to update password. Your reset link may have expired.");
    } else {
      setIsSuccess(true);
      toast.success("Password updated successfully!");
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
            {isSuccess ? "Password Updated" : "Set New Password"}
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            {isSuccess
              ? "Your password has been changed successfully. You can now use your new password to sign in."
              : "Please choose a strong, new password for your account."}
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <Link
                to={user ? "/account" : "/login"}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
              >
                <span>{user ? "Go to My Account" : "Sign In with New Password"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/shop"
                className="block text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Return to Store
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.trim())}
                  placeholder="At least 6 characters"
                  required
                  autoFocus
                  className="w-full pl-9 pr-10 py-2.5 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && !isLongEnough && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Password must be at least 6 characters
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.trim())}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Live matching indicator */}
              {confirmPassword.length > 0 && (
                <div className="text-[11px] mt-1.5 flex items-center gap-1">
                  {isMatch ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match perfectly
                    </span>
                  ) : (
                    <span className="text-rose font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match yet
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isLongEnough || !isMatch}
              className="w-full bg-primary text-primary-foreground py-3 rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? "Updating Password..." : "Update Password"}</span>
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
