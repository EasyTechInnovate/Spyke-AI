'use client'

import { Bell, Menu, Search } from 'lucide-react'

export default function AdminHeader({ setSidebarOpen, currentPath }) {
  const getPageTitle = () => {
    const titles = {
      '/admin/dashboard': 'Dashboard Overview',
      '/admin/sellers/pending': 'Pending Seller Approvals',
      '/admin/sellers/active': 'Active Sellers',
      '/admin/sellers/payouts': 'Payout Tracking',
    }
    return titles[currentPath] || 'Admin Panel'
  }

  return (
    <header className="bg-[#1f1f1f] border-b border-[#00FF89]/10 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold font-league-spartan text-white">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#00FF89]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent font-kumbh-sans"
            />
          </div>
          
          <button className="relative p-2 text-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="w-8 h-8 bg-[#00FF89] rounded-full flex items-center justify-center text-[#121212] font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  )
}