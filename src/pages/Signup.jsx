import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Shield,
  Sun,
  Moon,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Globe,
  Check,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup() {
  const { signup, user, theme, toggleTheme, language, setLanguage, t } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPassword || !cleanConfirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup(cleanName, cleanEmail, cleanPassword);
      if (res && res.success) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: {
              email: cleanEmail,
              successMessage: "Account created successfully. You can now log in!",
            },
          });
        }, 500);
      } else {
        setError(res?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-app-bg relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,var(--color-border-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border-color)_1px,transparent_1px)] bg-size:[4rem_4rem]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-color/10 dark:bg-accent-color/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-border-color/10 dark:bg-border-color/10 blur-3xl pointer-events-none" />

      {/* Top Header Actions */}
      <div className="absolute top-6 right-6 flex items-center gap-2.5 z-20">
        <a
          href="tel:1930"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-card-bg/90 hover:bg-red-500/10 text-red-500 font-bold text-xs transition-all shadow-sm"
          title={t("cyberHelplineTooltip")}
        >
          <PhoneCall className="w-3.5 h-3.5 animate-bounce text-red-500" />
          <span className="font-mono">1930</span>
          <span className="hidden sm:inline text-[11px] font-semibold text-red-500">
            {t("cyberHelpline")}
          </span>
        </a>

        {/* Language dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 p-2 px-3 rounded-xl border border-border-color text-text-secondary bg-card-bg/80 backdrop-blur-md hover:bg-accent-color/10 transition-colors shadow-sm cursor-pointer text-xs font-bold"
          >
            <Globe className="w-4 h-4 text-accent-color" />
            <span>{language === "pa" ? "ਪੰਜਾਬੀ" : language === "hi" ? "हिंदी" : "EN"}</span>
          </button>
          {langDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setLangDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-border-color bg-card-bg p-1.5 shadow-xl z-20">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("en");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    language === "en" ? "bg-accent-color/15 text-accent-color" : "hover:bg-app-bg text-text-primary"
                  }`}
                >
                  <span>🇬🇧 English</span>
                  {language === "en" && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("hi");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    language === "hi" ? "bg-accent-color/15 text-accent-color" : "hover:bg-app-bg text-text-primary"
                  }`}
                >
                  <span>🇮🇳 हिन्दी</span>
                  {language === "hi" && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("pa");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    language === "pa" ? "bg-accent-color/15 text-accent-color" : "hover:bg-app-bg text-text-primary"
                  }`}
                >
                  <span>🇮🇳 ਪੰਜਾਬੀ</span>
                  {language === "pa" && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border-color text-text-secondary bg-card-bg/80 backdrop-blur-md hover:bg-accent-color/10 transition-colors shadow-sm cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4.5 h-4.5 text-warning-color" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-text-secondary" />
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-card-bg border border-border-color text-accent-color shadow-md flex items-center justify-center mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {t("appTitle")}
          </h1>
          <p className="text-xs font-semibold text-text-secondary dark:text-accent-color uppercase tracking-widest mt-1">
            {t("appSubtitle")}
          </p>
        </div>

        <div className="rounded-2xl border border-border-color bg-card-bg p-8 shadow-xl transition-all duration-300 card-premium">
          <h2 className="text-lg font-bold text-text-primary mb-1">
            {t("createAccount")}
          </h2>
          <p className="text-xs text-text-secondary mb-6">
            Register your analyst profile
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-danger-color/20 bg-danger-color/5 text-xs font-semibold text-danger-color">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-accent-color/20 bg-accent-color/5 dark:bg-accent-color/10 text-xs font-semibold text-accent-color">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                {t("fullNameLabel")}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-secondary/50" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full py-3 pl-11 pr-4 text-sm transition-colors input-premium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                {t("emailLabel")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-secondary/50" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@scamshield.ai"
                  className="w-full py-3 pl-11 pr-4 text-sm transition-colors input-premium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-secondary/50" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3 pl-11 pr-11 text-sm transition-colors input-premium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-text-secondary/50 hover:text-accent-color transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                {t("confirmPasswordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-secondary/50" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3 pl-11 pr-4 text-sm transition-colors input-premium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-5 btn-premium active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-app-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                t("signUpBtn")
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            {t("alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="text-accent-color font-semibold hover:underline ml-1"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
