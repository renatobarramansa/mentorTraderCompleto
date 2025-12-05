import { Inter } from "next/font/google";
//import "../app/globals.css";


import Sidebar from "../../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
