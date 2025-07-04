import React, { useState } from 'react';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Star, 
  MessageSquare, 
  Wallet, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Importing your logo component (adjust import path as needed)
// import { SpykeLogo, SpykeLogoCompact } from '@/components/ui/logo';

// For demo purposes, I'll create a placeholder logo component
const SpykeLogo = ({ size = 40, className = "", showText = true, textSize = "text-xl" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-lg bg-[#00FF89] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#121212]" />
        </div>
      </div>
      {showText && (
        <div>
          <span className={`${textSize} font-bold text-[#00FF89] font-[var(--font-league-spartan)]`}>
            Spyke AI
          </span>
          <div className="text-xs text-gray-500 font-[var(--font-kumbh-sans)]">
            by FutureDesks
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedSidebar = ({ currentPath = '/dashboard' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Star, label: 'Reviews', path: '/reviews' },
    { icon: MessageSquare, label: 'Messages', path: '/messages', badge: 3 },
    { icon: Wallet, label: 'Payouts', path: '/payouts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <div className="h-screen bg-[#1a1a1a] border-r border-gray-800 flex flex-col relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#00FF89]/5 to-transparent pointer-events-none"></div>
        
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-[#1f1f1f] border border-[#00FF89]/20 rounded-full flex items-center justify-center hover:bg-[#00FF89] hover:border-[#00FF89] group transition-all duration-200 z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-[#00FF89] group-hover:text-[#121212]" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-[#00FF89] group-hover:text-[#121212]" />
          )}
        </button>

        {/* Logo Section */}
        <div className="p-6 pb-2">
          <SpykeLogo 
            size={isCollapsed ? 40 : 40} 
            showText={!isCollapsed}
            className="transition-all duration-300"
          />
        </div>

        {/* User Profile Section */}
        <div className={`px-6 py-4 border-b border-[#00FF89]/10 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF89] to-[#FFC050] flex items-center justify-center">
              <span className="text-[#121212] font-bold text-sm">AP</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h3 className="text-[#00FF89] font-semibold font-[var(--font-league-spartan)]">
                  Anand Pandey
                </h3>
                <p className="text-xs text-gray-500 font-[var(--font-kumbh-sans)]">Premium Seller</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              const isHovered = hoveredItem === item.path;

              return (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-[#00FF89] text-[#121212]' 
                        : 'text-gray-400 hover:bg-[#00FF89]/10 hover:text-[#00FF89]'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                      relative overflow-hidden group
                    `}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Hover effect */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r from-[#00FF89]/0 via-[#00FF89]/10 to-[#00FF89]/0
                      transform -translate-x-full group-hover:translate-x-full transition-transform duration-700
                      ${isActive ? 'hidden' : ''}
                    `}></div>

                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-[#121212]' : ''}`} />
                    
                    {!isCollapsed && (
                      <>
                        <span className={`
                          font-[var(--font-kumbh-sans)] relative z-10
                          ${isActive ? 'font-semibold' : ''}
                        `}>
                          {item.label}
                        </span>
                        
                        {item.badge && (
                          <span className="ml-auto bg-[#FFC050] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && isHovered && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[#1f1f1f] text-[#00FF89] text-sm rounded-md whitespace-nowrap z-50 border border-[#00FF89]/20">
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 text-[#FFC050]">({item.badge})</span>
                        )}
                      </div>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Stats Section (visible when not collapsed) */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-t border-[#00FF89]/10">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[#FFC050] text-lg font-bold">124</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div>
                <p className="text-[#00FF89] text-lg font-bold">4.9</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div>
                <p className="text-[#FFC050] text-lg font-bold">2.3k</p>
                <p className="text-xs text-gray-500">Sales</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 border-t border-[#00FF89]/10">
          <button
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
              text-gray-400 hover:bg-red-500/10 hover:text-red-400
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-[var(--font-kumbh-sans)]">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Export the sidebar component with the name you're using
export const SellerSidebar = EnhancedSidebar;

// Also export as default for flexibility
export default EnhancedSidebar;
