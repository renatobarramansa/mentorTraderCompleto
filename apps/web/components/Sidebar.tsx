"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/chat", label: "Chat Mentor", icon: <MessageSquare size={20} /> },
    { href: "/diary", label: "Diário", icon: <BookOpen size={20} /> },
    { href: "/dashboard", label: "Dashboard", icon: <BarChart3 size={20} /> },
    { href: "/settings", label: "Configurações", icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">🐣 Mentor Trader</h1>
        <p className="text-gray-400 text-sm mt-1">Seu mentor 24/7</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-800 rounded-lg w-full">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
