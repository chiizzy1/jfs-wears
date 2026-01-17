"use client";

import Link from "next/link";
import { adminNavItems } from "./constants";

interface AdminSidebarProps {
  pathname: string;
  onSelect?: () => void;
}

/**
 * Admin Sidebar Component
 * Renders the desktop sidebar with navigation items
 */
export function AdminSidebar({ pathname, onSelect }: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-100">
        <Link href="/admin" className="block">
          <span className="text-lg tracking-[0.2em] uppercase font-medium text-primary">JFS WEARS</span>
          <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Admin Panel</p>
        </Link>
      </div>

      <nav className="p-4 flex-1 overflow-y-auto" data-lenis-prevent>
        <ul className="space-y-1">
          {adminNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onSelect}
                className={`flex items-center gap-3 px-6 py-4 text-sm transition-colors ${
                  pathname === item.href ? "bg-black text-white" : "text-primary hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span className="text-xs uppercase tracking-widest">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-widest text-gray-500 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Store
        </Link>
      </div>
    </div>
  );
}
