import React from 'react';
import { FileText, Image, Share2, Settings, ChevronRight } from 'lucide-react';

type AdminSection = 'content' | 'media' | 'social' | 'settings';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'content', label: 'Content', icon: <FileText size={16} /> },
  { id: 'media', label: 'Media', icon: <Image size={16} /> },
  { id: 'social', label: 'Social', icon: <Share2 size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className="w-52 flex-shrink-0 border-r border-foreground/8 min-h-[calc(100vh-4rem)] py-8 px-4">
      <p className="text-xs uppercase tracking-widest opacity-40 mb-4 px-2">Dashboard</p>
      <nav className="space-y-0.5">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center justify-between px-2 py-2 text-sm transition-colors ${
              activeSection === item.id
                ? 'bg-foreground text-background'
                : 'text-foreground/70 hover:text-foreground hover:bg-foreground/6'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {item.icon}
              {item.label}
            </span>
            {activeSection === item.id && (
              <ChevronRight size={12} />
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
