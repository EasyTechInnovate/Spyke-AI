'use client'

import { memo } from 'react'
import { Search, RefreshCw, Filter, Download, Plus } from 'lucide-react'
export const PageHeader = memo(({ 
  title, 
  subtitle, 
  actions = [], 
  breadcrumbs = [], 
  className = '' 
}) => (
  <div className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-6 mb-6 ${className}`}>
    {breadcrumbs.length > 0 && (
      <nav className="mb-3">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="text-gray-500 mx-2">/</span>}
              <span className={index === breadcrumbs.length - 1 ? 'text-white' : 'text-gray-400'}>
                {crumb}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    )}
    
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-gray-400">{subtitle}</p>}
      </div>
      
      {actions.length > 0 && (
        <div className="flex items-center gap-3">
          {actions.map((action, index) => action)}
        </div>
      )}
    </div>
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
  className = '' 
}) => (
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