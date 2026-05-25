import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminSidebar } from "./sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventTix Admin",
  description: "Admin dashboard for EventTix",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 bg-muted/30 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
