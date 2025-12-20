"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function AuthPage() {
  const router = useRouter();
  const { user, authError, sendMagicCode, signInWithMagicCode } = useUser();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log("✅ User already authenticated, redirecting to home");
      router.push("/");
      router.refresh();
    }
  }, [user, router]);

  // Clear loading state when authError occurs
  useEffect(() => {
    if (authError) {
      setIsLoading(false);
      setError(authError);
    }
  }, [authError]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!showCodeInput) {
        // Step 1: Send magic code to email
        await sendMagicCode(email);
        setShowCodeInput(true);
        setIsLoading(false);
      } else {
        // Step 2: Sign in with magic code
        await signInWithMagicCode(email, code);
        // Redirect will happen automatically via useEffect when user is set
      }
    } catch (err: any) {
      // Handle authorization errors
      const errorMessage =
        err.message || "Authentication failed. Please try again.";

      if (
        errorMessage.includes("not authorized") ||
        errorMessage.includes("not found")
      ) {
        setError(
          "This email is not authorized to access the system. Please contact an administrator."
        );
      } else if (
        errorMessage.includes("Invalid code") ||
        errorMessage.includes("code")
      ) {
        setError(
          "Invalid verification code. Please check your email and try again."
        );
      } else {
        setError(errorMessage);
      }

      console.error("Auth error:", err);
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowCodeInput(false);
    setCode("");
    setError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#080b14] relative overflow-hidden">
        {/* Ultra Modern Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs - Depth Layer */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[90px] animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Mesh Gradient Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500/20 via-transparent to-blue-500/20"></div>
          </div>

          {/* Flowing Wave Lines - Modern Abstract */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 800"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Advanced Gradient Definitions */}
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="wave3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </linearGradient>

              {/* Glow Effects */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter
                id="softGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Flowing Wave Paths */}
            <path
              d="M0,400 Q250,300 500,350 T1000,300 L1000,800 L0,800 Z"
              fill="url(#wave1)"
              opacity="0.3"
            >
              <animate
                attributeName="d"
                dur="20s"
                repeatCount="indefinite"
                values="
                  M0,400 Q250,300 500,350 T1000,300 L1000,800 L0,800 Z;
                  M0,350 Q250,400 500,300 T1000,350 L1000,800 L0,800 Z;
                  M0,400 Q250,300 500,350 T1000,300 L1000,800 L0,800 Z"
              />
            </path>

            <path
              d="M0,500 Q250,450 500,500 T1000,450 L1000,800 L0,800 Z"
              fill="url(#wave2)"
              opacity="0.2"
            >
              <animate
                attributeName="d"
                dur="15s"
                repeatCount="indefinite"
                values="
                  M0,500 Q250,450 500,500 T1000,450 L1000,800 L0,800 Z;
                  M0,450 Q250,500 500,450 T1000,500 L1000,800 L0,800 Z;
                  M0,500 Q250,450 500,500 T1000,450 L1000,800 L0,800 Z"
              />
            </path>

            <path
              d="M0,600 Q250,550 500,600 T1000,550 L1000,800 L0,800 Z"
              fill="url(#wave3)"
              opacity="0.15"
            >
              <animate
                attributeName="d"
                dur="25s"
                repeatCount="indefinite"
                values="
                  M0,600 Q250,550 500,600 T1000,550 L1000,800 L0,800 Z;
                  M0,550 Q250,600 500,550 T1000,600 L1000,800 L0,800 Z;
                  M0,600 Q250,550 500,600 T1000,550 L1000,800 L0,800 Z"
              />
            </path>

            {/* Network Nodes and Connections */}
            <g filter="url(#glow)" opacity="0.4">
              {/* Connection Lines */}
              <line
                x1="100"
                y1="200"
                x2="300"
                y2="150"
                stroke="#60a5fa"
                strokeWidth="1"
                opacity="0.3"
              />
              <line
                x1="300"
                y1="150"
                x2="500"
                y2="250"
                stroke="#60a5fa"
                strokeWidth="1"
                opacity="0.3"
              />
              <line
                x1="500"
                y1="250"
                x2="700"
                y2="180"
                stroke="#60a5fa"
                strokeWidth="1"
                opacity="0.3"
              />
              <line
                x1="700"
                y1="180"
                x2="900"
                y2="220"
                stroke="#60a5fa"
                strokeWidth="1"
                opacity="0.3"
              />

              <line
                x1="150"
                y1="400"
                x2="400"
                y2="350"
                stroke="#8b5cf6"
                strokeWidth="1"
                opacity="0.3"
              />
              <line
                x1="400"
                y1="350"
                x2="650"
                y2="400"
                stroke="#8b5cf6"
                strokeWidth="1"
                opacity="0.3"
              />
              <line
                x1="650"
                y1="400"
                x2="850"
                y2="360"
                stroke="#8b5cf6"
                strokeWidth="1"
                opacity="0.3"
              />

              {/* Data Nodes */}
              <circle cx="100" cy="200" r="6" fill="#60a5fa" opacity="0.8">
                <animate
                  attributeName="r"
                  values="6;8;6"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="300" cy="150" r="5" fill="#3b82f6" opacity="0.7">
                <animate
                  attributeName="r"
                  values="5;7;5"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="500" cy="250" r="7" fill="#6366f1" opacity="0.8">
                <animate
                  attributeName="r"
                  values="7;9;7"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="700" cy="180" r="6" fill="#8b5cf6" opacity="0.7">
                <animate
                  attributeName="r"
                  values="6;8;6"
                  dur="4.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="900" cy="220" r="5" fill="#a78bfa" opacity="0.6">
                <animate
                  attributeName="r"
                  values="5;7;5"
                  dur="3.8s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle cx="150" cy="400" r="5" fill="#06b6d4" opacity="0.7">
                <animate
                  attributeName="r"
                  values="5;7;5"
                  dur="4.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="400" cy="350" r="6" fill="#0ea5e9" opacity="0.8">
                <animate
                  attributeName="r"
                  values="6;8;6"
                  dur="3.6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="650" cy="400" r="5" fill="#6366f1" opacity="0.6">
                <animate
                  attributeName="r"
                  values="5;7;5"
                  dur="4.4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="850" cy="360" r="6" fill="#8b5cf6" opacity="0.7">
                <animate
                  attributeName="r"
                  values="6;8;6"
                  dur="3.3s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            {/* Flowing Particles */}
            <g filter="url(#softGlow)" opacity="0.5">
              <circle cx="200" cy="300" r="3" fill="#60a5fa">
                <animateMotion
                  path="M0,0 Q100,-50 200,0 T400,0"
                  dur="10s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle cx="600" cy="400" r="2" fill="#8b5cf6">
                <animateMotion
                  path="M0,0 Q-100,50 -200,0 T-400,0"
                  dur="12s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle cx="400" cy="200" r="2.5" fill="#06b6d4">
                <animateMotion
                  path="M0,0 Q50,100 0,200 T0,400"
                  dur="15s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="15s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            {/* Abstract Data Bars */}
            <g opacity="0.2" filter="url(#glow)">
              <rect
                x="50"
                y="650"
                width="8"
                height="120"
                fill="#3b82f6"
                rx="4"
                opacity="0.6"
              />
              <rect
                x="150"
                y="620"
                width="8"
                height="150"
                fill="#6366f1"
                rx="4"
                opacity="0.5"
              />
              <rect
                x="250"
                y="680"
                width="8"
                height="90"
                fill="#8b5cf6"
                rx="4"
                opacity="0.7"
              />
              <rect
                x="350"
                y="640"
                width="8"
                height="130"
                fill="#06b6d4"
                rx="4"
                opacity="0.6"
              />
              <rect
                x="450"
                y="670"
                width="8"
                height="100"
                fill="#3b82f6"
                rx="4"
                opacity="0.5"
              />
              <rect
                x="550"
                y="630"
                width="8"
                height="140"
                fill="#6366f1"
                rx="4"
                opacity="0.6"
              />
              <rect
                x="650"
                y="690"
                width="8"
                height="80"
                fill="#8b5cf6"
                rx="4"
                opacity="0.7"
              />
              <rect
                x="750"
                y="650"
                width="8"
                height="120"
                fill="#06b6d4"
                rx="4"
                opacity="0.5"
              />
              <rect
                x="850"
                y="640"
                width="8"
                height="130"
                fill="#3b82f6"
                rx="4"
                opacity="0.6"
              />
              <rect
                x="950"
                y="670"
                width="8"
                height="100"
                fill="#6366f1"
                rx="4"
                opacity="0.5"
              />
            </g>
          </svg>

          {/* Floating Light Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  background: ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4"][
                    Math.floor(Math.random() * 4)
                  ],
                  opacity: Math.random() * 0.3 + 0.1,
                  animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 5}s`,
                  boxShadow: "0 0 10px currentColor",
                }}
              />
            ))}
          </div>

          {/* Sophisticated Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080b14]/95 via-transparent to-[#080b14]/90"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#080b14]/60 via-transparent to-[#080b14]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-transparent to-transparent"></div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translate(0, 0);
            }
            33% {
              transform: translate(30px, -30px);
            }
            66% {
              transform: translate(-20px, 20px);
            }
          }
        `}</style>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="4" width="6" height="6" fill="white" rx="1" />
                <rect x="14" y="4" width="6" height="6" fill="white" rx="1" />
              </svg>
            </div>
            <span className="text-white text-xl font-semibold">LumoTrade</span>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                Trade at the
                <br />
                <span className="text-blue-500">Speed of Light</span>.
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Access real-time market data, advanced charting tools, and a
                global community of traders. Your dashboard awaits.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-12">
              <div>
                <div className="text-3xl font-bold text-white">2.4M+</div>
                <div className="text-gray-400 text-sm">Active Traders</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">$40B+</div>
                <div className="text-gray-400 text-sm">Quarterly Volume</div>
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div></div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0a0f1e]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="4" width="6" height="6" fill="white" rx="1" />
                <rect x="14" y="4" width="6" height="6" fill="white" rx="1" />
              </svg>
            </div>
            <span className="text-white text-xl font-semibold">LumoTrade</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Title - Sign Up Disabled */}
          <div className="mb-8 border-b border-gray-800 pb-3">
            <div className="text-sm font-medium text-blue-500">
              Log In
              <div className="h-0.5 bg-blue-500 mt-3"></div>
            </div>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-red-400 text-sm mb-3">
                {error || authError}
              </div>
              <button
                onClick={() => {
                  setError("");
                  setShowCodeInput(false);
                  setCode("");
                  setEmail("");
                }}
                className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* Success Message */}
          {showCodeInput && !error && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              📧 Check your email! We sent a code to {email}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={showCodeInput}
                  className="w-full bg-[#1a2332] border border-gray-700 rounded-lg px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Code Input (shown after email is sent) */}
            {showCodeInput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    Use different email
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                    className="w-full bg-[#1a2332] border border-gray-700 rounded-lg px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{showCodeInput ? "Verify Code" : "Send Code"}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.3335 8H12.6668M12.6668 8L8.00016 3.33333M12.6668 8L8.00016 12.6667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-blue-500 hover:text-blue-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-500 hover:text-blue-400">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
