'use client'
import React, { useCallback, useState } from 'react'
import usePayouts from '@/hooks/usePayouts'
import { RefreshCw, Loader2, Award, Wallet, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
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
    const pending = dashboard?.pendingPayouts?.[0]
    const recent = dashboard?.recentPayouts || []
    const canRequest = dashboard?.canRequestPayout
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Payouts</h1>
                    <p className="text-white/50 text-sm">Track earnings and manage payout requests</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => loadDashboard()}
                        disabled={loadingDashboard}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm border border-white/10 disabled:opacity-50">
                        {loadingDashboard ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </button>
                    <button
                        onClick={handleRequest}
                        disabled={!canRequest || loadingRequest || loadingDashboard}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {loadingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                        {canRequest ? 'Request Payout' : 'Not Eligible'}
                    </button>
                </div>
            </div>
            {(error || requestError || requestSuccess) && (
                <div className="space-y-2">
                    {error && (
                        <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {requestError && (
                        <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                            <XCircle className="w-4 h-4" /> {requestError}
                        </div>
                    )}
                    {requestSuccess && (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                            <CheckCircle2 className="w-4 h-4" /> {requestSuccess}
                        </div>
                    )}
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Available for Payout"
                    value={earnings ? `$${Math.round(earnings.availableForPayout || 0)}` : '—'}
                    icon={Wallet}
                    accent="emerald"
                    loading={loadingDashboard}
                />
                <SummaryCard
                    title="Gross Earnings"
                    value={earnings ? `$${Math.round(earnings.grossEarnings || 0)}` : '—'}
                    icon={Award}
                    accent="amber"
                    loading={loadingDashboard}
                />
                <SummaryCard
                    title="Net Earnings"
                    value={earnings ? `$${Math.round(earnings.netEarnings || 0)}` : '—'}
                    icon={Wallet}
                    accent="indigo"
                    loading={loadingDashboard}
                />
                <SummaryCard
                    title="Sales"
                    value={earnings ? earnings.salesCount || 0 : '—'}
                    icon={Clock}
                    accent="sky"
                    loading={loadingDashboard}
                />
            </div>
            {earnings && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Eligibility</h2>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <Badge label={`Minimum Threshold: $${earnings.minimumThreshold}`} />
                            <Badge
                                label={`Eligible: ${earnings.isEligible ? 'Yes' : 'No'}`}
                                color={earnings.isEligible ? 'emerald' : 'rose'}
                            />
                            {earnings.isOnHold && earnings.holdPeriodEnd && (
                                <Badge
                                    label={`On Hold Until: ${new Date(earnings.holdPeriodEnd).toLocaleDateString()}`}
                                    color="amber"
                                />
                            )}
                        </div>
                        {!earnings.isEligible && (
                            <p className="text-xs text-white/50">You need at least ${earnings.minimumThreshold} available to request a payout.</p>
                        )}
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Fees</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <FeeLine
                                label="Platform Fee %"
                                value={`${earnings.platformFeePercentage}%`}
                            />
                            <FeeLine
                                label="Platform Fee"
                                value={`$${Math.round(earnings.platformFee)}`}
                            />
                            <FeeLine
                                label="Processing Fee"
                                value={`$${Math.round(earnings.processingFee)}`}
                            />
                            <FeeLine
                                label="Commission Rate"
                                value={`${earnings.commissionRate}%`}
                            />
                        </div>
                    </div>
                </div>
            )}

            {earnings && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">How Your Payout is Calculated</h2>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-white mb-3">Example: $100 Sale Breakdown</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-white/70">1. Total Sale Amount</span>
                                <span className="text-white font-mono">$100.00</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-white/70">2. Your Commission ({earnings.commissionRate}%)</span>
                                <span className="text-emerald-400 font-mono">${((100 * earnings.commissionRate) / 100).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-white/10 pt-2">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-red-300">3. Platform Fee ({earnings.platformFeePercentage}%)</span>
                                    <span className="text-red-300 font-mono">
                                        -${(((100 * earnings.commissionRate) / 100) * (earnings.platformFeePercentage / 100)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-red-300">4. Processing Fee</span>
                                    <span className="text-red-300 font-mono">-${earnings.processingFee.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-2 mt-2">
                                <div className="flex justify-between items-center py-1 font-semibold">
                                    <span className="text-emerald-400">You Receive</span>
                                    <span className="text-emerald-400 font-mono text-lg">
                                        $
                                        {(
                                            (100 * earnings.commissionRate) / 100 -
                                            ((100 * earnings.commissionRate) / 100) * (earnings.platformFeePercentage / 100) -
                                            earnings.processingFee
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-xs font-medium text-red-300">Platform Fee ({earnings.platformFeePercentage}%)</span>
                            </div>
                            <p className="text-xs text-white/60">Covers hosting, customer support, marketing, and platform maintenance</p>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                <span className="text-xs font-medium text-orange-300">Processing Fee (${earnings.processingFee})</span>
                            </div>
                            <p className="text-xs text-white/60">Payment gateway costs and transaction processing</p>
                        </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-300">What You Get</span>
                        </div>
                        <p className="text-xs text-white/60">
                            Global marketplace • Secure payments • Marketing exposure • Customer support • No upfront costs
                        </p>
                    </div>
                </div>
            )}
            {pending && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Pending Request</h2>
                        <span
                            className={`px-2 py-1 rounded-full border text-xs font-medium ${statusColorMap[pending.status] || 'bg-white/10 text-white/60 border-white/20'}`}>
                            {pending.status}
                        </span>
                    </div>
                    <div className="text-sm text-white/70">
                        <div className="flex justify-between py-1">
                            <span>Amount</span>
                            <span>${Math.round(pending.amount)}</span>
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
                    <p className="text-xs text-white/50">You will be notified by email for each status update.</p>
                </div>
            )}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Recent Payouts</h2>
                </div>
                <div className="overflow-x-auto -mx-3 px-3">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-white/50 text-xs uppercase tracking-wide border-b border-white/10">
                                <th className="py-2 font-medium text-left">Requested</th>
                                <th className="py-2 font-medium text-left">Amount</th>
                                <th className="py-2 font-medium text-left">Status</th>
                                <th className="py-2 font-medium text-left">Approved</th>
                                <th className="py-2 font-medium text-left">Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingDashboard && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-6 text-center text-white/40">
                                        <Loader2 className="w-4 h-4 animate-spin inline" />
                                    </td>
                                </tr>
                            )}
                            {!loadingDashboard && recent.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-6 text-center text-white/40">
                                        No payout history yet
                                    </td>
                                </tr>
                            )}
                            {recent.map((p) => (
                                <tr
                                    key={p._id}
                                    className="border-b border-white/5 last:border-none">
                                    <td className="py-2 text-white/80">{new Date(p.requestedAt).toLocaleDateString()}</td>
                                    <td className="py-2 text-white/80">${Math.round(p.amount)}</td>
                                    <td className="py-2">
                                        <span
                                            className={`px-2 py-1 rounded-full border text-xs font-medium ${statusColorMap[p.status] || 'bg-white/10 text-white/60 border-white/20'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="py-2 text-white/50">{p.approvedAt ? new Date(p.approvedAt).toLocaleDateString() : '—'}</td>
                                    <td className="py-2 text-white/50">{p.completedAt ? new Date(p.completedAt).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="text-center text-xs text-white/30 pt-4 border-t border-white/5">Payout method management UI coming soon.</div>
        </div>
    )
}
function SummaryCard({ title, value, icon: Icon, accent = 'emerald', loading }) {
    const accentMap = {
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
        amber: 'from-amber-500/20 to-amber-500/5 text-amber-300',
        indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300',
        sky: 'from-sky-500/20 to-sky-500/5 text-sky-300'
    }
    return (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 flex flex-col gap-3">
            <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-10 pointer-events-none`} />
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-white/50 font-medium">{title}</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white/60" />
                </div>
            </div>
            <div className="text-2xl font-semibold text-white tracking-tight min-h-[2rem] flex items-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-white/40" /> : value}
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
