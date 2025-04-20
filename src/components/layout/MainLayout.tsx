
import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AnimatePresence, motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [animationsEnabled] = useLocalStorage<boolean>("animationsEnabled", true);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <motion.main 
            initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
            animate={animationsEnabled ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.3 }}
            className="flex-1 p-4 md:p-6 overflow-auto"
          >
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
