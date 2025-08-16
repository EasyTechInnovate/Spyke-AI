'use client'
import React from 'react'
import { TrendingUp } from 'lucide-react'

function BaseStatCard({ icon: Icon, value, label, color, trend, loading }) {
  return (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00FF89]/30 transition-all group">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color}/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color.replace('/20','')}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs sm:text-sm text-green-400">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{trend}%</span>
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-6 sm:h-8 bg-gray-800 rounded animate-pulse" />
          <div className="h-3 sm:h-4 bg-gray-800 rounded w-2/3 animate-pulse" />
        </div>
      ) : (
        <>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{value}</h3>
          <p className="text-xs sm:text-sm text-gray-400">{label}</p>
        </>
      )}
    </div>
  )
}

const StatCard = React.memo(BaseStatCard)
export default StatCard
