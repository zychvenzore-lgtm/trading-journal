/**
 * ============================================================
 * DASHBOARD LAYOUT — Main app shell with sidebar + navbar
 * Wraps all /dashboard/* pages with persistent navigation.
 * ============================================================
 */
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import RightSidebar from '@/components/RightSidebar';
import RightToolbar, { RightPanelType } from '@/components/RightToolbar';
import BottomBar from '@/components/BottomBar';
import WelcomeSetup from '@/components/WelcomeSetup';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /** Mobile sidebar visibility state */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  /** Desktop left sidebar collapsed state */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  /** Right settings sidebar state */
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanelType>('NONE');

  // Initialize global achievement notification listener
  useAchievementNotifications();

  useEffect(() => {
    const handleOpenOrderPanel = () => setActiveRightPanel('ORDER');
    const handleOpenSettingsPanel = () => setActiveRightPanel('SETTINGS');
    
    window.addEventListener('open-trade-form', handleOpenOrderPanel);
    window.addEventListener('open-settings-panel', handleOpenSettingsPanel);
    
    return () => {
      window.removeEventListener('open-trade-form', handleOpenOrderPanel);
      window.removeEventListener('open-settings-panel', handleOpenSettingsPanel);
    };
  }, []);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-base-900 text-text-primary">
      {/* ---- Top Navbar ---- */}
      <div className="shrink-0 z-20 relative">
        <Navbar 
          onMenuToggle={() => setSidebarOpen(true)} 
        />
      </div>

      {/* ---- Middle Workspace ---- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar */}
        <Sidebar 
          mobileOpen={sidebarOpen} 
          onMobileClose={() => setSidebarOpen(false)} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Center Canvas (Ledger/Dashboard) */}
        <main className="flex-1 overflow-y-auto bg-base-900 transition-all duration-300 ease-in-out relative min-w-0">
          {children}
        </main>

        {/* Right Drawer (Order Panel) */}
        <RightSidebar 
          activePanel={activeRightPanel} 
          onClose={() => setActiveRightPanel('NONE')} 
        />

        {/* Right Toolbar (Icons) */}
        <RightToolbar 
          activePanel={activeRightPanel}
          onTogglePanel={setActiveRightPanel}
        />
      </div>

      {/* ---- Bottom Bar ---- */}
      <BottomBar />

      {/* ---- Welcome Setup for New Users ---- */}
      <WelcomeSetup />
    </div>
  );
}
