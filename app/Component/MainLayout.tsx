"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex relative">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 min-h-screen w-72 bg-gray-800 text-white z-50 transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:translate-x-0 md:block`}
      >
        <div className="p-4 text-2xl font-bold">TaskTide</div>
        <nav className="flex flex-col space-y-2 px-4">
          <Link href="/" className="hover:underline">Dashboard</Link>
          <Link href="/calendar" className="hover:underline">Calendar</Link>
        </nav>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 md:hidden"
        >
          <X />
        </button>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        ></div>
      )}

      {/* Hamburger Icon */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden p-2 text-xl fixed top-4 left-4 bg-white rounded z-50"
      >
        <Menu />
      </button>

      {/* Main Content */}
      <main
        className={`p-4 w-full transition-all duration-300
        ${isSidebarOpen ? "ml-72" : ""} md:ml-64 mt-16 md:mt-0`}
      >
        {children}
      </main>
    </div>
  );
}
