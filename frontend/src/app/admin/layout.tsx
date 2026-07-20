"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      // Allow development preview if admin_token not set yet, or redirect to admin login
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initializing Super Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Super Admin Navigation Sidebar */}
      <AdminSidebar />

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
