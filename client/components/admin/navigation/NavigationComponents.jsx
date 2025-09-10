'use client'

import { memo, useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { LoadingBadge } from '../ui/CoreComponents'

// Custom hook for measured height
function useMeasuredHeight(open) {
  const ref = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight)
    }
  }, [open])

  return { ref, height }
}

// Helper to match paths
const matchPath = (path, target) => {
  if (!path || !target) return false
  if (path === target) return true
  try {
    const u = new URL(target, 'https://x')
    const t = new URL(path, 'https://x')
    return t.pathname.startsWith(u.pathname)
  } catch {
    return path.startsWith(target)
  }
}

// Navigation Item Component
export const NavigationItem = memo(({ 
  item, 
  isActive, 
  isExpanded, 
  onToggle, 
  onItemClick, 
  isCollapsed, 
  loadingCounts, 
  currentPath,
  comingSoon = false
}) => {
  const Icon = item.icon
  const isGroup = !!item.subItems
  const { ref, height } = useMeasuredHeight(isExpanded)

  if (!isGroup) {
    return (
      <div key={item.id}>
        {comingSoon ? (
          <div
            className={`group flex items-center rounded-2xl text-white/30 cursor-not-allowed transition-all duration-300 ${
              isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-4 py-3'
            }`}
            title={isCollapsed ? `${item.label} - Coming Soon` : undefined}>
            <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
              <Icon className="w-4 h-4" />
              <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                {item.label}
              </span>
            </div>
            <span
              className={`px-2 py-1 text-xs bg-white/5 text-white/40 rounded-lg font-medium transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
              Soon
            </span>
          </div>
        ) : (
          <Link
            href={item.href}
            onClick={onItemClick}
            className={`group flex items-center rounded-2xl transition-all duration-300 ${
              isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-3'
            } ${isActive ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            title={isCollapsed ? item.label : undefined}>
            <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
              {item.label}
            </span>
            {!isCollapsed && item.badge && (
              <LoadingBadge
                count={item.badge}
                loading={loadingCounts}
              />
            )}
          </Link>
        )}
      </div>
    )
  }

  return (
    <div key={item.id} className="space-y-1">
      <button
        onClick={() => onToggle(item.id)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle(item.id)}
        aria-expanded={isExpanded}
        className={`group w-full flex items-center rounded-2xl transition-all duration-300 ${
          isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-4 py-3'
        } ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        title={isCollapsed ? item.label : undefined}>
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
          <Icon className="w-4 h-4" />
          <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
            {item.label}
          </span>
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            {item.badge && (
              <LoadingBadge
                count={item.badge}
                loading={loadingCounts}
              />
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        )}
      </button>

      {!isCollapsed && (
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: isExpanded ? height : 0 }}>
          <div ref={ref} className="pl-4 space-y-1 pt-1">
            {item.subItems.map((sub) => {
              const activeSub = matchPath(currentPath, sub.href)
              return (
                <Link
                  key={sub.id}
                  href={sub.href}
                  onClick={onItemClick}
                  className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    activeSub
                      ? 'bg-[#00FF89]/20 text-[#00FF89] border-l-2 border-[#00FF89]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                  <span className="text-sm font-medium tracking-tight">{sub.label}</span>
                  {sub.badge && (
                    <LoadingBadge
                      count={sub.badge}
                      loading={loadingCounts}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
})
NavigationItem.displayName = 'NavigationItem'

// Navigation Section Component
export const NavigationSection = memo(({ 
  items, 
  expandedMenus, 
  onToggle, 
  onItemClick, 
  isCollapsed, 
  loadingCounts, 
  currentPath,
  comingSoonItems = new Set()
}) => {
  return (
    <nav className={`flex-1 min-h-0 overflow-y-auto py-2 space-y-1 transition-all duration-300 custom-scrollbar ${isCollapsed ? 'px-2' : 'px-4'}`}>
      {items.map((item) => {
        const isExpanded = expandedMenus.includes(item.id)
        const isActive = comingSoonItems.has(item.id)
          ? false
          : item.href
            ? matchPath(currentPath, item.href)
            : item.subItems?.some((s) => matchPath(currentPath, s.href))

        return (
          <NavigationItem
            key={item.id}
            item={item}
            isActive={isActive}
            isExpanded={isExpanded}
            onToggle={onToggle}
            onItemClick={onItemClick}
            isCollapsed={isCollapsed}
            loadingCounts={loadingCounts}
            currentPath={currentPath}
            comingSoon={comingSoonItems.has(item.id)}
          />
        )
      })}
    </nav>
  )
})
NavigationSection.displayName = 'NavigationSection'