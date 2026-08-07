"use client";

import { SidebarProvider } from "./sidebar/sidebar-context";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-surface text-foreground w-full">
        <Sidebar />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header />
          <main className="flex-1 px-4 py-6 md:px-6 2xl:px-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
