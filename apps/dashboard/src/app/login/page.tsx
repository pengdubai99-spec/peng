"use client";

import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("http://localhost:3001/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role: "DRIVER" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Kayit basarisiz");
        setSuccess("Hesap olusturuldu! Simdi giris yapabilirsiniz.");
        setIsRegister(false);
      } else {
        const res = await fetch("http://localhost:3001/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Giris basarisiz");
        localStorage.setItem("token", data.access_token || data.token);
        localStorage.setItem("user", JSON.stringify(data.user || {}));
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bir hata olustu";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-mesh" />
      <div className="grid-pattern" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Back button */}
          <motion.button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana sayfa</span>
          </motion.button>

          {/* Card */}
          <div className="glass-card rounded-3xl p-8 md:p-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text-peng">PENG</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {isRegister ? "Hesap Olustur" : "Giris Yap"}
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              {isRegister
                ? "PENG platformuna katilmak icin bilgilerinizi girin."
                : "Filo yonetim panelinize erisin."}
            </p>

            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name (Register only) */}
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                    Ad Soyad
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adinizi girin"
                      required
                      className="w-full px-4 py-3 pl-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@peng.com"
                    required
                    className="w-full px-4 py-3 pl-11 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                  Sifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sifrenizi girin"
                    required
                    className="w-full px-4 py-3 pl-11 pr-11 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cta-button w-full py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? "Kayit Ol" : "Giris Yap"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("user", JSON.stringify({ name: "Demo Kullanici", role: "Yonetici" }));
                  router.push("/dashboard");
                }}
                className="w-full py-2 text-xs text-slate-500 hover:text-indigo-400 transition-all border border-white/5 rounded-lg mt-2"
              >
                Demo Olarak Giris Yap (Hizli Test)
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
                className="text-sm text-slate-500 hover:text-purple-400 transition-colors"
              >
                {isRegister
                  ? "Zaten hesabiniz var mi? Giris yapin"
                  : "Hesabiniz yok mu? Kayit olun"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
