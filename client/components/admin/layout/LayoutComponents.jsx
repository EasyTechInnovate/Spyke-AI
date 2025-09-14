'use client'

import { memo } from 'react'
import { Search, RefreshCw, Filter, Download, Plus } from 'lucide-react'
export const PageHeader = memo(({ 
  title, 
  subtitle, 
  actions = [], 
  breadcrumbs = [], 
  className = '',
  icon: Icon = null
}) => (
  <div className={`relative bg-gradient-to-br from-gray-900/90 via-gray-800/60 to-gray-900/80 border border-gray-700/40 rounded-2xl p-8 mb-8 overflow-hidden backdrop-blur-sm ${className}`}>
    {/* Subtle background pattern */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89]/5 via-transparent to-blue-500/5 opacity-50"></div>
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00FF89]/30 to-transparent"></div>
    
    <div className="relative z-10">
      {breadcrumbs.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="text-gray-500/60 mx-2 select-none">/</span>
                )}
                <span className={`transition-colors duration-200 ${
                  index === breadcrumbs.length - 1 
                    ? 'text-[#00FF89] font-medium' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}>
                  {crumb}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border border-[#00FF89]/20 rounded-xl flex items-center justify-center mt-1">
              <Icon className="w-6 h-6 text-[#00FF89]" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent mb-2 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400/90 text-lg leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions.map((action, index) => (
              <div key={index} className="transform transition-transform duration-200 hover:scale-105">
                {action}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    
    {/* Subtle bottom accent */}
    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>
  </div>
))
PageHeader.displayName = 'PageHeader'

// Quick Actions Bar Component
export const QuickActionsBar = memo(({ 
  searchValue, 
  onSearchChange, 
  onRefresh, 
  onFilter, 
  onExport, 
  onAdd,
  refreshing = false,
  placeholder = "Search...",
  className = '',
  children
}) => (
  children ? (
    <div className={`flex flex-col sm:flex-row justify-between gap-4 mb-6 ${className}`}>
      {children}
    </div>
  ) : (
    <div className={`flex flex-col sm:flex-row gap-3 mb-6 ${className}`}>
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
        />
      </div>
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-3 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
        {onFilter && (
          <button
            onClick={onFilter}
            className="px-3 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="px-3 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New</span>
          </button>
        )}
      </div>
    </div>
  )
))
QuickActionsBar.displayName = 'QuickActionsBar'

// Stats Grid Component
export const StatsGrid = memo(({ stats = [], className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
    {stats.map((stat, index) => (
      <div
        key={index}
        className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center justify-between mb-2">
          {stat.icon && <stat.icon className="w-5 h-5 text-gray-400" />}
          {stat.trend && (
            <span className={`text-xs font-medium ${
              stat.trend > 0 ? 'text-emerald-400' : stat.trend < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {stat.trend > 0 ? '+' : ''}{stat.trend}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
        <p className="text-sm text-gray-400">{stat.label}</p>
      </div>
    ))}
  </div>
))
StatsGrid.displayName = 'StatsGrid'

// Data Table Component
export const DataTable = memo(({ 
  columns = [], 
  data = [], 
  loading = false, 
  emptyMessage = "No data available",
  className = '' 
}) => (
  <div className={`bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800/50 border-b border-gray-700/50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-800/30 transition-colors">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-300">
                    {column.cell ? column.cell(row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
))
DataTable.displayName = 'DataTable'