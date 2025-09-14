'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { PageHeader, LoadingSkeleton, EmptyState, QuickActionsBar, StatsGrid } from '@/components/admin'
import { DollarSign, RefreshCw, Search, Filter, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react'
import { adminAPI } from '@/lib/api/admin'
import { Loader2, XCircle, Shield, CheckCircle, RefreshCw as ProcessingIcon } from 'lucide-react'

export default function AdminPayoutPage() {
    const [loading, setLoading] = useState(true)
    const [payouts, setPayouts] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [filtersKey, setFiltersKey] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [listOpacity, setListOpacity] = useState(1)
    const [expandedId, setExpandedId] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)

    const latestReqRef = useRef(0)

    const fetchPayouts = useCallback(
        async ({ manual = false } = {}) => {
            if (manual) setListOpacity(0.6)
            setLoading(true)
            try {
                const reqId = ++latestReqRef.current
                const params = {
                    page,
                    limit: 50,
                    ...(statusFilter !== 'all' ? { status: statusFilter } : {})
                }
                if (fromDate) params.fromDate = new Date(fromDate + 'T00:00:00.000Z').toISOString()
                if (toDate) params.toDate = new Date(toDate + 'T23:59:59.999Z').toISOString()
                const res = await adminAPI.payouts.getPayouts(params)
                if (reqId !== latestReqRef.current) return
                const records = res?.payouts || res?.data || []
                const meta = res?.meta || res?.pagination || {}
                setPayouts(records)
                setTotalPages(meta.totalPages || meta.pages || 1)
            } catch (e) {
                console.error('Failed to load payouts', e)
                setPayouts([])
            } finally {
                setLoading(false)
                setTimeout(() => setListOpacity(1), 120)
            }
        },
        [page, statusFilter, fromDate, toDate, filtersKey]
    )

    useEffect(() => {
        fetchPayouts({})
    }, [fetchPayouts])

    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 220)
        return () => clearTimeout(id)
    }, [searchQuery])

    const filteredPayouts = useMemo(() => {
        let data = payouts
        if (statusFilter !== 'all') {
            data = data.filter((p) => p.status === statusFilter)
        }
        if (!debouncedQuery) return data
        const q = debouncedQuery
        return data.filter(
            (p) =>
                p.sellerName.toLowerCase().includes(q) ||
                String(p.amount).includes(q) ||
                p.status.toLowerCase().includes(q) ||
                p.method.toLowerCase().includes(q)
        )
    }, [payouts, statusFilter, debouncedQuery])

    const counts = payouts.reduce(
        (acc, p) => {
            acc.all++
            acc[p.status] = (acc[p.status] || 0) + 1
            return acc
        },
        { all: 0 }
    )

    const totals = useMemo(() => {
        const base = { totalAmount: 0, pendingAmount: 0, processingAmount: 0, completedAmount: 0 }
        payouts.forEach((p) => {
            const amt = Number(p.amount) || 0
            base.totalAmount += amt
            if (p.status === 'pending') base.pendingAmount += amt
            if (p.status === 'processing') base.processingAmount += amt
            if (p.status === 'completed') base.completedAmount += amt
        })
        const completionRate = base.totalAmount > 0 ? Math.round((base.completedAmount / base.totalAmount) * 100) : 0
        return { ...base, completionRate }
    }, [payouts])

    const highlight = useCallback(
        (text) => {
            if (!debouncedQuery) return text
            const q = debouncedQuery
            const idx = text.toLowerCase().indexOf(q)
            if (idx === -1) return text
            return (
                <>
                    {text.slice(0, idx)}
                    <span className="text-[#00FF89] font-medium">{text.slice(idx, idx + q.length)}</span>
                    {text.slice(idx + q.length)}
                </>
            )
        },
        [debouncedQuery]
    )

    const updateStatus = useCallback(async (id, nextStatus, currentStatus) => {
        setUpdatingId(id)
        try {
            if (nextStatus === 'approved') {
                await adminAPI.payouts.approve(id, {})
            } else if (nextStatus === 'processing') {
                if (currentStatus === 'hold') {
                    await adminAPI.payouts.release(id)
                } else if (['approved', 'pending'].includes(currentStatus)) {
                    if (currentStatus === 'pending') {
                        await adminAPI.payouts.approve(id, {})
                    }
                    await adminAPI.payouts.markProcessing(id, {})
                }
            } else if (nextStatus === 'completed') {
                await adminAPI.payouts.markCompleted(id, {})
            } else if (nextStatus === 'hold') {
                await adminAPI.payouts.hold(id, undefined)
            } else if (nextStatus === 'release') {
                await adminAPI.payouts.release(id)
            } else {
                console.warn('Unhandled status transition', nextStatus)
            }
            setPayouts((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, status: nextStatus === 'release' ? 'processing' : nextStatus, updatedAt: new Date().toISOString() } : p
                )
            )
        } catch (e) {
            console.error('Status update failed', e)
        } finally {
            setUpdatingId(null)
        }
    }, [])

    return (
        <div className="space-y-6">
            <PageHeader
                title="Payout Management"
                subtitle="Track and manage seller payouts and withdrawal requests"
                actions={[
                    <button
                        key="refresh"
                        type="button"
                        onClick={() => fetchPayouts({ manual: true })}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                ]}
            />

            <AggregatedBar totals={totals} />

            <QuickActionsBar>
                <div className="w-full flex flex-col gap-4">
                    <div className="grid w-full gap-4 md:grid-cols-[1fr_repeat(2,_170px)_auto_auto]">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search seller, amount, status..."
                                value={searchQuery}
                                onChange={e=> setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#0f0f0f] border border-gray-700 rounded-xl text-base leading-none text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                            />
                            {searchQuery && (
                                <button type="button" onClick={()=> setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                            )}
                        </div>
                        <input type="date" aria-label="From date" value={fromDate} onChange={e=> setFromDate(e.target.value)} className="px-4 py-4 bg-[#0f0f0f] border border-gray-700 rounded-xl text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/40" />
                        <input type="date" aria-label="To date" value={toDate} onChange={e=> setToDate(e.target.value)} className="px-4 py-4 bg-[#0f0f0f] border border-gray-700 rounded-xl text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/40" />
                        <button type="button" onClick={()=> { setPage(1); setFiltersKey(k=>k+1); fetchPayouts({ manual:true }) }} className="px-6 py-4 bg-[#00FF89] text-black font-semibold rounded-xl text-base hover:bg-[#12ffa0] transition-colors">Apply</button>
                        <button type="button" onClick={()=> { setFromDate(''); setToDate(''); setPage(1); setFiltersKey(k=>k+1); fetchPayouts({ manual:true }) }} className="px-6 py-4 bg-[#1b1b1b] text-gray-300 font-medium rounded-xl text-base border border-gray-700 hover:bg-[#222] transition-colors">Clear</button>
                    </div>
                </div>
            </QuickActionsBar>

            <section
                aria-busy={loading}
                className="transition-opacity duration-200"
                style={{ opacity: listOpacity }}>
                {loading ? (
                    <LoadingSkeleton />
                ) : filteredPayouts.length === 0 ? (
                    <EmptyState
                        title="No Payouts"
                        description="No payout records found."
                        icon={DollarSign}
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredPayouts.map((p) => (
                            <PayoutRow
                                key={p.id}
                                payout={p}
                                expanded={expandedId === p.id}
                                onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                                updating={updatingId === p.id}
                                onUpdateStatus={updateStatus}
                                highlight={highlight}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

function AggregatedBar({ totals }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
                label="Total Volume"
                value={`$${totals.totalAmount.toFixed(2)}`}
            />
            <MetricCard
                label="Pending"
                value={`$${totals.pendingAmount.toFixed(2)}`}
                tone="amber"
            />
            <MetricCard
                label="Processing"
                value={`$${totals.processingAmount.toFixed(2)}`}
                tone="blue"
            />
            <MetricCard
                label="Completion Rate"
                value={`${totals.completionRate}%`}
                tone="green"
            />
        </div>
    )
}

function MetricCard({ label, value, tone }) {
    const toneMap = {
        amber: 'from-[#352a14] to-[#2a1f0c] text-[#FFC050] border-[#4a3614]',
        green: 'from-[#113226] to-[#0d271d] text-[#00FF89] border-[#1d5d45]',
        blue: 'from-[#182b3d] to-[#132230] text-sky-300 border-sky-800/40'
    }
    const cls = tone ? toneMap[tone] : 'from-[#1b1b1b] to-[#141414] text-gray-300 border-gray-800'
    return (
        <div className={`relative overflow-hidden rounded-xl border p-4 bg-gradient-to-br ${cls}`}>
            <div className="text-xs uppercase tracking-wide opacity-70 mb-1 font-medium">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
            {tone === 'green' && (
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_70%_20%,#00FF89,transparent_60%)]" />
            )}
        </div>
    )
}

function FilterTab({ id, label, active, onSelect, tone = 'neutral', count }) {
    const isActive = active === id
    const toneClass =
        tone === 'green'
            ? 'bg-[#113226] text-[#00FF89]'
            : tone === 'amber'
              ? 'bg-[#352a14] text-[#FFC050]'
              : tone === 'red'
                ? 'bg-[#3a1515] text-red-400'
                : 'bg-[#1e1e1e] text-gray-300'
    const activeClass = isActive ? `${toneClass} ring-1 ring-white/10` : 'bg-[#0f0f0f] text-gray-400 hover:bg-[#1b1b1b]'
    const showCount = typeof count === 'number'
    return (
        <button
            type="button"
            onClick={() => onSelect?.(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 ${activeClass}`}>
            {label}
            {showCount ? <span className="ml-1.5">{count}</span> : null}
        </button>
    )
}

function PayoutRow({ payout, expanded, onToggle, updating, onUpdateStatus, highlight }) {
    const dateStr = new Date(payout.requestedAt || payout.createdAt).toLocaleDateString()
    const canApprove = payout.status === 'pending'
    const canProcess = payout.status === 'approved'
    const canComplete = payout.status === 'processing'
    const canResume = payout.status === 'hold'
    const canHold = ['pending', 'approved', 'processing'].includes(payout.status) && payout.status !== 'hold'

    const actions = []
    if (canApprove) actions.push({ label: 'Approve', next: 'approved', tone: 'green' })
    if (canProcess) actions.push({ label: 'Start Processing', next: 'processing', tone: 'amber' })
    if (canComplete) actions.push({ label: 'Mark Completed', next: 'completed', tone: 'green' })
    if (canHold) actions.push({ label: 'Hold', next: 'hold', tone: 'amber' })
    if (canResume) actions.push({ label: 'Resume', next: 'processing', tone: 'blue' })

    const timeline = ['pending', 'approved', 'processing', 'completed']
    const currentIndex = timeline.indexOf(payout.status)

    return (
        <div className={`bg-[#171717] border ${expanded ? 'border-[#00FF89]/40 ring-1 ring-[#00FF89]/20' : 'border-gray-800'} rounded-xl`}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full p-6 flex flex-col sm:flex-row sm:items-center gap-5 text-left">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#00FF89]/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#00FF89]" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-white font-medium truncate">{highlight(payout.sellerName)}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                                <span>{dateStr}</span>
                                <span>•</span>
                                <StatusBadge status={payout.status} />
                                <span>•</span>
                                <span className="uppercase tracking-wide">{highlight(payout.method)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold text-white">${payout.amount?.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{payout.currency}</div>
                </div>
            </button>
            {expanded && (
                <div className="px-6 pb-6 pt-0 border-t border-gray-800 space-y-6">
                    <div className="flex items-center gap-3 mt-3">
                        {timeline.map((step, i) => {
                            const done = i <= currentIndex
                            return (
                                <div
                                    key={step}
                                    className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${done ? 'bg-[#00FF89] text-black' : 'bg-gray-800 text-gray-500'}`}>
                                        {i + 1}
                                    </div>
                                    <span className={`text-sm capitalize ${done ? 'text-[#00FF89]' : 'text-gray-500'}`}>{step}</span>
                                    {i < timeline.length - 1 && <div className={`w-10 h-px ${i < currentIndex ? 'bg-[#00FF89]' : 'bg-gray-700'}`} />}
                                </div>
                            )
                        })}
                    </div>
                    <div className="grid sm:grid-cols-4 gap-4 text-xs text-gray-300">
                        <Info
                            label="Payout ID"
                            value={payout.id}
                        />
                        <Info
                            label="Requested"
                            value={dateStr}
                        />
                        <Info
                            label="Updated"
                            value={payout.updatedAt ? new Date(payout.updatedAt).toLocaleDateString() : '—'}
                        />
                        <Info
                            label="Seller"
                            value={payout.sellerEmail || '—'}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {actions.map((a) => (
                            <button
                                key={a.label}
                                disabled={updating}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onUpdateStatus(payout.id, a.next, payout.status)
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${updating ? 'opacity-50 cursor-wait' : ''} ${
                                    a.tone === 'green'
                                        ? 'bg-[#113226] text-[#00FF89] border-[#1d5d45] hover:bg-[#154633]'
                                        : a.tone === 'amber'
                                          ? 'bg-[#352a14] text-[#FFC050] border-[#4a3614] hover:bg-[#423016]'
                                          : a.tone === 'red'
                                            ? 'bg-[#3a1515] text-red-300 border-red-800/40 hover:bg-[#4a1c1c]'
                                            : 'bg-[#1e293b] text-sky-300 border-sky-800/40 hover:bg-[#243349]'
                                }`}>
                                {updating ? 'Updating…' : a.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function Info({ label, value }) {
    return (
        <div className="space-y-1">
            <div className="uppercase tracking-wide text-[10px] text-gray-500 font-medium">{label}</div>
            <div className="font-mono text-[11px] break-all text-gray-300">{value}</div>
        </div>
    )
}

function StatusBadge({ status }) {
    const map = {
        completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
        approved: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
        processing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20 animate-pulse',
        hold: 'bg-yellow-700/20 text-yellow-400 border-yellow-500/30',
        failed: 'bg-red-500/15 text-red-400 border-red-500/20',
        cancelled: 'bg-gray-600/20 text-gray-300 border-gray-500/30'
    }
    return (
        <span
            className={`px-2 py-1 rounded-full border text-[11px] font-medium capitalize ${map[status] || 'bg-gray-700/40 text-gray-300 border-gray-600/40'}`}>
            {status}
        </span>
    )
}

