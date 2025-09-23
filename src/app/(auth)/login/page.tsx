"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { authApi } from "@/lib/api";
import { ROUTES, STORAGE_KEYS, USER_TYPES } from "@/lib/constants";
import type { LoginRequest } from "@/types/auth";

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest & { userType: string }>({
    email: "",
    password: "",
    userType: USER_TYPES.COMPANY
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      let response;
      
      if (formData.userType === USER_TYPES.COMPANY) {
        response = await authApi.companyLogin({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await authApi.employeeLogin({
          email: formData.email,
          password: formData.password
        });
      }

      // Store authentication data
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, response.userType);

      // Redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Hisaab
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your business with ease
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Login as
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={USER_TYPES.COMPANY}>Company</option>
              <option value={USER_TYPES.EMPLOYEE}>Employee</option>
            </select>
          </div>

          <Input
            label="Email address"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center">
            <Link 
              href={ROUTES.SIGNUP}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Don't have a company account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}