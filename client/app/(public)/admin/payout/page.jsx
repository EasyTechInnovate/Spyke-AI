'use client'
import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { PageHeader, LoadingSkeleton, EmptyState, QuickActionsBar } from '@/components/admin'
import { DollarSign, RefreshCw, Search, Filter, X } from 'lucide-react'
import { adminAPI } from '@/lib/api/admin'
import { Loader2 } from 'lucide-react'
import { useNotificationProvider } from '@/components/shared/notifications/NotificationProvider'
import { FixedSizeList as List } from 'react-window'
const VIRTUALIZATION_THRESHOLD = 60
const ROW_HEIGHT = 100
export default function AdminPayoutPage() {
    const [loading, setLoading] = useState(true)
    const [payoutList, setPayoutList] = useState([])
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
    const [selectedPayoutIds, setSelectedPayoutIds] = useState([])
    const [actionReasonModal, setActionReasonModal] = useState({ open: false, action: null, payoutId: null })
    const [actionReason, setActionReason] = useState('')
    const [transactionModal, setTransactionModal] = useState({ open: false, action: null, payoutId: null })
    const [transactionForm, setTransactionForm] = useState({ transactionId: '', notes: '' })
    const [payoutDetailsCache, setPayoutDetailsCache] = useState({})
    const [detailsLoadingId, setDetailsLoadingId] = useState(null)
    const [detailsErrorId, setDetailsErrorId] = useState(null)
    const [pageSize, setPageSize] = useState(50)
    const [totalItems, setTotalItems] = useState(0)
    const [reasonTouched, setReasonTouched] = useState(false)
    const { showSuccess, showError } = useNotificationProvider?.() || {}
    const latestRequestIdRef = useRef(0)
    const [viewportH, setViewportH] = useState(typeof window !== 'undefined' ? window.innerHeight : 900)
    useEffect(() => {
        const onResize = () => setViewportH(window.innerHeight)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])
    const virtualListHeight = useMemo(() => {
        const h = viewportH - 420
        return Math.max(320, Math.min(900, h))
    }, [viewportH])
    const mapToDisplayStatus = useCallback((p) => {
        const payout = {
            ...p,
            id: p.id || p._id,
            _id: p._id || p.id,
            displayStatus: p.status === 'failed' && p.failureReason ? 'hold' : p.status
        }
        return payout
    }, [])
    const fetchPayoutList = useCallback(
        async ({ manual = false } = {}) => {
            if (manual) setListOpacity(0.6)
            setLoading(true)
            try {
                const reqId = ++latestRequestIdRef.current
                const params = {
                    page,
                    limit: pageSize,
                    ...(statusFilter !== 'all' ? { status: statusFilter } : {})
                }
                if (fromDate) params.fromDate = new Date(fromDate + 'T00:00:00.000Z').toISOString()
                if (toDate) params.toDate = new Date(toDate + 'T23:59:59.999Z').toISOString()
                const res = await adminAPI.payouts.getPayouts(params)
                if (reqId !== latestRequestIdRef.current) return
                const records = (res?.payouts || res?.data || []).map(mapToDisplayStatus)
                const meta = res?.meta || res?.pagination || {}
                setPayoutList(records)
                setTotalPages(meta.totalPages || meta.pages || 1)
                if (meta.totalItems || meta.total) setTotalItems(meta.totalItems || meta.total)
            } catch (e) {
                console.error('Failed to load payouts', e)
                setPayoutList([])
            } finally {
                setLoading(false)
                setTimeout(() => setListOpacity(1), 120)
            }
        },
        [page, pageSize, statusFilter, fromDate, toDate, filtersKey, mapToDisplayStatus]
    )
    const fetchPayoutDetails = useCallback(
        async (payoutId) => {
            if (!payoutId || payoutDetailsCache[payoutId]) return
            setDetailsLoadingId(payoutId)
            setDetailsErrorId(null)
            try {
                const data = await adminAPI.payouts.getDetails(payoutId)
                setPayoutDetailsCache((prev) => ({ ...prev, [payoutId]: data }))
            } catch (e) {
                console.error('Failed to load payout details', e)
                setDetailsErrorId(payoutId)
                showError?.('Failed to load payout details')
            } finally {
                setDetailsLoadingId(null)
            }
        },
        [payoutDetailsCache, showError]
    )
    useEffect(() => {
        fetchPayoutList({})
    }, [fetchPayoutList])
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 220)
        return () => clearTimeout(id)
    }, [searchQuery])
    const handleToggleRow = useCallback(
        (payoutId) => {
            if (!payoutId) {
                console.error('Payout ID is missing')
                showError?.('Invalid payout data')
                return
            }
            setExpandedId((prev) => (prev === payoutId ? null : payoutId))
            if (expandedId !== payoutId && !payoutDetailsCache[payoutId]) {
                fetchPayoutDetails(payoutId)
            }
        },
        [fetchPayoutDetails, payoutDetailsCache, expandedId, showError]
    )
    const filteredPayoutList = useMemo(() => {
        let data = payoutList
        if (statusFilter !== 'all') {
            data = data.filter((p) => p.displayStatus === statusFilter)
        }
        if (!debouncedQuery) return data
        const q = debouncedQuery
        return data.filter(
            (p) =>
                p.sellerName.toLowerCase().includes(q) ||
                String(p.amount).includes(q) ||
                p.displayStatus.toLowerCase().includes(q) ||
                p.method.toLowerCase().includes(q)
        )
    }, [payoutList, statusFilter, debouncedQuery])
    const statusCounts = useMemo(() => {
        const counts = { all: 0, pending: 0, approved: 0, processing: 0, completed: 0, hold: 0, failed: 0 }
        payoutList.forEach((p) => {
            counts.all++
            const status = p.displayStatus || 'pending'
            if (counts.hasOwnProperty(status)) {
                counts[status]++
            } else {
                if (status.includes('fail') || status.includes('reject')) {
                    counts.failed++
                } else if (status.includes('hold') || status.includes('pause')) {
                    counts.hold++
                } else {
                    counts.pending++
                }
            }
        })
        return counts
    }, [payoutList])
    const aggregateTotals = useMemo(() => {
        const base = { totalAmount: 0, pendingAmount: 0, processingAmount: 0, completedAmount: 0 }
        payoutList.forEach((p) => {
            const amt = Number(p.amount) || 0
            base.totalAmount += amt
            if (p.displayStatus === 'pending') base.pendingAmount += amt
            if (p.displayStatus === 'processing') base.processingAmount += amt
            if (p.displayStatus === 'completed') base.completedAmount += amt
        })
        const completionRate = base.totalAmount > 0 ? Math.round((base.completedAmount / base.totalAmount) * 100) : 0
        return { ...base, completionRate }
    }, [payoutList])
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
    const toggleSelect = useCallback((id) => {
        setSelectedPayoutIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    }, [])
    const clearSelection = () => setSelectedPayoutIds([])
    const allVisibleSelected = useMemo(
        () => filteredPayoutList.length > 0 && filteredPayoutList.every((p) => selectedPayoutIds.includes(p.id)),
        [filteredPayoutList, selectedPayoutIds]
    )
    const selectAllVisible = useCallback(() => {
        setSelectedPayoutIds(filteredPayoutList.map((p) => p.id))
    }, [filteredPayoutList])
    const deselectAll = useCallback(() => setSelectedPayoutIds([]), [])
    const handleReasonSubmit = async () => {
        const { action, payoutId } = actionReasonModal
        const reasonRequired = action === 'reject' || action === 'hold'
        const trimmed = actionReason.trim()
        if (reasonRequired) {
            setReasonTouched(true)
            if (trimmed.length < 8) {
                showError?.('Reason must be at least 8 characters')
                return
            }
        }
        try {
            if (action === 'reject') {
                await adminAPI.payouts.reject(payoutId, trimmed)
                setPayoutList((prev) =>
                    prev.map((p) => (p.id === payoutId ? { ...p, status: 'failed', failureReason: trimmed, displayStatus: 'failed' } : p))
                )
                showSuccess?.('Payout rejected')
            } else if (action === 'hold') {
                await adminAPI.payouts.hold(payoutId, trimmed)
                setPayoutList((prev) =>
                    prev.map((p) => (p.id === payoutId ? { ...p, status: 'failed', failureReason: trimmed, displayStatus: 'hold' } : p))
                )
                showSuccess?.('Payout put on hold')
            } else if (action === 'bulkApprove') {
                await adminAPI.payouts.bulkApprove(selectedPayoutIds, trimmed || undefined)
                setPayoutList((prev) =>
                    prev.map((p) =>
                        selectedPayoutIds.includes(p.id) && p.displayStatus === 'pending'
                            ? { ...p, status: 'approved', displayStatus: 'approved' }
                            : p
                    )
                )
                showSuccess?.('Bulk approval complete')
                clearSelection()
            }
        } catch (e) {
            console.error(e)
            showError?.('Action failed')
        } finally {
            setActionReasonModal({ open: false, action: null, payoutId: null })
            setActionReason('')
            setReasonTouched(false)
        }
    }
    const handleTransactionSubmit = async () => {
        const { action, payoutId } = transactionModal
        try {
            if (action === 'processing') {
                await adminAPI.payouts.markProcessing(payoutId, {
                    transactionId: transactionForm.transactionId || undefined,
                    notes: transactionForm.notes || undefined
                })
                setPayoutList((prev) => prev.map((p) => (p.id === payoutId ? { ...p, status: 'processing', displayStatus: 'processing' } : p)))
                showSuccess?.('Marked processing')
            } else if (action === 'completed') {
                await adminAPI.payouts.markCompleted(payoutId, {
                    transactionId: transactionForm.transactionId || undefined,
                    notes: transactionForm.notes || undefined
                })
                setPayoutList((prev) => prev.map((p) => (p.id === payoutId ? { ...p, status: 'completed', displayStatus: 'completed' } : p)))
                showSuccess?.('Payout completed')
            }
        } catch (e) {
            console.error(e)
            showError?.('Update failed')
        } finally {
            setTransactionModal({ open: false, action: null, payoutId: null })
            setTransactionForm({ transactionId: '', notes: '' })
        }
    }
    const handleStatusUpdate = useCallback(
        async (id, nextStatus, currentDisplayStatus) => {
            if (['reject', 'hold', 'bulkApprove'].includes(nextStatus)) {
                setActionReasonModal({
                    open: true,
                    action: nextStatus === 'reject' ? 'reject' : nextStatus === 'hold' ? 'hold' : 'bulkApprove',
                    payoutId: id
                })
                return
            }
            if (['processing', 'completed'].includes(nextStatus)) {
                setTransactionModal({ open: true, action: nextStatus, payoutId: id })
                return
            }
            setUpdatingId(id)
            try {
                if (nextStatus === 'approved') {
                    await adminAPI.payouts.approve(id, {})
                    setPayoutList((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'approved', displayStatus: 'approved' } : p)))
                    showSuccess?.('Payout approved')
                } else if (nextStatus === 'release') {
                    await adminAPI.payouts.release(id)
                    setPayoutList((prev) =>
                        prev.map((p) => (p.id === id ? { ...p, status: 'pending', failureReason: null, displayStatus: 'pending' } : p))
                    )
                    showSuccess?.('Payout released')
                } else {
                    console.warn('Unhandled direct status', nextStatus)
                }
            } catch (e) {
                console.error(e)
                showError?.('Status update failed')
            } finally {
                setUpdatingId(null)
            }
        },
        [showSuccess, showError]
    )
    return (
        <div className="space-y-6">
            <PageHeader
                title="Payout Management"
                subtitle="Track and manage seller payouts and withdrawal requests"
                actions={[
                    <button
                        key="refresh"
                        type="button"
                        onClick={() => fetchPayoutList({ manual: true })}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                ]}
            />
            <PayoutAggregatesBar totals={aggregateTotals} />
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <FilterTab
                        id="all"
                        label="All"
                        active={statusFilter}
                        count={statusCounts.all}
                        onSelect={setStatusFilter}
                    />
                    <FilterTab
                        id="pending"
                        label="Pending"
                        active={statusFilter}
                        count={statusCounts.pending}
                        tone="amber"
                        onSelect={setStatusFilter}
                    />
                    <FilterTab
                        id="approved"
                        label="Approved"
                        active={statusFilter}
                        count={statusCounts.approved}
                        tone="green"
                        onSelect={setStatusFilter}
                    />
                    <FilterTab
                        id="processing"
                        label="Processing"
                        active={statusFilter}
                        count={statusCounts.processing}
                        tone="blue"
                        onSelect={setStatusFilter}
                    />
                    <FilterTab
                        id="completed"
                        label="Completed"
                        active={statusFilter}
                        count={statusCounts.completed}
                        tone="green"
                        onSelect={setStatusFilter}
                    />
                    <FilterTab
                        id="hold"
                        label="On Hold"
                        active={statusFilter}
                        count={statusCounts.hold}
                        tone="amber"
                        onSelect={setStatusFilter}
                    />
                    <FilterTab
                        id="failed"
                        label="Failed"
                        active={statusFilter}
                        count={statusCounts.failed}
                        tone="red"
                        onSelect={setStatusFilter}
                    />
                </div>
            </div>
            <QuickActionsBar>
                <div className="w-full flex flex-col gap-4">
                    <div className="grid w-full gap-4 md:grid-cols-[1fr_repeat(2,_170px)_auto_auto]">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search seller, amount, status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-[#0f0f0f] border border-gray-700 rounded-xl text-base leading-none text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <input
                            type="date"
                            aria-label="From date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-4 py-4 bg-[#0f0f0f] border border-gray-700 rounded-xl text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/40"
                        />
                        <input
                            type="date"
                            aria-label="To date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-4 py-4 bg-[#0f0f0f] border border-gray-700 rounded-xl text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/40"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setPage(1)
                                setFiltersKey((k) => k + 1)
                                fetchPayoutList({ manual: true })
                            }}
                            className="px-6 py-4 bg-[#00FF89] text-black font-semibold rounded-xl text-base hover:bg-[#12ffa0] transition-colors">
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFromDate('')
                                setToDate('')
                                setPage(1)
                                setFiltersKey((k) => k + 1)
                                fetchPayoutList({ manual: true })
                            }}
                            className="px-6 py-4 bg-[#1b1b1b] text-gray-300 font-medium rounded-xl text-base border border-gray-700 hover:bg-[#222] transition-colors">
                            Clear
                        </button>
                    </div>
                </div>
            </QuickActionsBar>
            {filteredPayoutList.length > 0 && selectedPayoutIds.length === 0 && (
                <div className="bg-[#101010] border border-gray-800 rounded-xl p-4 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                    <span className="font-medium">{filteredPayoutList.length} payouts</span>
                    <button
                        onClick={selectAllVisible}
                        className="px-4 py-2 bg-[#113226] text-[#00FF89] rounded-lg text-xs font-medium border border-[#1d5d45] hover:bg-[#154633']">
                        Select All
                    </button>
                </div>
            )}
            {selectedPayoutIds.length > 0 && (
                <div className="bg-[#101010] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="text-sm text-gray-300 flex items-center gap-3 flex-wrap">
                        <span className="font-medium">{selectedPayoutIds.length} selected</span>
                        {!allVisibleSelected && (
                            <button
                                onClick={selectAllVisible}
                                className="px-3 py-2 bg-[#113226] text-[#00FF89] rounded-lg text-xs font-medium border border-[#1d5d45] hover:bg-[#154633]">
                                Select All
                            </button>
                        )}
                        {allVisibleSelected && (
                            <button
                                onClick={deselectAll}
                                className="px-3 py-2 bg-[#1b1b1b] text-gray-300 rounded-lg text-xs border border-gray-700 hover:bg-[#222]">
                                Deselect All
                            </button>
                        )}
                        <button
                            onClick={() => setActionReasonModal({ open: true, action: 'bulkApprove', payoutId: null })}
                            className="px-4 py-2 bg-[#113226] text-[#00FF89] rounded-lg text-xs font-medium border border-[#1d5d45] hover:bg-[#154633] disabled:opacity-50"
                            disabled={!selectedPayoutIds.some((id) => payoutList.find((p) => p.id === id)?.displayStatus === 'pending')}>
                            Bulk Approve
                        </button>
                        <button
                            onClick={clearSelection}
                            className="px-3 py-2 bg-[#1b1b1b] text-gray-300 rounded-lg text-xs border border-gray-700 hover:bg-[#222]">
                            Clear
                        </button>
                    </div>
                </div>
            )}
            <section
                aria-busy={loading}
                className="transition-opacity duration-200"
                style={{ opacity: listOpacity }}>
                {loading ? (
                    <LoadingSkeleton />
                ) : filteredPayoutList.length === 0 ? (
                    <EmptyState
                        title="No Payouts"
                        description="No payout records found."
                        icon={DollarSign}
                    />
                ) : (
                    <>
                        <div className="space-y-3">
                            {filteredPayoutList.length > VIRTUALIZATION_THRESHOLD ? (
                                <List
                                    height={virtualListHeight}
                                    width={'100%'}
                                    itemCount={filteredPayoutList.length}
                                    itemSize={ROW_HEIGHT}
                                    overscanCount={8}
                                    className="rounded-xl outline-none">
                                    {({ index, style }) => {
                                        const p = filteredPayoutList[index]
                                        return (
                                            <div
                                                style={{ ...style, paddingBottom: 12 }}
                                                key={p.id}>
                                                <MemoizedPayoutRow
                                                    payout={p}
                                                    isActive={expandedId === p.id}
                                                    onToggle={() => handleToggleRow(p.id)}
                                                    updating={updatingId === p.id}
                                                    onUpdateStatus={handleStatusUpdate}
                                                    highlight={highlight}
                                                    selected={selectedPayoutIds.includes(p.id)}
                                                    onSelect={toggleSelect}
                                                />
                                            </div>
                                        )
                                    }}
                                </List>
                            ) : (
                                filteredPayoutList.map((p) => (
                                    <MemoizedPayoutRow
                                        key={p.id}
                                        payout={p}
                                        isActive={expandedId === p.id}
                                        onToggle={() => handleToggleRow(p.id)}
                                        updating={updatingId === p.id}
                                        onUpdateStatus={handleStatusUpdate}
                                        highlight={highlight}
                                        selected={selectedPayoutIds.includes(p.id)}
                                        onSelect={toggleSelect}
                                    />
                                ))
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-sm">
                            <div className="flex items-center gap-3">
                                <label className="text-gray-400">Rows</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value))
                                        setPage(1)
                                        fetchPayoutList({ manual: true })
                                    }}
                                    className="bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF89]/40">
                                    {[20, 50, 100].map((n) => (
                                        <option
                                            key={n}
                                            value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-gray-500">
                                    Page {page} of {totalPages}
                                </span>
                                {totalItems > 0 && <span className="text-gray-600">• {totalItems} total</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => {
                                        if (page > 1) {
                                            setPage((p) => p - 1)
                                            fetchPayoutList({ manual: true })
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg border text-xs font-medium ${page === 1 ? 'opacity-40 cursor-not-allowed bg-[#1b1b1b] border-gray-800 text-gray-500' : 'bg-[#111] border-gray-700 text-gray-300 hover:bg-[#1d1d1d]'}`}>
                                    Prev
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => {
                                        if (page < totalPages) {
                                            setPage((p) => p + 1)
                                            fetchPayoutList({ manual: true })
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg border text-xs font-medium ${page === totalPages ? 'opacity-40 cursor-not-allowed bg-[#1b1b1b] border-gray-800 text-gray-500' : 'bg-[#111] border-gray-700 text-gray-300 hover:bg-[#1d1d1d]'}`}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>
            {expandedId && (
                <PayoutDetailPanel
                    payout={payoutList.find((p) => p.id === expandedId)}
                    details={payoutDetailsCache[expandedId]}
                    loading={detailsLoadingId === expandedId}
                    error={detailsErrorId === expandedId}
                    onClose={() => setExpandedId(null)}
                    onUpdateStatus={handleStatusUpdate}
                    updatingId={updatingId}
                />
            )}
            {actionReasonModal.open && (
                <Modal onClose={() => setActionReasonModal({ open: false, action: null, payoutId: null })}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                            {actionReasonModal.action === 'reject'
                                ? 'Reject Payout'
                                : actionReasonModal.action === 'hold'
                                  ? 'Hold Payout'
                                  : 'Bulk Approve'}
                        </h3>
                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300">
                                {actionReasonModal.action === 'bulkApprove' ? 'Notes (optional)' : 'Reason *'}
                            </label>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder={actionReasonModal.action === 'bulkApprove' ? 'Optional notes...' : 'Enter reason...'}
                                className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                                rows={3}
                            />
                            {reasonTouched && ['reject', 'hold'].includes(actionReasonModal.action) && actionReason.trim().length < 8 && (
                                <p className="text-xs text-red-400">Reason must be at least 8 characters</p>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setActionReasonModal({ open: false, action: null, payoutId: null })}
                                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">
                                Cancel
                            </button>
                            <button
                                disabled={['reject', 'hold'].includes(actionReasonModal.action) && actionReason.trim().length < 8}
                                onClick={handleReasonSubmit}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold ${['reject', 'hold'].includes(actionReasonModal.action) && actionReason.trim().length < 8 ? 'bg-gray-600/60 text-gray-300 cursor-not-allowed' : 'bg-[#00FF89] text-black hover:bg-[#12ffa0]'}`}>
                                Submit
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {transactionModal.open && (
                <Modal onClose={() => setTransactionModal({ open: false, action: null, payoutId: null })}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                            {transactionModal.action === 'processing' ? 'Mark as Processing' : 'Mark as Completed'}
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-300">Transaction ID (optional)</label>
                                <input
                                    type="text"
                                    value={transactionForm.transactionId}
                                    onChange={(e) => setTransactionForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                                    placeholder="Enter transaction ID..."
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-300">Notes (optional)</label>
                                <textarea
                                    value={transactionForm.notes}
                                    onChange={(e) => setTransactionForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Optional notes..."
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setTransactionModal({ open: false, action: null, payoutId: null })}
                                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">
                                Cancel
                            </button>
                            <button
                                onClick={handleTransactionSubmit}
                                className="px-5 py-2 bg-[#00FF89] text-black rounded-lg text-sm font-semibold hover:bg-[#12ffa0]">
                                Submit
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
function PayoutAggregatesBar({ totals }) {
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
function PayoutRow({ payout, isActive, onToggle, updating, onUpdateStatus, highlight, selected, onSelect }) {
    const dateStr = new Date(payout.requestedAt || payout.createdAt).toLocaleDateString()
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`w-full flex items-center justify-between gap-4 p-5 bg-[#171717] border rounded-xl transition-colors text-left ${isActive ? 'border-[#00FF89]/40 ring-1 ring-[#00FF89]/20' : 'border-gray-800 hover:border-gray-700'}`}>
            <div className="flex items-center gap-4 min-w-0 flex-1">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                        e.stopPropagation()
                        onSelect?.(payout.id)
                    }}
                    className="w-4 h-4 rounded border-gray-600 bg-[#111] text-[#00FF89] focus:ring-[#00FF89]/50"
                />
                <div className="w-10 h-10 rounded-lg bg-[#00FF89]/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#00FF89]" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-white font-medium truncate">{highlight(payout.sellerName)}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <MemoizedStatusBadge status={payout.displayStatus} />
                        <span>•</span>
                        <span className="uppercase tracking-wide">{highlight(payout.method)}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-lg font-semibold text-white">${payout.amount?.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{payout.currency}</div>
            </div>
        </button>
    )
}
const MemoizedPayoutRow = memo(PayoutRow)
function PayoutDetailPanel({ payout, details, loading, error, onClose, onUpdateStatus, updatingId }) {
    if (!payout) return null
    let timeline = ['pending', 'approved', 'processing', 'completed']
    if (payout.displayStatus === 'hold') timeline = ['pending', 'approved', 'hold', 'processing', 'completed']
    const currentIndex = timeline.indexOf(payout.displayStatus)
    const actions = []
    const canApprove = payout.displayStatus === 'pending'
    const canProcess = payout.displayStatus === 'approved'
    const canComplete = payout.displayStatus === 'processing'
    const canResume = payout.displayStatus === 'hold'
    const canHold = ['pending', 'approved'].includes(payout.displayStatus)
    const canReject = payout.displayStatus === 'pending'
    if (canApprove) actions.push({ label: 'Approve', next: 'approved', tone: 'green' })
    if (canProcess) actions.push({ label: 'Start Processing', next: 'processing', tone: 'amber' })
    if (canComplete) actions.push({ label: 'Mark Completed', next: 'completed', tone: 'green' })
    if (canHold) actions.push({ label: 'Hold', next: 'hold', tone: 'amber' })
    if (canResume) actions.push({ label: 'Release', next: 'release', tone: 'blue' })
    if (canReject) actions.push({ label: 'Reject', next: 'reject', tone: 'red' })
    const detailsLoading = loading
    const salesIncluded = details?.salesIncluded || details?.sales || []
    const approver = details?.approvedBy || details?.approver
    const audit = details?.audit || details?.history || []
    const transactionId = details?.transactionId || details?.payment?.transactionId
    const notes = details?.notes || details?.adminNotes
    const dateStr = new Date(payout.requestedAt || payout.createdAt).toLocaleString()
    return (
        <div
            className="fixed inset-0 z-40 flex"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            <div
                className="flex-1 bg-black/40 backdrop-blur-sm lg:block hidden"
                onClick={onClose}
            />
            <div className="relative w-full lg:w-[480px] xl:w-[520px] 2xl:w-[560px] h-full bg-[#121212] lg:border-l border-gray-800 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#121212] sticky top-0 z-10">
                    <div className="flex flex-col min-w-0 flex-1 mr-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate">Payout Detail</h3>
                        <span className="text-xs text-gray-400 truncate font-mono">ID: {payout.id}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex-shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-4 py-4 space-y-6">
                    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Progress</h4>
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-700 rounded-full"></div>
                            <div
                                className="absolute top-4 left-6 h-0.5 bg-[#00FF89] rounded-full transition-all duration-500"
                                style={{ width: `${(currentIndex / (timeline.length - 1)) * 100}%` }}></div>
                            {timeline.map((step, i) => {
                                const done = i <= currentIndex
                                const isCurrent = i === currentIndex
                                const isHold = step === 'hold'
                                const circleBase = isHold
                                    ? isCurrent
                                        ? 'bg-[#FFC050] text-black border-2 border-[#FFC050] shadow-lg shadow-[#FFC050]/30'
                                        : 'bg-[#352a14] text-[#FFC050] border-2 border-[#FFC050]/30'
                                    : done
                                      ? 'bg-[#00FF89] text-black border-2 border-[#00FF89] shadow-lg shadow-[#00FF89]/30'
                                      : 'bg-gray-800 text-gray-500 border-2 border-gray-600'
                                const labelClass = isHold
                                    ? isCurrent
                                        ? 'text-[#FFC050] font-semibold'
                                        : 'text-[#FFC050]/70'
                                    : done
                                      ? 'text-[#00FF89] font-semibold'
                                      : 'text-gray-500'
                                const stepLabels = {
                                    pending: 'Pending',
                                    approved: 'Approved',
                                    processing: 'Processing',
                                    completed: 'Completed',
                                    hold: 'On Hold'
                                }
                                return (
                                    <div
                                        key={step}
                                        className="flex flex-col items-center relative z-10">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${circleBase}`}>
                                            {isCurrent && (isHold ? '⚠' : '●')}
                                            {done && !isCurrent && '✓'}
                                            {!done && !isCurrent && i + 1}
                                        </div>
                                        <span className={`text-[10px] mt-2 capitalize tracking-wide text-center leading-tight ${labelClass}`}>
                                            {stepLabels[step] || step}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-xl p-4 border border-gray-800 shadow-lg">
                        <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#00FF89]" />
                            Payout Summary
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                                <span className="text-sm text-gray-400 font-medium">Amount</span>
                                <span className="text-2xl font-bold text-white">
                                    ${payout.amount?.toFixed(2)} <span className="text-sm text-gray-400 font-normal">{payout.currency}</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                                <span className="text-sm text-gray-400 font-medium">Seller</span>
                                <span className="text-sm text-gray-200 font-semibold truncate max-w-[60%] text-right">{payout.sellerName}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                                <span className="text-sm text-gray-400 font-medium">Method</span>
                                <span className="text-sm text-gray-200 font-semibold uppercase tracking-wide">{payout.method}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                                <span className="text-sm text-gray-400 font-medium">Status</span>
                                <MemoizedStatusBadge status={payout.displayStatus} />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-400 font-medium">Requested</span>
                                <span className="text-xs text-gray-300 font-mono text-right leading-tight">
                                    {new Date(payout.requestedAt || payout.createdAt).toLocaleDateString()}
                                    <br />
                                    <span className="text-gray-500">{new Date(payout.requestedAt || payout.createdAt).toLocaleTimeString()}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    {detailsLoading && (
                        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin text-[#00FF89]" />
                                <span>Loading additional details...</span>
                            </div>
                        </div>
                    )}
                    {details && !detailsLoading && !error && (
                        <div className="space-y-4">
                            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Transaction Details</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <InfoRow
                                        label="Transaction ID"
                                        value={transactionId || 'Not assigned'}
                                    />
                                    <InfoRow
                                        label="Approver"
                                        value={approver ? approver.name || approver.email || approver.id : 'Pending approval'}
                                    />
                                    <InfoRow
                                        label="Notes"
                                        value={notes || 'No notes available'}
                                    />
                                </div>
                            </div>
                            {salesIncluded.length > 0 && (
                                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                                        Included Sales ({salesIncluded.length})
                                    </h4>
                                    <div className="max-h-48 overflow-auto space-y-2">
                                        {salesIncluded.map((s) => (
                                            <div
                                                key={s.id || s.saleId}
                                                className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-gray-800/50">
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="text-sm text-gray-200 font-medium truncate"
                                                        title={s.productName || s.title}>
                                                        {s.productName || s.title || 'Sale'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">
                                                        #{(s.id || s.saleId || '').toString().slice(-8)}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-bold text-[#00FF89] ml-3">
                                                    ${Number(s.amount || s.total || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {Array.isArray(audit) && audit.length > 0 && (
                                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Activity Log</h4>
                                    <div className="space-y-3 max-h-40 overflow-auto">
                                        {audit.slice(0, 6).map((ev, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-gray-800/50">
                                                <span className="w-2 h-2 bg-[#00FF89] rounded-full mt-2 flex-shrink-0"></span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-300 font-medium">{ev.action || ev.status || 'Activity'}</p>
                                                    {ev.by && (
                                                        <p className="text-xs text-gray-500 mt-1">by {ev.by.name || ev.by.email || ev.by.id}</p>
                                                    )}
                                                    {ev.at && (
                                                        <p className="text-xs text-gray-600 mt-1 font-mono">{new Date(ev.at).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {actions.length > 0 && (
                    <div className="px-4 py-4 border-t border-gray-800 bg-[#121212] sticky bottom-0">
                        <div className="flex flex-wrap gap-2">
                            {actions.map((a) => (
                                <button
                                    key={a.label}
                                    disabled={updatingId === payout.id}
                                    onClick={() => onUpdateStatus(payout.id, a.next, payout.displayStatus)}
                                    className={`flex-1 min-w-0 px-4 py-3 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                                        updatingId === payout.id ? 'opacity-50 cursor-wait' : ''
                                    } ${
                                        a.tone === 'green'
                                            ? 'bg-[#113226] text-[#00FF89] border-[#1d5d45] hover:bg-[#154633] shadow-lg shadow-[#00FF89]/10'
                                            : a.tone === 'amber'
                                              ? 'bg-[#352a14] text-[#FFC050] border-[#4a3614] hover:bg-[#423016] shadow-lg shadow-[#FFC050]/10'
                                              : a.tone === 'red'
                                                ? 'bg-[#3a1515] text-red-300 border-red-800/40 hover:bg-[#4a1c1c] shadow-lg shadow-red-500/10'
                                                : 'bg-[#1e293b] text-sky-300 border-sky-800/40 hover:bg-[#243349] shadow-lg shadow-sky-500/10'
                                    }`}>
                                    {updatingId === payout.id ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Updating...</span>
                                        </div>
                                    ) : (
                                        a.label
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-400 font-medium">{label}</span>
            <span
                className="text-sm text-gray-200 font-mono text-right max-w-[60%] truncate"
                title={value}>
                {value}
            </span>
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
    const label = status === 'hold' ? 'Hold' : status
    return (
        <span
            className={`px-2 py-1 rounded-full border text-[11px] font-medium capitalize ${map[status] || 'bg-gray-700/40 text-gray-300 border-gray-600/40'}`}>
            {label}
        </span>
    )
}
const MemoizedStatusBadge = memo(StatusBadge)
function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
                {children}
            </div>
        </div>
    )
}