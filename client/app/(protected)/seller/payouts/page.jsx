'use client'
import React, { useCallback, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import usePayouts from '@/hooks/usePayouts'
import {
    RefreshCw,
    Loader2,
    Wallet,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Info,
    ChevronDown,
    ChevronRight,
    Clock,
    CalendarDays,
    Receipt
} from 'lucide-react'

const statusColorMap = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    approved: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    processing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    failed: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/30'
}

export default function SellerPayoutDashboardPage() {
    const { dashboard, loadingDashboard, requestPayout, loadDashboard, error, loadingRequest } = usePayouts()
    const [requestNotes] = useState('')
    const [requestError, setRequestError] = useState(null)
    const [requestSuccess, setRequestSuccess] = useState(null)

    const formatCurrencyStrict = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '—'
        const num = Number(value)
        return num.toFixed(2)
    }

    const handleRequest = useCallback(async () => {
        setRequestError(null)
        setRequestSuccess(null)
        try {
            await requestPayout(requestNotes || undefined)
            setRequestSuccess('Payout request submitted successfully!')
            await loadDashboard() // Refresh dashboard after request
        } catch (e) {
            setRequestError(e?.message || 'Request failed')
        }
    }, [requestPayout, requestNotes, loadDashboard])
    

    const earnings = dashboard?.earnings
    
    // API returns grossEarnings = totalSales * (commissionRate/100) (seller's share after commission)
    // So totalSales is the original amount, grossEarnings is what seller gets after platform takes commission
    const totalSales = earnings?.totalSales ?? 0
    const commissionRate = earnings?.commissionRate ?? 0
    const grossEarnings = earnings?.grossEarnings ?? 0 // This is seller's share (85% of total)
    const platformCommission = totalSales - grossEarnings // Platform keeps 15%
    
    // Now subtract fees from grossEarnings
    const platformFeePct = earnings?.platformFeePercentage ?? 0
    const platformFeeAmount = earnings?.platformFee ?? 0 // Use API value directly
    const processingFeeAmount = earnings?.processingFee ?? 0
    
    // Net earnings calculation
    const netEarnings = earnings?.netEarnings ?? 0 // Use API value
    const totalPaidOut = earnings?.totalPaidOut ?? 0
    const availableForPayout = earnings?.availableForPayout ?? 0
    
    const currency = earnings?.currency || 'USD'
    const pending = dashboard?.pendingPayouts?.[0]
    const recent = dashboard?.recentPayouts || []
    const canRequest = dashboard?.canRequestPayout

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Payouts</h1>
                    <p className="text-white/50 text-base">Track earnings and manage payout requests</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => loadDashboard()}
                        disabled={loadingDashboard}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-base border border-white/10 disabled:opacity-50 transition-colors">
                        {loadingDashboard ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </button>
                    <button
                        onClick={handleRequest}
                        disabled={!canRequest || loadingRequest || loadingDashboard}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {loadingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                        {canRequest ? 'Request Payout' : 'Not Eligible'}
                    </button>
                </div>
            </div>

            {(error || requestError || requestSuccess) && (
                <div className="space-y-2">
                    {error && (
                        <div className="flex items-center gap-2 text-rose-400 text-base bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {requestError && (
                        <div className="flex items-center gap-2 text-rose-400 text-base bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                            <XCircle className="w-4 h-4" /> {requestError}
                        </div>
                    )}
                    {requestSuccess && (
                        <div className="flex items-center gap-2 text-emerald-400 text-base bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                            <CheckCircle2 className="w-4 h-4" /> {requestSuccess}
                        </div>
                    )}
                </div>
            )}

            {/* Summary Cards - 3 rows of 3 cards each */}
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SummaryCard
                        title="Total Sales"
                        value={`$${formatCurrencyStrict(totalSales)}`}
                        subtitle={`${earnings?.salesCount ?? 0} Sales`}
                        accent="sky"
                        loading={loadingDashboard}
                        tooltip="Total revenue from all your sales"
                        
                    />
                    <SummaryCard
                        title="Platform Commission"
                        value={`$${formatCurrencyStrict(platformCommission)}`}
                        subtitle={`${100 - commissionRate}% Platform Fee`}
                        accent="rose"
                        loading={loadingDashboard}
                        tooltip="Amount retained by the platform"
                        isDeduction
                    />
                    <SummaryCard
                        title="Your Share"
                        value={`$${formatCurrencyStrict(grossEarnings)}`}
                        subtitle={`${commissionRate}% of Sales`}
                        accent="amber"
                        loading={loadingDashboard}
                        tooltip="Your earnings after platform commission"
                        
                    />
                </div>

                {/* Row 2: Fees Breakdown */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SummaryCard
                        title="Platform Fee"
                        value={`$${formatCurrencyStrict(platformFeeAmount)}`}
                        subtitle={`${platformFeePct}% Processing`}
                        accent="orange"
                        loading={loadingDashboard}
                        tooltip="Platform processing fee"
                        isDeduction
                    />
                    <SummaryCard
                        title="Transaction Fee"
                        value={`$${formatCurrencyStrict(processingFeeAmount)}`}
                        subtitle="Fixed Per Payout"
                        accent="purple"
                        loading={loadingDashboard}
                        tooltip="Fixed processing fee per transaction"
                        isDeduction
                    />
                    <SummaryCard
                        title="Net Earnings"
                        value={`$${formatCurrencyStrict(netEarnings)}`}
                        subtitle="After All Fees"
                        accent="emerald"
                        loading={loadingDashboard}
                        highlight
                        tooltip="Total amount you receive after all deductions"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SummaryCard
                        title="Total Paid Out"
                        value={`$${formatCurrencyStrict(totalPaidOut)}`}
                        subtitle="All Time"
                        accent="indigo"
                        loading={loadingDashboard}
                        tooltip="Total amount paid out to you historically"
                        
                    />
                    <SummaryCard
                        title="Available Now"
                        value={`$${formatCurrencyStrict(availableForPayout)}`}
                        subtitle="Ready to Request"
                        accent="emerald"
                        loading={loadingDashboard}
                        highlight
                        tooltip="Amount available for immediate payout request"
                        isEarning
                    />
                    <SummaryCard
                        title="Currency"
                        value={currency}
                        subtitle={`Min: $${formatCurrencyStrict(earnings?.minimumThreshold ?? 0)}`}
                        accent="gray"
                        loading={loadingDashboard}
                        tooltip="Payment currency and minimum payout threshold"
                    />
                </div>
            </div>

            {earnings && (
                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Left: Calculation Breakdown */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold uppercase tracking-wide text-white/60">Earnings Breakdown</h2>
                                <Tooltip content="This shows how your payout amount is calculated from your total sales">
                                    <button
                                        type="button"
                                        aria-label="Earnings breakdown info"
                                        className="text-white/40 hover:text-white/70 transition">
                                        <Info className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            </div>
                            <ol className="space-y-2 text-base">
                                <li className="flex justify-between items-center py-2 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/80">1. Total Sales Revenue</span>
                                        <Tooltip content={`From ${earnings.salesCount} sales`}>
                                            <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/60" />
                                        </Tooltip>
                                    </div>
                                    <span className="font-mono text-white font-semibold">${formatCurrencyStrict(totalSales)}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-rose-300">2. Platform Commission ({100 - commissionRate}%)</span>
                                        <Tooltip content="Platform's share of the revenue">
                                            <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/60" />
                                        </Tooltip>
                                    </div>
                                    <span className="font-mono text-rose-300">-${formatCurrencyStrict(platformCommission)}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-white/5 bg-amber-500/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-amber-300 font-medium">= Your Share ({commissionRate}%)</span>
                                    </div>
                                    <span className="font-mono text-amber-300 font-semibold">${formatCurrencyStrict(grossEarnings)}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-rose-300">3. Platform Fee ({platformFeePct}%)</span>
                                        <Tooltip content="Processing and service fee">
                                            <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/60" />
                                        </Tooltip>
                                    </div>
                                    <span className="font-mono text-rose-300">-${formatCurrencyStrict(platformFeeAmount)}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-rose-300">4. Transaction Fee (Fixed)</span>
                                        <Tooltip content="Fixed fee per payout transaction">
                                            <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/60" />
                                        </Tooltip>
                                    </div>
                                    <span className="font-mono text-rose-300">-${formatCurrencyStrict(processingFeeAmount)}</span>
                                </li>
                                <li className="flex justify-between items-center py-3 mt-2 bg-emerald-500/10 rounded-lg px-3">
                                    <span className="text-emerald-400 font-semibold text-lg">= Net Earnings</span>
                                    <span className="font-mono text-emerald-400 text-2xl font-bold">${formatCurrencyStrict(netEarnings)}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 mt-2">
                                    <span className="text-indigo-300">Already Paid Out</span>
                                    <span className="font-mono text-indigo-300">-${formatCurrencyStrict(totalPaidOut)}</span>
                                </li>
                                <li className="flex justify-between items-center py-3 bg-emerald-500/10 rounded-lg px-3 border-2 border-emerald-500/30">
                                    <span className="text-emerald-300 font-bold text-lg">Available for Payout</span>
                                    <span className="font-mono text-emerald-300 text-2xl font-bold">${formatCurrencyStrict(availableForPayout)}</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Right: Status & Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-white/60">Eligibility & Status</h2>
                            <div className="flex flex-wrap gap-2 text-sm">
                                <Tag tone={earnings.isEligible ? 'emerald' : 'rose'}>
                                    {earnings.isEligible ? '✓ Eligible' : '✗ Not Eligible'}
                                </Tag>
                                <Tag tone={earnings.isOnHold ? 'amber' : 'emerald'}>
                                    {earnings.isOnHold ? '⏸ On Hold' : '✓ Active'}
                                </Tag>
                                <Tag tone="indigo">
                                    Min ${formatCurrencyStrict(earnings.minimumThreshold)}
                                </Tag>
                            </div>
                            
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Total Sales:</span>
                                    <span className="text-white font-mono">${formatCurrencyStrict(earnings.totalSales)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Sales Count:</span>
                                    <span className="text-white font-mono">{earnings.salesCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Your Share Rate:</span>
                                    <span className="text-emerald-300 font-mono">{commissionRate}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Currency:</span>
                                    <span className="text-white font-mono">{currency}</span>
                                </div>
                            </div>

                            {!earnings.isEligible && (
                                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <p className="text-sm text-amber-300">
                                        You need at least ${formatCurrencyStrict(earnings.minimumThreshold)} available to request a payout.
                                    </p>
                                </div>
                            )}

                            {earnings.isOnHold && earnings.holdPeriodEnd && (
                                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                                    <p className="text-sm text-rose-300">
                                        Your account is on hold until {new Date(earnings.holdPeriodEnd).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {pending && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold uppercase tracking-wide text-white/60">Pending Request</h2>
                                    <span
                                        className={`px-2.5 py-1 rounded-full border text-sm font-medium capitalize ${statusColorMap[pending.status] || 'bg-white/10 text-white/60 border-white/20'}`}>
                                        {pending.status}
                                    </span>
                                </div>
                                <div className="text-base text-white/70 space-y-2">
                                    <div className="flex justify-between py-1">
                                        <span>Amount</span>
                                        <span className="font-mono font-semibold text-emerald-300">${formatCurrencyStrict(pending.amount)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>Requested</span>
                                        <span className="font-mono text-sm">{new Date(pending.requestedAt).toLocaleDateString()}</span>
                                    </div>
                                    {pending.approvedAt && (
                                        <div className="flex justify-between py-1">
                                            <span>Approved</span>
                                            <span className="font-mono text-sm">{new Date(pending.approvedAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {pending.payoutMethod && (
                                        <div className="flex justify-between py-1">
                                            <span>Method</span>
                                            <span className="font-mono text-sm capitalize">{pending.payoutMethod}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-white/50 pt-2 border-t border-white/10">
                                    You will be notified by email for each status update.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {earnings && (
                <div className="mt-10 space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 w-full">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-white/60">Recent Payouts</h2>
                            {recent.length > 0 && (
                                <span className="text-sm text-white/40">{recent.length} transaction{recent.length !== 1 ? 's' : ''}</span>
                            )}
                        </div>
                        <RecentPayouts
                            loading={loadingDashboard}
                            payouts={recent}
                            formatCurrencyStrict={formatCurrencyStrict}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function SummaryCard({ title, value, subtitle, icon: Icon, accent = 'emerald', loading, highlight, tooltip, isDeduction, isEarning }) {
    const accentMap = {
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
        amber: 'from-amber-500/20 to-amber-500/5 text-amber-300',
        indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300',
        sky: 'from-sky-500/20 to-sky-500/5 text-sky-300',
        rose: 'from-rose-500/20 to-rose-500/5 text-rose-300',
        orange: 'from-orange-500/20 to-orange-500/5 text-orange-300',
        purple: 'from-purple-500/20 to-purple-500/5 text-purple-300',
        gray: 'from-gray-500/20 to-gray-500/5 text-gray-300'
    }
    
    let borderClass = 'border-white/10'
    let valueColorClass = 'text-white'
    
    if (highlight) {
        borderClass = 'border-emerald-500/40 ring-2 ring-emerald-500/20'
        valueColorClass = 'text-emerald-300'
    } else if (isDeduction) {
        borderClass = 'border-rose-500/40'
        valueColorClass = 'text-rose-300'
    } else if (isEarning) {
        borderClass = 'border-emerald-500/40'
        valueColorClass = 'text-emerald-300'
    }
    
    return (
        <div
            className={`relative overflow-hidden rounded-xl border ${borderClass} bg-gradient-to-br from-white/5 to-white/0 p-4 flex flex-col gap-1 transition-all hover:border-white/20`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-10 pointer-events-none`} />
            <div className="flex items-start justify-between relative">
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wide text-white/50 font-medium">{title}</span>
                        {tooltip && (
                            <Tooltip content={tooltip}>
                                <Info className="w-3 h-3 text-white/30 hover:text-white/60 cursor-help" />
                            </Tooltip>
                        )}
                    </div>
                    {subtitle && <span className="text-[10px] text-white/40">{subtitle}</span>}
                </div>
                {Icon && (
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-white/60" />
                    </div>
                )}
            </div>
            <div
                className={`text-lg font-semibold tracking-tight min-h-[1.75rem] flex items-center relative ${valueColorClass}`}>
                {loading ? <span className="text-white/40">…</span> : value}
            </div>
        </div>
    )
}

function Tag({ children, tone = 'gray' }) {
    const map = {
        emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        gray: 'bg-white/10 text-white/60 border-white/20',
        indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
    }
    return <span className={`px-2 py-1 rounded-full border text-[10px] font-medium ${map[tone]}`}>{children}</span>
}

function RecentPayouts({ payouts = [], loading, formatCurrencyStrict }) {
    const [open, setOpen] = React.useState(null)
    if (loading) {
        return <div className="flex items-center justify-center py-8 text-white/40 text-sm">Loading recent payouts…</div>
    }
    if (!loading && payouts.length === 0) {
        return <div className="py-8 text-center text-white/40 text-sm">No payout history yet</div>
    }

    const statusTone = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            case 'processing':
                return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
            case 'approved':
                return 'bg-blue-500/15 text-blue-300 border-blue-500/30'
            case 'failed':
                return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            case 'pending':
                return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            default:
                return 'bg-white/10 text-white/60 border-white/20'
        }
    }

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—')
    const fmtShort = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—')

    return (
        <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="hidden md:grid md:grid-cols-[160px_140px_140px_130px_130px_210px_120px_1fr] text-sm uppercase tracking-wide font-medium text-white/50 bg-white/5">
                <div className="px-4 py-3">Requested</div>
                <div className="px-4 py-3">Net</div>
                <div className="px-4 py-3">Gross</div>
                <div className="px-4 py-3">Fees</div>
                <div className="px-4 py-3">Method</div>
                <div className="px-4 py-3 flex items-center gap-1">
                    Status
                    
                </div>
                <div className="px-4 py-3">Status</div>
                <Tooltip content="Payout lifecycle: Approved → Processed → Completed. Each colored dot fills when the stage is reached.">
                        <button
                            type="button"
                            aria-label="Payout lifecycle info"
                            className="relative text-white/40 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 rounded transition">
                            <Info className="w-4 h-4" />
                        </button>
                    </Tooltip>
                <div className="px-4 py-3">Details</div>
            </div>
            <ul className="divide-y divide-white/5">
                {payouts.map((p) => {
                    const feesTotal = (p.platformFee || 0) + (p.processingFee || 0)
                    const isOpen = open === p._id
                    const notes = p.notes || p.failureReason || ''
                    return (
                        <li
                            key={p._id}
                            className="group">
                            {/* Desktop row */}
                            <div className="hidden md:grid md:grid-cols-[160px_140px_140px_130px_130px_210px_120px_1fr] items-center text-sm">
                                <div className="px-4 py-4 font-mono text-white/90">
                                    {fmtDate(p.requestedAt)}
                                    {p.payoutPeriod?.from && p.payoutPeriod?.to && (
                                        <div className="text-xs text-white/50 mt-1 font-normal tracking-tight">
                                            {fmtShort(p.payoutPeriod.from)} – {fmtShort(p.payoutPeriod.to)}
                                        </div>
                                    )}
                                </div>
                                <div className="px-4 py-4 font-mono text-emerald-300 font-semibold text-base">${formatCurrencyStrict(p.amount)}</div>
                                <div className="px-4 py-4 font-mono text-white/80">${formatCurrencyStrict(p.grossAmount)}</div>
                                <div
                                    className="px-4 py-4 font-mono text-rose-300"
                                    title={`Platform: $${formatCurrencyStrict(p.platformFee)}\nProcessing: $${formatCurrencyStrict(p.processingFee)}`}>
                                    -${formatCurrencyStrict(feesTotal)}
                                </div>
                                <div className="px-4 py-4 text-white/80 capitalize flex items-center gap-1 text-sm">
                                    <Receipt className="w-4 h-4 text-white/40" /> {p.payoutMethod || '—'}
                                </div>
                                <div className="px-4 py-4 scale-[1.05] origin-left">
                                    <LifecycleTimeline
                                        approvedAt={p.approvedAt}
                                        processedAt={p.processedAt}
                                        completedAt={p.completedAt}
                                    />
                                </div>
                                <div className="px-4 py-4">
                                    <span className={`px-2.5 py-1.5 rounded-full border text-xs font-medium capitalize ${statusTone(p.status)}`}>
                                        {p.status}
                                    </span>
                                </div>
                                <div className="px-4 py-4 flex items-center gap-2">
                                    <button
                                        onClick={() => setOpen(isOpen ? null : p._id)}
                                        className="inline-flex items-center gap-1.5 text-white/60 hover:text-white/90 transition text-xs font-medium">
                                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} Details
                                    </button>
                                </div>
                            </div>
                            {/* Mobile card */}
                            <div className="md:hidden p-5 flex flex-col gap-4 bg-white/0 text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-mono text-white/80">
                                        {fmtShort(p.requestedAt)} •{' '}
                                        <span className="text-emerald-300 font-semibold text-base">${formatCurrencyStrict(p.amount)}</span>
                                    </div>
                                    <span className={`px-2.5 py-1.5 rounded-full border text-xs font-medium capitalize ${statusTone(p.status)}`}>
                                        {p.status}
                                    </span>
                                </div>
                                {p.payoutPeriod?.from && p.payoutPeriod?.to && (
                                    <div className="text-xs font-mono text-white/50 -mt-2">
                                        {fmtShort(p.payoutPeriod.from)} – {fmtShort(p.payoutPeriod.to)}
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-3 text-xs">
                                    <MiniStat
                                        label="Gross"
                                        value={`$${formatCurrencyStrict(p.grossAmount)}`}
                                    />
                                    <MiniStat
                                        label="Fees"
                                        value={`-$${formatCurrencyStrict(feesTotal)}`}
                                    />
                                    <MiniStat
                                        label="Method"
                                        value={p.payoutMethod || '—'}
                                    />
                                </div>
                                <div className="pt-1">
                                    <LifecycleTimeline
                                        small
                                        approvedAt={p.approvedAt}
                                        processedAt={p.processedAt}
                                        completedAt={p.completedAt}
                                    />
                                </div>
                                <button
                                    onClick={() => setOpen(isOpen ? null : p._id)}
                                    className="self-start inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 font-medium">
                                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} Details
                                </button>
                            </div>
                            {isOpen && (
                                <div className="px-4 md:px-6 pb-5 text-[11px] leading-relaxed space-y-3 bg-white/2">
                                    <div className="grid sm:grid-cols-4 gap-3">
                                        <Detail
                                            label="Period"
                                            value={`${fmtShort(p.payoutPeriod?.from)} – ${fmtShort(p.payoutPeriod?.to)}`}
                                        />
                                        <Detail
                                            label="Platform Fee"
                                            value={`$${formatCurrencyStrict(p.platformFee)}`}
                                            negative
                                        />
                                        <Detail
                                            label="Processing Fee"
                                            value={`$${formatCurrencyStrict(p.processingFee)}`}
                                            negative
                                        />
                                        <Detail
                                            label="Transaction ID"
                                            value={p.transactionId || '—'}
                                        />
                                        <Detail
                                            label="Approved"
                                            value={fmtDate(p.approvedAt)}
                                        />
                                        <Detail
                                            label="Processed"
                                            value={fmtDate(p.processedAt)}
                                        />
                                        <Detail
                                            label="Completed"
                                            value={fmtDate(p.completedAt)}
                                        />
                                        <Detail
                                            label="Sales Included"
                                            value={p.salesIncluded?.length || 0}
                                        />
                                    </div>
                                    {notes && (
                                        <div className="text-white/60 whitespace-pre-wrap border border-white/10 rounded-md p-3 bg-white/5 text-[11px]">
                                            {notes}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

function MiniStat({ label, value }) {
    return (
        <div className="flex flex-col bg-white/5 rounded-md px-3 py-2 border border-white/10">
            <span className="text-[10px] uppercase tracking-wide text-white/40 font-medium">{label}</span>
            <span className="text-sm font-mono text-white/80 leading-tight">{value}</span>
        </div>
    )
}

function Detail({ label, value, negative }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wide text-white/40">{label}</span>
            <span className={`font-mono ${negative ? 'text-rose-300' : 'text-white/80'}`}>{value}</span>
        </div>
    )
}

function LifecycleTimeline({ approvedAt, processedAt, completedAt, small }) {
    const steps = [
        { key: 'Approved', date: approvedAt, color: 'blue' },
        { key: 'Processed', date: processedAt, color: 'indigo' },
        { key: 'Completed', date: completedAt, color: 'emerald' }
    ]
    const dotColor = (c) =>
        ({
            blue: 'bg-blue-500',
            indigo: 'bg-indigo-500',
            emerald: 'bg-emerald-500'
        })[c]

    // Unified tooltip-only version when small (mobile)
    if (small) {
        return (
            <div className="flex items-center gap-2 text-[10px] text-white/50">
                {steps.map((s, i) => (
                    <React.Fragment key={s.key}>
                        <div
                            className="flex items-center gap-1.5"
                            title={`${s.key}${s.date ? ' • ' + new Date(s.date).toLocaleDateString() : ' • Pending'}`}>
                            <span
                                className={`w-2 h-2 rounded-full border border-white/15 ${s.date ? dotColor(s.color) : 'bg-white/10'}`}
                                aria-label={`${s.key} ${s.date ? 'completed on ' + new Date(s.date).toLocaleDateString() : 'pending'}`}></span>
                        </div>
                        {i < steps.length - 1 && <span className="h-px flex-1 bg-white/10" />}
                    </React.Fragment>
                ))}
            </div>
        )
    }

    // Desktop: dots only with tooltips (no labels below)
    return (
        <div className="flex items-center gap-4 text-xs text-white/60">
            {steps.map((s, i) => (
                <React.Fragment key={s.key}>
                    <div
                        className="flex items-center gap-2"
                        title={`${s.key}${s.date ? ' • ' + new Date(s.date).toLocaleDateString() : ' • Pending'}`}>
                        <span
                            className={`w-2.5 h-2.5 rounded-full border border-white/15 ${s.date ? dotColor(s.color) : 'bg-white/10'}`}
                            aria-label={`${s.key} ${s.date ? 'completed on ' + new Date(s.date).toLocaleDateString() : 'pending'}`}></span>
                    </div>
                    {i < steps.length - 1 && <span className="h-px flex-1 bg-white/10" />}
                </React.Fragment>
            ))}
        </div>
    )
}

function Tooltip({ content, children }) {
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef(null)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const idRef = useRef(`tt-${Math.random().toString(36).slice(2)}`)

    const updatePosition = useCallback(() => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const gap = 8
        const top = rect.top + window.scrollY - gap
        const left = rect.left + window.scrollX + rect.width / 2
        setCoords({ top, left })
    }, [])

    useEffect(() => {
        if (!open) return
        updatePosition()
        const handle = () => updatePosition()
        window.addEventListener('scroll', handle, true)
        window.addEventListener('resize', handle)
        return () => {
            window.removeEventListener('scroll', handle, true)
            window.removeEventListener('resize', handle)
        }
    }, [open, updatePosition])

    useEffect(() => {
        const onDocClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', onDocClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDocClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [])

    const show = () => { setOpen(true); requestAnimationFrame(updatePosition) }
    const hide = () => setOpen(false)

    return (
        <span
            ref={ref}
            className="relative inline-flex"
            aria-describedby={open ? idRef.current : undefined}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            onClick={() => setOpen(o => !o)}
        >
            {children}
            {open && typeof document !== 'undefined' && createPortal(
                <span
                    id={idRef.current}
                    role="tooltip"
                    style={{ top: coords.top, left: coords.left, transform: 'translate(-50%, -100%)' }}
                    className="fixed z-[9999] whitespace-pre-wrap max-w-[260px] rounded-md border border-white/15 bg-black/90 px-2 py-1.5 text-[11px] leading-snug text-white shadow-xl backdrop-blur-sm pointer-events-none"
                >
                    {content}
                </span>,
                document.body
            )}
        </span>
    )
}

