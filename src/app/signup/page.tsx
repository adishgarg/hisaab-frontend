"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { authApi } from "@/lib/api";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";
import type { SignupRequest } from "@/types/auth";

export default function Signup() {
  const [formData, setFormData] = useState<SignupRequest & { confirmPassword: string }>({
    name: "",
    address: "",
    phone: "",
    email: "",
    GST: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = (): boolean => {
    // Check required fields
    const requiredFields = ['name', 'address', 'phone', 'email', 'GST', 'password', 'confirmPassword'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    // GST validation (basic format check)
    if (formData.GST.length < 15) {
      setError("GST number must be at least 15 characters");
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
      const signupData: SignupRequest = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        GST: formData.GST,
        password: formData.password
      };

      const response = await authApi.companySignup(signupData);

      // Store authentication data
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, response.userType);

      // Redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Company Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Hisaab and manage your business efficiently
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Company Name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your company name"
            />

            <Input
              label="Address"
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your company address"
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              helperText="Enter a 10-digit phone number"
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
            />

            <Input
              label="GST Number"
              type="text"
              name="GST"
              required
              value={formData.GST}
              onChange={handleInputChange}
              placeholder="Enter your GST number"
              helperText="15-digit GST identification number"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              helperText="Minimum 6 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <Link 
              href={ROUTES.LOGIN}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}