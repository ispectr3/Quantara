import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NotificationsBell } from "./NotificationsBell";
import { UserPreferences } from "./UserPreferences";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { Footer } from "./Footer";
import { PageTransition } from "./PageTransition";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-72 max-w-[85vw] bg-sidebar shadow-2xl">
            <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="absolute top-3 right-3 z-20 size-8 grid place-items-center rounded-md border border-border bg-card">
              <X className="size-4" />
            </button>
            <div onClick={() => setMobileOpen(false)} className="h-full">
              <Sidebar mobile />
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 lg:px-10 h-16">
            <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu" className="lg:hidden size-9 grid place-items-center rounded-md border border-border bg-card hover:bg-accent/40">
              <Menu className="size-4" />
            </button>
            <div className="flex-1" />
            <NotificationsBell />
            <LanguageToggle />
            <ThemeToggle />
            <UserPreferences />
          </div>
        </header>
        <main className="px-4 lg:px-10 py-8 max-w-[1400px]">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
    </div>
  );
}
