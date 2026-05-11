import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Leaf, Eye, EyeOff, Mail, Lock, User, Check, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { api } from "../../lib/api";

export function Login() {
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign up state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Mobile tab
  const [mobileTab, setMobileTab] = useState<"login" | "signup">("login");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!loginEmail || !loginPassword) {
    toast.error("Please fill in all fields");
    return;
  }
  setLoginLoading(true);
  try {
    await api.login({ email: loginEmail, password: loginPassword });
    toast.success("Welcome back to FoodMood!");
    navigate("/dashboard");
  } catch (err: any) {
    toast.error(err.message || "Login failed");
  } finally {
    setLoginLoading(false);
  }
};
  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation unchanged ...
  setSignupLoading(true);
  try {
    await api.register({ name: signupName, email: signupEmail, password: signupPassword });
    toast.success("Account created! Welcome to FoodMood 🌿");
    navigate("/dashboard");
  } catch (err: any) {
    toast.error(err.message || "Sign up failed");
  } finally {
    setSignupLoading(false);
  }
};

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = passwordStrength(signupPassword);
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-[#B2D2A4]", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fdf6] via-white to-[#eef7ea] flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[#4A5568] hover:text-[#B2D2A4] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <Leaf className="w-5 h-5 text-[#B2D2A4]" />
          <span className="font-semibold">FoodMood</span>
        </Link>
        <p className="text-sm text-[#4A5568]/50 hidden md:block">
          Intelligent food waste management platform
        </p>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden px-6 mb-4 flex gap-2">
        <button
          onClick={() => setMobileTab("login")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            mobileTab === "login"
              ? "bg-[#B2D2A4] text-[#4A5568]"
              : "bg-white text-[#4A5568]/60 border border-gray-200"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMobileTab("signup")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            mobileTab === "signup"
              ? "bg-[#4A5568] text-white"
              : "bg-white text-[#4A5568]/60 border border-gray-200"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl flex gap-6">

          {/* ─── LEFT PANEL: LOGIN ─── */}
          <motion.div
            className={`flex-1 ${mobileTab === "signup" ? "hidden md:flex" : "flex"} flex-col`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 md:p-10 shadow-[0px_4px_32px_rgba(0,0,0,0.08)] border-0 rounded-[24px] h-full">
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#B2D2A4]/20 flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-[#B2D2A4]" />
                </div>
                <h1 className="text-2xl font-bold text-[#4A5568] mb-1">Welcome back</h1>
                <p className="text-[#4A5568]/60 text-sm">Sign in to your FoodMood account</p>
              </div>

              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => { toast.info("Google login coming soon!"); }}
                  className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-[#4A5568]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-[#4A5568]/40 font-medium">or sign in with email</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#4A5568] mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]/40" />
                    <Input
                      type="email"
                      placeholder="hello@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl border-gray-200 focus:border-[#B2D2A4] focus:ring-[#B2D2A4]/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[#4A5568]">Password</label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs text-[#B2D2A4] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]/40" />
                    <Input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:border-[#B2D2A4] focus:ring-[#B2D2A4]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568]/40 hover:text-[#4A5568]"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="w-4 h-4 rounded border-gray-300 accent-[#B2D2A4]"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-[#4A5568]/70">
                    Remember me for 30 days
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#B2D2A4] hover:bg-[#9BC18A] text-[#4A5568] rounded-xl font-semibold shadow-sm"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-[#4A5568]/30 border-t-[#4A5568] rounded-full"
                    />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-[#4A5568]/50 mt-6">
                Don't have an account?{" "}
                <button
                  className="text-[#B2D2A4] font-medium hover:underline md:hidden"
                  onClick={() => setMobileTab("signup")}
                >
                  Sign up
                </button>
                <span className="hidden md:inline text-[#4A5568]/50">Create one on the right →</span>
              </p>
            </Card>
          </motion.div>

          {/* ─── RIGHT PANEL: SIGN UP ─── */}
          <motion.div
            className={`flex-1 ${mobileTab === "login" ? "hidden md:flex" : "flex"} flex-col`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-8 md:p-10 shadow-[0px_4px_32px_rgba(0,0,0,0.08)] border-0 rounded-[24px] bg-gradient-to-br from-[#4A5568] to-[#2D3748] h-full">
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-[#B2D2A4]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
                <p className="text-white/60 text-sm">Join thousands reducing food waste</p>
              </div>

              {/* Social Sign Up */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => { toast.info("Google sign up coming soon!"); }}
                  className="w-full h-11 flex items-center justify-center gap-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white border border-white/10"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/40 font-medium">or create with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 mb-1.5 block">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="text"
                      placeholder="Alex Johnson"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-[#B2D2A4] focus:ring-[#B2D2A4]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/80 mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="email"
                      placeholder="hello@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-[#B2D2A4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/80 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-[#B2D2A4]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-all ${
                              i <= strengthScore ? strengthColors[strengthScore] : "bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-white/40">
                        {strengthScore > 0 ? strengthLabels[strengthScore] : ""}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-white/80 mb-1.5 block">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      className={`pl-10 pr-10 h-11 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-[#B2D2A4] ${
                        signupConfirm && signupPassword !== signupConfirm ? "border-red-400" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {signupConfirm && signupPassword === signupConfirm && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2D2A4]" />
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    onClick={() => setAcceptTerms(!acceptTerms)}
                    className={`w-5 h-5 rounded-md mt-0.5 flex-shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                      acceptTerms
                        ? "bg-[#B2D2A4] border-[#B2D2A4]"
                        : "border-white/30 bg-white/10"
                    }`}
                  >
                    {acceptTerms && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-white/60 leading-relaxed">
                    I agree to the{" "}
                    <button type="button" onClick={() => navigate("/terms")} className="text-[#B2D2A4] hover:underline">
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button type="button" onClick={() => navigate("/privacy")} className="text-[#B2D2A4] hover:underline">
                      Privacy Policy
                    </button>
                  </span>
                </label>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#B2D2A4] hover:bg-[#9BC18A] text-[#4A5568] rounded-xl font-semibold shadow-sm"
                  disabled={signupLoading}
                >
                  {signupLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-[#4A5568]/30 border-t-[#4A5568] rounded-full"
                    />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-white/40 mt-6">
                Already have an account?{" "}
                <button
                  className="text-[#B2D2A4] font-medium hover:underline md:hidden"
                  onClick={() => setMobileTab("login")}
                >
                  Sign in
                </button>
                <span className="hidden md:inline text-white/40">← Sign in on the left</span>
              </p>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-[#4A5568]/40">
        © 2026 FoodMood · Making food waste a thing of the past 🌿
      </div>
    </div>
  );
}
