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
            setRequestSuccess('Payout request submitted')
        } catch (e) {
            setRequestError(e?.message || 'Request failed')
        }
    }, [requestPayout, requestNotes])

    const earnings = dashboard?.earnings
    const gross = earnings?.grossEarnings ?? 0
    const commissionRate = earnings?.commissionRate ?? 0
    const platformFeePct = earnings?.platformFeePercentage ?? 0
    const commissionAmount = gross * (commissionRate / 100)
    const platformFeeAmount = gross * (platformFeePct / 100)
    const processingFeeAmount = earnings?.processingFee ?? 0
    const youReceiveCalculated = gross - commissionAmount - platformFeeAmount - processingFeeAmount
    const availableForPayout = earnings?.availableForPayout
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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-base border border-white/10 disabled:opacity-50">
                        {loadingDashboard ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </button>
                    <button
                        onClick={handleRequest}
                        disabled={!canRequest || loadingRequest || loadingDashboard}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed">
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <SummaryCard
                    title="Gross"
                    value={`$${formatCurrencyStrict(gross)}`}
                    subtitle="Gross Earnings"
                    accent="amber"
                    loading={loadingDashboard}
                />
                <SummaryCard
                    title="Commission"
                    value={`$${formatCurrencyStrict(commissionAmount)}`}
                    subtitle={`${commissionRate}%`}
                    accent="rose"
                    loading={loadingDashboard}
                />
                <SummaryCard
                    title="Platform Fee"
                    value={`$${formatCurrencyStrict(platformFeeAmount)}`}
                    subtitle={`${platformFeePct}%`}
                    accent="orange"
                    loading={loadingDashboard}
                />
                <SummaryCard
                    title="Processing"
                    value={`$${formatCurrencyStrict(processingFeeAmount)}`}
                    subtitle="Fixed Fee"
                    accent="purple"
                    loading={loadingDashboard}
                />
                <SummaryCard
                    title="You Receive"
                    value={`$${formatCurrencyStrict(youReceiveCalculated)}`}
                    subtitle="After All Fees"
                    accent="emerald"
                    loading={loadingDashboard}
                    highlight
                />
                <SummaryCard
                    title="Available"
                    value={`$${formatCurrencyStrict(availableForPayout)}`}
                    subtitle="Available Now"
                    accent="indigo"
                    loading={loadingDashboard}
                />
            </div>
            {earnings && (
                <div className="grid gap-8 lg:grid-cols-5">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-white/60 mb-4">How Your Payout Is Calculated</h2>
                            <ol className="space-y-2 text-base">
                                <li className="flex justify-between items-center py-1 border-b border-white/5">
                                    <span className="text-white/80">1. Gross Earnings</span>
                                    <span className="font-mono text-white">${formatCurrencyStrict(gross)}</span>
                                </li>
                                <li className="flex justify-between items-center py-1 border-b border-white/5">
                                    <span className="text-red-300">2. Platform Commission ({commissionRate}%)</span>
                                    <span className="font-mono text-red-300">-${formatCurrencyStrict(commissionAmount)}</span>
                                </li>
                                <li className="flex justify-between items-center py-1 border-b border-white/5">
                                    <span className="text-red-300">3. Platform Fee ({platformFeePct}%)</span>
                                    <span className="font-mono text-red-300">-${formatCurrencyStrict(platformFeeAmount)}</span>
                                </li>
                                <li className="flex justify-between items-center py-1 border-b border-white/5">
                                    <span className="text-red-300">4. Processing Fee (Fixed)</span>
                                    <span className="font-mono text-red-300">-${formatCurrencyStrict(processingFeeAmount)}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 mt-2">
                                    <span className="text-emerald-400 font-semibold">You Receive (Calculated)</span>
                                    <span className="font-mono text-emerald-400 text-xl">${formatCurrencyStrict(youReceiveCalculated)}</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-white/60">Eligibility & Status</h2>
                            <div className="flex flex-wrap gap-2 text-sm">
                                <Tag tone={earnings.isEligible ? 'emerald' : 'rose'}>{earnings.isEligible ? 'Eligible' : 'Not Eligible'}</Tag>
                                <Tag tone={earnings.isOnHold ? 'amber' : 'gray'}>{earnings.isOnHold ? 'On Hold' : 'No Hold'}</Tag>
                                <Tag tone="indigo">Threshold ${formatCurrencyStrict(earnings.minimumThreshold)}</Tag>
                                <Tag tone="sky">Sales {earnings.salesCount}</Tag>
                                <Tag tone="purple">Total Sales ${formatCurrencyStrict(earnings.totalSales)}</Tag>
                            </div>
                            {!earnings.isEligible && (
                                <p className="text-base text-white/50">
                                    You need at least ${formatCurrencyStrict(earnings.minimumThreshold)} available before requesting a payout.
                                </p>
                            )}
                            <div className="pt-2 text-base text-white/40">Currency: {currency}</div>
                        </div>
                        {pending && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold uppercase tracking-wide text-white/60">Pending Request</h2>
                                    <span
                                        className={`px-2 py-1 rounded-full border text-sm font-medium ${statusColorMap[pending.status] || 'bg-white/10 text-white/60 border-white/20'}`}>
                                        {pending.status}
                                    </span>
                                </div>
                                <div className="text-base text-white/70">
                                    <div className="flex justify-between py-1">
                                        <span>Amount</span>
                                        <span>${formatCurrencyStrict(pending.amount)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>Requested</span>
                                        <span>{new Date(pending.requestedAt).toLocaleDateString()}</span>
                                    </div>
                                    {pending.approvedAt && (
                                        <div className="flex justify-between py-1">
                                            <span>Approved</span>
                                            <span>{new Date(pending.approvedAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-base text-white/50">You will be notified by email for each status update.</p>
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

function SummaryCard({ title, value, subtitle, icon: Icon, accent = 'emerald', loading, highlight }) {
    const accentMap = {
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
        amber: 'from-amber-500/20 to-amber-500/5 text-amber-300',
        indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300',
        sky: 'from-sky-500/20 to-sky-500/5 text-sky-300',
        rose: 'from-rose-500/20 to-rose-500/5 text-rose-300',
        orange: 'from-orange-500/20 to-orange-500/5 text-orange-300',
        purple: 'from-purple-500/20 to-purple-500/5 text-purple-300'
    }
    return (
        <div
            className={`relative overflow-hidden rounded-xl border ${highlight ? 'border-emerald-500/40' : 'border-white/10'} bg-gradient-to-br from-white/5 to-white/0 p-4 flex flex-col gap-1`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-10 pointer-events-none`} />
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wide text-white/50 font-medium">{title}</span>
                    {subtitle && <span className="text-[10px] text-white/40">{subtitle}</span>}
                </div>
                {Icon && (
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-white/60" />
                    </div>
                )}
            </div>
            <div
                className={`text-lg font-semibold tracking-tight min-h-[1.75rem] flex items-center ${highlight ? 'text-emerald-300' : 'text-white'}`}>
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
                    <Tooltip content="Payout lifecycle: Approved → Processed → Completed. Each colored dot fills when the stage is reached.">
                        <button
                            type="button"
                            aria-label="Payout lifecycle info"
                            className="relative text-white/40 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 rounded transition">
                            <Info className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
                <div className="px-4 py-3">Status</div>
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

