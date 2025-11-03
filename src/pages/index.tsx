"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = isLogin
      ? "http://localhost:5000/auth/login"
      : "http://localhost:5000/auth/signup";

    try {
      const response = await axios.post(url, { email, password });
      localStorage.setItem("authToken", response.data.token);
      router.push("/search");
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f3f4]">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-md p-8 flex flex-col items-center">
        {/* Google-style logo area */}
        <div className="flex items-center space-x-2 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="36px"
            height="36px"
          >
            <path
              fill="#4285F4"
              d="M23.49 12.27c1.67 0 3.17.57 4.36 1.69l3.25-3.25C29.05 8.72 26.49 7.5 23.49 7.5c-4.82 0-8.93 2.74-10.98 6.74l3.84 2.97c1.03-2.81 3.75-4.94 7.14-4.94z"
            />
            <path
              fill="#34A853"
              d="M36.97 24.29c0-.88-.08-1.72-.22-2.53H23.49v4.78h7.57c-.33 1.78-1.32 3.29-2.79 4.3l4.31 3.34c2.52-2.33 4.39-5.75 4.39-9.89z"
            />
            <path
              fill="#FBBC05"
              d="M12.51 28.76c-.48-1.4-.75-2.9-.75-4.45s.27-3.05.75-4.45l-3.84-2.97C7.63 19.28 7 21.33 7 23.82s.63 4.54 1.67 6.93l3.84-2.97z"
            />
            <path
              fill="#EA4335"
              d="M23.49 40.15c3.18 0 5.86-1.05 7.81-2.86l-4.31-3.34c-1.2.8-2.75 1.27-4.5 1.27-3.39 0-6.11-2.13-7.14-4.94l-3.84 2.97c2.05 4 6.16 6.74 10.98 6.74z"
            />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isLogin ? "Sign in" : "Create your account"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email or phone"
            className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-md px-4 py-3 mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#1a73e8] hover:bg-[#155ab6] text-white py-3 rounded-md font-medium transition"
          >
            {isLogin ? "Next" : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center justify-between w-full my-4">
          <hr className="w-1/3 border-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <hr className="w-1/3 border-gray-300" />
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[#1a73e8] text-sm hover:underline"
        >
          {isLogin
            ? "Create account"
            : "Already have an account? Sign in"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-6">
        Protected by reCAPTCHA • Privacy • Terms
      </p>
    </div>
  );
}
