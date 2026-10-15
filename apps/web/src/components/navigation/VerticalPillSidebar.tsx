import React from 'react';
import {
  Home,
  Users,
  Shield,
  CreditCard,
  Megaphone,
} from 'lucide-react';

export interface VerticalPillSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAdmin: boolean;
}

export const VerticalPillSidebar: React.FC<VerticalPillSidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const items = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'warga', label: 'Warga', icon: Users },
    { id: 'ronda', label: 'Ronda', icon: Shield },
    { id: 'ipl', label: 'IPL', icon: CreditCard },
    { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
  ];

  return (
    <>
      {/* Desktop Vertical Pill (Floating on the left) */}
      <aside className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 bg-white/95 backdrop-blur-md border border-stone-200/90 py-4 px-2.5 rounded-full shadow-lg shadow-stone-900/5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[#1C1917] text-white shadow-md'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              {/* Tooltip on hover */}
              <span className="absolute left-14 bg-[#1C1917] text-white text-xs font-medium px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
                {item.label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Mobile Floating Bottom Bar */}
      <nav className="lg:hidden fixed bottom-4 inset-x-4 z-50 flex items-center justify-around bg-white/95 backdrop-blur-md border border-stone-200/90 py-2.5 px-4 rounded-full shadow-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-full transition-colors ${
                isActive
                  ? 'text-[#0F3327] font-semibold'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
