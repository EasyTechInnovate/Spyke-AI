import dynamic from 'next/dynamic'

// Map of commonly used icons - preloaded
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Star,
  Home,
  Package,
  Settings,
  LogOut
} from 'lucide-react'

// Preloaded icons (most commonly used)
const preloadedIcons = {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Star,
  Home,
  Package,
  Settings,
  LogOut
}

// Dynamically import less common icons
const dynamicIcons = {
  // Authentication
  Lock: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Lock }))),
  Mail: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Mail }))),
  Eye: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Eye }))),
  EyeOff: dynamic(() => import('lucide-react').then(mod => ({ default: mod.EyeOff }))),
  
  // Actions
  Edit: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Edit }))),
  Trash: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Trash }))),
  Plus: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Plus }))),
  Minus: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Minus }))),
  
  // Status
  CheckCircle: dynamic(() => import('lucide-react').then(mod => ({ default: mod.CheckCircle }))),
  AlertCircle: dynamic(() => import('lucide-react').then(mod => ({ default: mod.AlertCircle }))),
  Info: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Info }))),
  
  // Social
  Github: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Github }))),
  Twitter: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Twitter }))),
  Linkedin: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Linkedin }))),
}

// Icon component that handles both preloaded and dynamic icons
export default function Icon({ name, ...props }) {
  // Check preloaded icons first
  if (preloadedIcons[name]) {
    const IconComponent = preloadedIcons[name]
    return <IconComponent {...props} />
  }
  
  // Check dynamic icons
  if (dynamicIcons[name]) {
    const DynamicIcon = dynamicIcons[name]
    return <DynamicIcon {...props} />
  }
  
  // Fallback
  console.warn(`Icon "${name}" not found in optimized icon set`)
  return <div className="w-5 h-5 bg-gray-700 rounded" />
}

// Export commonly used icons directly for better tree shaking
export {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Star,
  Home,
  Package,
  Settings,
  LogOut
}