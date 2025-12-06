// components/layout/Sidebar.tsx
"use client";

import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  BarChart3, 
  Settings,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Chat IA", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Diário", href: "/dashboard/diary", icon: BookOpen },
  { name: "Análises", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              Mentor Trader
            </span>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div className="ml-3">
                  <div className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    <LogOut className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Sair
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


