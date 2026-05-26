import { motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoading = useRouterState({ select: (s) => s.isLoading });

  if (isLoading) {
    return <div className="min-h-[45vh] animate-pulse rounded-xl border border-border bg-card/35" />;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0.92 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.08, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
}