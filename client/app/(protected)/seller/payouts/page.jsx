'use client'
import React, { useCallback, useState } from 'react'
import usePayouts from '@/hooks/usePayouts'
import { RefreshCw, Loader2, Wallet, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

const statusColorMap = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    approved: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    processing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    failed: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/30'
}

export default function SellerPayoutDashboardPage() {
    const { dashboard, loadingDashboard, requestPayout, loadDashboard, error, updatingMethod, loadingRequest } = usePayouts()
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
    const reportedNet = earnings?.netEarnings
    const availableForPayout = earnings?.availableForPayout
    const totalPaidOut = earnings?.totalPaidOut
    const salesIncluded = earnings?.salesIncluded || []
    const currency = earnings?.currency || 'USD'
    const pending = dashboard?.pendingPayouts?.[0]
    const recent = dashboard?.recentPayouts || []
    const canRequest = dashboard?.canRequestPayout

    const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—')

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
                            <div className="mt-4 space-y-2 text-base text-white/50 leading-relaxed">
                                <p>
                                    Reported Net Earnings from API:{' '}
                                    <span className="text-white/80 font-mono">${formatCurrencyStrict(reportedNet)}</span>
                                </p>
                                {reportedNet !== youReceiveCalculated && (
                                    <p className="text-amber-300/80">
                                        Note: Reported Net differs from final receivable. This usually means Net excludes some platform or processing
                                        components shown above.
                                    </p>
                                )}
                                <p>
                                    Available For Payout now:{' '}
                                    <span className="text-white/80 font-mono">${formatCurrencyStrict(availableForPayout)}</span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-white/60">Financial Snapshot</h2>
                            <div className="grid sm:grid-cols-2 gap-4 text-base">
                                <SnapshotLine
                                    label="Gross Earnings"
                                    value={`$${formatCurrencyStrict(gross)}`}
                                />
                                <SnapshotLine
                                    label="Total Paid Out"
                                    value={`$${formatCurrencyStrict(totalPaidOut)}`}
                                />
                                <SnapshotLine
                                    label="Commission Rate"
                                    value={`${commissionRate}%`}
                                />
                                <SnapshotLine
                                    label="Platform Fee %"
                                    value={`${platformFeePct}%`}
                                />
                                <SnapshotLine
                                    label="Processing Fee"
                                    value={`$${formatCurrencyStrict(processingFeeAmount)}`}
                                />
                                <SnapshotLine
                                    label="Reported Net"
                                    value={`$${formatCurrencyStrict(reportedNet)}`}
                                />
                                <SnapshotLine
                                    label="You Receive (Calc)"
                                    value={`$${formatCurrencyStrict(youReceiveCalculated)}`}
                                    highlight
                                />
                                <SnapshotLine
                                    label="Available Now"
                                    value={`$${formatCurrencyStrict(availableForPayout)}`}
                                    highlight
                                />
                            </div>
                        </div>
                        {/* SalesIncludedPanel removed per request */}
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
            {/* Full-width Recent Payouts Section */}
            {earnings && (
                <div className="mt-10 space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 w-full">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-white/60">Recent Payouts</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] md:text-xs">
                                <thead>
                                    <tr className="text-white/50 border-b border-white/10">
                                        <th className="py-2 text-left font-medium">Requested</th>
                                        <th className="py-2 text-left font-medium">Amount</th>
                                        <th className="py-2 text-left font-medium">Gross</th>
                                        <th className="py-2 text-left font-medium">Platform</th>
                                        <th className="py-2 text-left font-medium">Processing</th>
                                        <th className="py-2 text-left font-medium">Approved</th>
                                        <th className="py-2 text-left font-medium">Approved By</th>
                                        <th className="py-2 text-left font-medium">Processed</th>
                                        <th className="py-2 text-left font-medium">Completed</th>
                                        <th className="py-2 text-left font-medium">Notes</th>
                                        <th className="py-2 text-left font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingDashboard && (
                                        <tr>
                                            <td
                                                colSpan={11}
                                                className="py-6 text-center text-white/40">
                                                Loading…
                                            </td>
                                        </tr>
                                    )}
                                    {!loadingDashboard && recent.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={11}
                                                className="py-6 text-center text-white/40">
                                                No payout history yet
                                            </td>
                                        </tr>
                                    )}
                                    {recent.map((p) => {
                                        const fullNotes = p.notes || p.failureReason || ''
                                        const shortNotes = fullNotes.length > 28 ? fullNotes.slice(0, 25) + '…' : fullNotes || '—'
                                        return (
                                            <tr
                                                key={p._id}
                                                className="border-b border-white/5 last:border-none">
                                                <td className="py-2 text-white/80">{formatDate(p.requestedAt)}</td>
                                                <td className="py-2 font-mono text-white">${formatCurrencyStrict(p.amount)}</td>
                                                <td className="py-2 font-mono text-white/80">${formatCurrencyStrict(p.grossAmount)}</td>
                                                <td className="py-2 font-mono text-red-300">-${formatCurrencyStrict(p.platformFee)}</td>
                                                <td className="py-2 font-mono text-red-300">-${formatCurrencyStrict(p.processingFee)}</td>
                                                <td className="py-2 font-mono text-white/70">{formatDate(p.approvedAt)}</td>
                                                <td className="py-2 font-mono text-white/50">{p.approvedBy?._id || '—'}</td>
                                                <td className="py-2 font-mono text-white/70">{formatDate(p.processedAt)}</td>
                                                <td className="py-2 font-mono text-white/70">{formatDate(p.completedAt)}</td>
                                                <td
                                                    className="py-2 font-mono text-white/60 max-w-[140px] truncate"
                                                    title={fullNotes}>
                                                    {shortNotes}
                                                </td>
                                                <td className="py-2">
                                                    <span className="px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/15 text-[10px] capitalize">
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[10px] text-white/40">Lifecycle columns show each stage; missing dates indicate not yet reached.</p>
                    </div>
                </div>
            )}
            <div className="text-center text-base text-white/30 pt-4 border-t border-white/5">Payout method management UI coming soon.</div>
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

function Badge({ label, color }) {
    const palette = {
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        gray: 'bg-white/10 text-white/50 border-white/20'
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium border ${palette[color] || palette.gray}`}>{label}</span>
}

function FeeLine({ label, value }) {
    return (
        <div className="flex items-center justify-between text-white/70 text-xs border-b border-white/5 last:border-none pb-2 last:pb-0">
            <span>{label}</span>
            <span className="font-mono text-white/90">{value}</span>
        </div>
    )
}

function SnapshotLine({ label, value, highlight }) {
    return (
        <div
            className={`flex items-center justify-between px-3 py-2 rounded-md border ${highlight ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
            <span className="text-xs text-white/60">{label}</span>
            <span className={`text-xs font-mono ${highlight ? 'text-emerald-300' : 'text-white/80'}`}>{value}</span>
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

