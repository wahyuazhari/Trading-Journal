import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Images, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  TrendingUp,
  Cloud,
  LogOut,
  X,
  User as UserIcon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { NavigationPage } from '../../types';
import { loginWithGoogle, logoutUser } from '../../services/firebase';

interface SidebarProps {
  currentPage: NavigationPage;
  user: User | null;
  onNavigate: (page: NavigationPage) => void;
  activeTradeId?: string | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  user,
  onNavigate, 
  activeTradeId,
  mobileOpen = false,
  onCloseMobile
}) => {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isOpen = mobileOpen !== undefined ? mobileOpen : internalMobileOpen;

  const closeMenu = () => {
    if (onCloseMobile) onCloseMobile();
    else setInternalMobileOpen(false);
  };

  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal' as NavigationPage, label: 'Trading Journal', icon: BookOpen },
    ...(activeTradeId ? [{ id: 'trade-detail' as NavigationPage, label: 'Trade Detail', icon: FileText }] : []),
    { id: 'gallery' as NavigationPage, label: 'Screenshot Gallery', icon: Images },
    { id: 'analytics' as NavigationPage, label: 'Analytics', icon: BarChart3 },
    { id: 'risk' as NavigationPage, label: 'Risk Management', icon: ShieldAlert },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    closeMenu();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Slide-Over Drawer Container & Desktop Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto w-64 bg-[#0A0A0A] border-r border-[#2D2D2D] flex flex-col h-screen select-none shrink-0 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 lg:h-16 flex items-center justify-between px-5 border-b border-[#2D2D2D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF8E26] flex items-center justify-center text-white shadow-lg shadow-[#FF7A00]/20">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm lg:text-base tracking-wide flex items-center gap-1.5">
                TRADING JOURNAL <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF7A00]/15 text-[#FF7A00] font-semibold border border-[#FF7A00]/30">PRO</span>
              </h1>
              <p className="text-[10px] text-[#8B8B8B] tracking-wider font-medium uppercase">Firestore Cloud</p>
            </div>
          </div>

          <button 
            onClick={closeMenu}
            className="lg:hidden p-1.5 text-[#8B8B8B] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-[#151515] text-white shadow-sm font-bold'
                    : 'text-[#8B8B8B] hover:text-white hover:bg-[#151515]/60'
                }`}
              >
                {/* Active Orange Left Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF7A00] rounded-r-full shadow-[0_0_8px_#FF7A00]" />
                )}

                <Icon
                  className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors duration-150 ${
                    isActive ? 'text-[#FF7A00]' : 'text-[#8B8B8B] group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Account / Footer Info */}
        <div className="p-3.5 border-t border-[#2D2D2D] bg-[#070707] text-[11px] text-[#8B8B8B] space-y-2">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#FF7A00]/50" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center font-bold text-xs shrink-0">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-bold text-xs truncate leading-tight">
                    {user.displayName || 'Trader'}
                  </p>
                  <p className="text-[10px] text-[#8B8B8B] truncate font-mono">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => logoutUser()}
                className="p-1.5 text-[#8B8B8B] hover:text-[#F44336] hover:bg-[#151515] rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="w-full py-2 px-3 bg-[#151515] hover:bg-[#202020] border border-[#2D2D2D] rounded-lg text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Login with Google</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#1a1a1a]">
            <span className="flex items-center gap-1.5 text-[#8B8B8B]">
              <Cloud className={`w-3 h-3 ${user ? 'text-[#4CAF50]' : 'text-[#8B8B8B]'}`} />
              {user ? 'Firestore Connected' : 'Login Required'}
            </span>
            <span className="text-[9px] bg-[#202020] text-[#B8B8B8] px-1.5 py-0.5 rounded font-mono">v2.5 Cloud</span>
          </div>
        </div>
      </aside>
    </>
  );
};


