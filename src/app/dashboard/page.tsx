"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const userTypeData = localStorage.getItem("userType");

      if (!token) {
        router.push("/login");
        return;
      }

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
      }
      
      if (userTypeData) {
        setUserType(userTypeData);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      router.push("/login");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Hisaab Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.name} ({userType})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">
              Welcome, {user.name}!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {/* Company-specific cards */}
              {userType === "company" && (
                <>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Company Management</h3>
                    <p className="text-gray-600 mb-4">View and manage company information</p>
                    <Link
                      href="/companies"
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-block text-center"
                    >
                      Manage Companies
                    </Link>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Employees</h3>
                    <p className="text-gray-600 mb-4">Manage your employees</p>
                    <Link
                      href="/employees"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block text-center"
                    >
                      View Employees
                    </Link>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Roles & Permissions</h3>
                    <p className="text-gray-600 mb-4">Manage roles and permissions</p>
                    <Link
                      href="/roles"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block text-center"
                    >
                      Manage Roles
                    </Link>
                  </div>
                </>
              )}

              {/* Employee-specific cards */}
              {userType === "employee" && (
                <>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Team</h3>
                    <p className="text-gray-600 mb-4">View your team members</p>
                    <Link
                      href="/employees"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block text-center"
                    >
                      View Team
                    </Link>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">My Role</h3>
                    <p className="text-gray-600 mb-4">View your role and permissions</p>
                    <Link
                      href="/roles"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block text-center"
                    >
                      View Roles
                    </Link>
                  </div>
                </>
              )}

              {/* Common cards for both company and employee */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Accounts</h3>
                <p className="text-gray-600 mb-4">View accounting data</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  View Accounts
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Ledger</h3>
                <p className="text-gray-600 mb-4">Manage ledger entries</p>
                <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                  View Ledger
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Stock</h3>
                <p className="text-gray-600 mb-4">Manage inventory</p>
                <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                  View Stock
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Reports</h3>
                <p className="text-gray-600 mb-4">Generate reports</p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}