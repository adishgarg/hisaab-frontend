"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { NotificationBell } from '../NotificationBell';

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  userType: string;
}

export default function Navbar({ user, userType }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    router.push(ROUTES.LOGIN);
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: ROUTES.DASHBOARD,
      show: true
    },
    {
      name: 'Companies',
      href: ROUTES.COMPANIES,
      show: userType === 'company'
    },
    {
      name: 'Employees',
      href: ROUTES.EMPLOYEES,
      show: true
    },
    {
      name: 'Roles',
      href: ROUTES.ROLES,
      show: true
    }
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={ROUTES.DASHBOARD} className="text-xl font-semibold text-indigo-600">
              Hisaab
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {navItems
                .filter(item => item.show)
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            {user && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 text-gray-500">({userType})</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}