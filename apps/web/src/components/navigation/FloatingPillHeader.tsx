import React, { useState } from 'react';
import {
  LogOut,
  ExternalLink,
  ArrowRight,
  Shield,
  Sun,
  Moon,
  RefreshCw,
  Home,
  UserCheck,
  Clock,
  CreditCard,
  Lightbulb,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { AdminAccount } from '@sim-warga/types';

export interface FloatingPillHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentAdmin: AdminAccount | null;
  onOpenLoginModal: () => void;
  onOpenAccountModal: () => void;
  onLogout: () => void;
  onOpenBayarModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSyncSheet?: () => void;
  isSyncingSheet?: boolean;
}

export const FloatingPillHeader: React.FC<FloatingPillHeaderProps> = ({
  activeTab,
  onSelectTab,
  currentAdmin,
  onOpenLoginModal,
  onOpenAccountModal,
  onLogout,
  onOpenBayarModal,
  isDarkMode,
  onToggleTheme,
  onSyncSheet,
  isSyncingSheet = false,
}) => {
  const isAdmin = !!currentAdmin;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'warga', label: 'Data Warga', icon: UserCheck },
    { id: 'ronda', label: 'Jadwal Ronda', icon: Clock },
    { id: 'ipl', label: 'Iuran IPL', icon: CreditCard },
    { id: 'urunan', label: 'Urunan PJU', icon: Lightbulb },
    { id: 'pengumuman', label: 'Pengumuman', icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4F7FC]/85 dark:bg-[#070C18]/85 backdrop-blur-xl border-b border-blue-900/[0.06] dark:border-blue-500/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* 1. LEFT: NEXORA 4-TILE BLUE GRID LOGO + SIM-WARGA */}
        <div
          onClick={() => {
            onSelectTab('beranda');
            setMobileMenuOpen(false);
          }}
          className="cursor-pointer flex items-center gap-2.5 flex-shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0B484C] ring-2 ring-[#D9B352]/60 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/logo-pesona-kahuripan.png"
              alt="Pesona Kahuripan"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight">
              SIM-Warga
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0B484C]/10 text-[#0B484C] dark:text-[#F3D37A]">
              Paguyuban PK8
            </span>
          </div>
        </div>

        {/* 2. CENTER: CLEAN NEXORA ARCHITECTURAL TEXT LINKS */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`text-sm transition-colors whitespace-nowrap relative py-1.5 ${
                  isActive
                    ? 'text-[#2563EB] dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-[#2563EB]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. RIGHT: LOG IN & PRIMARY BLUE PILL CTA ("Get started ->" style) */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-blue-500/10 transition-colors"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {onSyncSheet && (
            <button
              type="button"
              onClick={onSyncSheet}
              disabled={isSyncingSheet}
              className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 hover:bg-blue-500/10 transition-colors"
              title="Sinkronkan Google Sheets"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingSheet ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <a
                href="https://docs.google.com/spreadsheets/d/1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0/edit"
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-full bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 border border-blue-200/80 dark:border-slate-700 shadow-2xs"
              >
                <span>Sheets</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={onOpenAccountModal}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{currentAdmin?.nama.split(' ')[0] || 'Admin'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                title="Keluar dari Akun Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3.5 sm:gap-5">
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#2563EB] transition-colors whitespace-nowrap"
              >
                Log in
              </button>

              <button
                type="button"
                onClick={onOpenBayarModal}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-600/25 transition-all group whitespace-nowrap"
              >
                <span>Bayar IPL</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            title="Menu Navigasi"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-[#0B1329]/95 backdrop-blur-xl px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-left transition-all ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
