'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import Link from 'next/link'
import {
  Plus, Package, ShoppingCart, BarChart3, Users, CreditCard, AlertCircle,
  FileText, CheckCircle2, XCircle, Loader2, TrendingUp, Star, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import sellerAPI from '@/lib/api/seller'
import { leagueSpartan } from '@/lib/fonts'

/* ========================= THEME ========================= */
export const theme = {
  colors: {
    brand: {
      primary: '#00FF89',
      primaryText: '#121212',
      secondary: '#FFC050',
      white: '#FFFFFF',
      dark: '#121212'
    },
    background: { dark: '#121212', card: { dark: '#1f1f1f' } },
    text: { secondary: { dark: '#9ca3af' } }
  }
}

/* ========================= PRIMITIVES ========================= */
function Card({ children, className = '', variant = 'elevated', style }) {
  return (
    <div
      className={[
        'rounded-2xl border border-[#2b2b2b]',
        variant === 'elevated' ? 'shadow-[0_1px_0_rgba(255,255,255,0.03)]' : '',
        'bg-[#1f1f1f] transition-all'
      ].join(' ') + (className ? ` ${className}` : '')}
      style={{ fontFamily: 'League Spartan, sans-serif', ...style }}
    >
      {children}
    </div>
  )
}
const CardHeader = ({ children, className = '' }) => <div className={`px-5 pt-5 ${className}`}>{children}</div>
const CardContent = ({ children, className = '' }) => <div className={`px-5 pb-5 ${className}`}>{children}</div>
const CardFooter = ({ children, className = '' }) => <div className={`px-5 pb-5 ${className}`}>{children}</div>

/* ========================= SHELL ========================= */
/** Layout uses a 12-col grid with consistent gutters.
 *  areaA: identity + stats (stacks on mobile)
 *  areaB: quick actions + main feed
 *  areaC: right rail (readiness + metrics + payout)
 */
function SellerShell({ header, sidebar, statsRow, children, rightRail }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.dark, fontFamily: 'League Spartan, sans-serif' }}>
      {header}
      <div className="mx-auto w-full max-w-[120rem] px-3 sm:px-6 lg:px-8">
        {/* TOP ROW: identity + stats aligned on same baseline */}
        <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-6 pt-6">
          {sidebar ? <div className="col-span-12 lg:col-span-4">{sidebar}</div> : null}
          {statsRow ? <div className="col-span-12 lg:col-span-8">{statsRow}</div> : null}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-6 py-6">
          {/* MAIN CONTENT */}
          <div className="col-span-12 xl:col-span-8 space-y-6">
            {children}
          </div>

          {/* RIGHT RAIL */}
          <div className="col-span-12 xl:col-span-4 space-y-6">
            {rightRail}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========================= SIDEBAR IDENTITY ========================= */
function SellerIdentity({ seller, verificationApproved }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl"
               style={{ background: `linear-gradient(135deg, ${theme.colors.brand.primary}, ${theme.colors.brand.secondary})` }}/>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">{seller.fullName}</h3>
            <p className="truncate text-sm" style={{ color: theme.colors.text.secondary.dark }}>{seller.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-xl border border-[#2b2b2b] px-3 py-2">
          <span className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>Verification</span>
          <div className="flex items-center gap-2">
            {verificationApproved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-white">Approved</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-white">Pending</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ========================= STATS (equal height + perfect align) ========================= */
function StatTile({ title, value, sub, Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group h-full w-full rounded-2xl border border-[#2b2b2b] bg-[#1f1f1f] p-5 text-left transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>{title}</p>
          <p className="mt-1 truncate text-2xl font-bold text-white">{value}</p>
          {sub ? <p className="mt-1 text-xs" style={{ color: theme.colors.text.secondary.dark }}>{sub}</p> : null}
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(0,255,137,0.12)', color: theme.colors.brand.primary }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </button>
  )
}

function StatsRow({ stats, onStatClick }) {
  const avg = Number(stats.averageRating || 0)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 h-full">
      <StatTile title="Total Earnings" value={stats.formatted.totalEarnings} sub="All time" Icon={CreditCard} onClick={() => onStatClick('earnings')} />
      <StatTile title="Total Sales" value={String(stats.totalSales)} sub="Orders completed" Icon={ShoppingCart} onClick={() => onStatClick('sales')} />
      <StatTile title="Active Products" value={String(stats.totalProducts)} sub="Live in store" Icon={Package} onClick={() => onStatClick('products')} />
      <StatTile title="Avg. Rating" value={avg.toFixed(1)} sub={`${stats.totalReviews} reviews`} Icon={Star} onClick={() => onStatClick('rating')} />
    </div>
  )
}

/* ========================= QUICK ACTIONS (equal tiles) ========================= */
function QuickActions({ permissions }) {
  const actions = [
    { label: 'Products', icon: Package, href: '/seller/products', gradient: `linear-gradient(135deg, ${theme.colors.brand.primary}, #34d399)`, ok: permissions.canAddProducts, sub: 'Manage your products' },
    { label: 'Orders', icon: ShoppingCart, href: '/seller/orders', gradient: 'linear-gradient(135deg,#a855f7,#ec4899)', ok: permissions.canManageOrders, sub: 'View and manage orders' },
    { label: 'Analytics', icon: BarChart3, href: '/seller/analytics', gradient: 'linear-gradient(135deg,#3b82f6,#22d3ee)', ok: permissions.canViewAnalytics, sub: 'View detailed analytics' },
    { label: 'Customers', icon: Users, href: '/seller/customers', gradient: `linear-gradient(135deg, ${theme.colors.brand.secondary}, #fb923c)`, ok: permissions.canViewAnalytics, sub: 'Manage relationships' }
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {actions.map(a => {
        const Tile = (
          <Card key={a.label} className={`h-full ${a.ok ? 'hover:shadow-lg' : 'opacity-60'}`}>
            <CardContent className="p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: a.gradient }}>
                <a.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-1 font-semibold text-white">{a.label}</h3>
              <p className="text-xs" style={{ color: theme.colors.text.secondary.dark }}>
                {a.ok ? a.sub : 'Complete verification first'}
              </p>
            </CardContent>
          </Card>
        )
        return a.ok ? (
          <Link key={a.label} href={a.href} className="block h-full">{Tile}</Link>
        ) : (
          <div key={a.label} className="h-full cursor-not-allowed">{Tile}</div>
        )
      })}
    </div>
  )
}

/* ========================= BUSINESS READINESS & METRICS ========================= */
function BusinessReadiness({ permissions, seller }) {
  const items = [
    { label: 'Account Verified', done: !!permissions.isApproved },
    { label: 'Commission Accepted', done: !!permissions.commissionAccepted || !!seller?.commissionOffer?.acceptedAt },
    { label: 'First Product Added', done: (seller?.stats?.totalProducts ?? 0) > 0 },
  ]
  const completed = items.filter(i => i.done).length
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">Business Readiness</h3></CardHeader>
      <CardContent className="space-y-3">
        {items.map(i => (
          <div key={i.label} className="flex items-center justify-between rounded-xl border border-[#2b2b2b] px-3 py-2">
            <span className="text-sm text-white">{i.label}</span>
            {i.done ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-amber-400" />}
          </div>
        ))}
        <div className="pt-1 text-sm" style={{ color: theme.colors.text.secondary.dark }}>{completed} of {items.length} completed</div>
      </CardContent>
    </Card>
  )
}

function MetricsCard({ stats }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Last 7 days performance</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {['Impressions','Clicks','CTR','ROAS'].map(k => (
            <div key={k} className="rounded-xl border border-[#2b2b2b] p-4">
              <p className="text-xs" style={{ color: theme.colors.text.secondary.dark }}>{k}</p>
              <p className="mt-1 text-lg font-semibold text-white">{stats.metrics?.[k.toLowerCase()] ?? '—'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PayoutInfo({ seller, formatCurrency }) {
  if (!seller?.payoutInfo) return null
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">Payout Information</h3></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>Available Balance</span>
          <span className="text-xl font-bold" style={{ color: theme.colors.brand.primary }}>
            {formatCurrency(seller.stats?.totalEarnings || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>Method</span>
          <div className="flex items-center gap-2">
            <span className="text-sm capitalize text-white">{seller.payoutInfo.method}</span>
            {seller.payoutInfo.isVerified
              ? <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">Verified</span>
              : <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">Pending</span>}
          </div>
        </div>
        {seller.payoutInfo.paypalEmail && (
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>PayPal</span>
            <span className="max-w-[12rem] truncate text-sm text-white">{seller.payoutInfo.paypalEmail}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/seller/payouts"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#00FF8955] px-4 py-2 font-medium"
              style={{ color: theme.colors.brand.primary }}>
          <CreditCard className="h-4 w-4" /> Manage Payouts
        </Link>
      </CardFooter>
    </Card>
  )
}

/* ========================= VERIFICATION ALERTS ========================= */
function VerificationAlerts({ approved, seller, onUpload }) {
  // Hide verification alerts if seller is approved OR in commission negotiation phase
  const shouldHideAlerts = approved || 
    seller?.verification?.status === 'commission_offered' ||
    seller?.verification?.status === 'approved'
  
  if (shouldHideAlerts) return null
  
  // Show different messages based on verification status
  const getAlertContent = () => {
    switch (seller?.verification?.status) {
      case 'pending':
        return {
          title: 'Complete Your Verification',
          message: 'Upload KYC documents and complete business verification to unlock product listing and analytics.',
          showUploadButton: true
        }
      case 'under_review':
        return {
          title: 'Verification Under Review',
          message: 'Your documents are being reviewed by our team. We\'ll update you within 24-48 hours.',
          showUploadButton: false
        }
      case 'rejected':
        return {
          title: 'Verification Rejected',
          message: seller?.verification?.feedback || 'Your verification was rejected. Please resubmit with correct documents.',
          showUploadButton: true
        }
      default:
        return {
          title: 'Complete Your Verification',
          message: 'Upload KYC documents and complete business verification to unlock product listing and analytics.',
          showUploadButton: true
        }
    }
  }

  const alertContent = getAlertContent()
  
  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">{alertContent.title}</h3>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>
          {alertContent.message}
        </p>
        <div className="flex flex-wrap gap-3">
          {alertContent.showUploadButton && (
            <button onClick={onUpload}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: theme.colors.brand.primary, color: theme.colors.brand.primaryText }}>
              <FileText className="h-4 w-4" /> Upload Documents
            </button>
          )}
          <Link href="/seller/verification" className="text-sm underline text-white">View Requirements</Link>
        </div>
      </CardContent>
    </Card>
  )
}

/* ========================= COMMISSION NEGOTIATION ========================= */
const CommissionNegotiation = ({ negotiationState, onAccept, onCounterOffer }) => {
  const [counterOfferRate, setCounterOfferRate] = useState('')
  const [counterOfferReason, setCounterOfferReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isWaitingForAdmin = negotiationState?.status === 'counter_offered' && negotiationState?.lastOfferedBy === 'seller'
  const isWaitingForSeller = negotiationState?.status === 'counter_offered' && negotiationState?.lastOfferedBy === 'admin'
  const isPendingOffer = negotiationState?.status === 'pending'

  const handleCounterOffer = async () => {
    if (!counterOfferRate || !counterOfferReason) return
    
    setIsSubmitting(true)
    try {
      await onCounterOffer(parseFloat(counterOfferRate), counterOfferReason)
      setCounterOfferRate('')
      setCounterOfferReason('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-yellow-500/20 bg-yellow-500/5">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Clock className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-2">
              Commission Rate Negotiation
            </h3>
            
            {isWaitingForAdmin ? (
              <div className="space-y-3">
                <p className="text-white">
                  Your counter offer of <span className="font-semibold text-yellow-400">{negotiationState.counterOffer?.rate}%</span> has been submitted.
                </p>
                <p className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>
                  Reason: {negotiationState.counterOffer?.reason}
                </p>
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                  <span className="text-sm">Waiting for admin response...</span>
                </div>
              </div>
            ) : isWaitingForSeller ? (
              <div className="space-y-4">
                <p className="text-white">
                  Admin has offered a commission rate of <span className="font-semibold text-yellow-400">{negotiationState.currentRate}%</span>
                </p>
                <p className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>
                  Negotiation Round: {negotiationState.negotiationRound}
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => onAccept(negotiationState.currentRate)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Accept {negotiationState.currentRate}%
                  </button>
                  <button
                    onClick={() => document.getElementById('counter-offer-form').style.display = 'block'}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Counter Offer
                  </button>
                </div>

                <div id="counter-offer-form" className="hidden space-y-3 pt-4 border-t border-yellow-500/20">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Your Counter Offer Rate (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="0.5"
                      value={counterOfferRate}
                      onChange={(e) => setCounterOfferRate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#2b2b2b] bg-[#1f1f1f] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter rate"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Reason for Counter Offer
                    </label>
                    <textarea
                      value={counterOfferReason}
                      onChange={(e) => setCounterOfferReason(e.target.value)}
                      className="w-full px-3 py-2 border border-[#2b2b2b] bg-[#1f1f1f] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      rows="3"
                      placeholder="Explain why you're requesting this rate"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCounterOffer}
                      disabled={!counterOfferRate || !counterOfferReason || isSubmitting}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Counter Offer'}
                    </button>
                    <button
                      onClick={() => {
                        document.getElementById('counter-offer-form').style.display = 'none'
                        setCounterOfferRate('')
                        setCounterOfferReason('')
                      }}
                      className="px-4 py-2 bg-[#2b2b2b] text-white rounded-md hover:bg-[#404040] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : isPendingOffer ? (
              <div className="space-y-3">
                <p className="text-white">
                  Your verification is complete. Admin will offer a commission rate soon.
                </p>
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                  <span className="text-sm">Waiting for commission offer...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-white">
                  Commission negotiation in progress...
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ========================= UPLOAD MODAL ========================= */
function DocumentUploadModal({ open, onClose, onSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState({ identityProof: null, businessProof: null, taxDocument: null })
  if (!open) return null

  const submit = async () => {
    try {
      if (!files.identityProof && !files.businessProof && !files.taxDocument) {
        toast.error('Please select at least one document'); return
      }
      setUploading(true)
      const fd = new FormData()
      if (files.identityProof) fd.append('identityProof', files.identityProof)
      if (files.businessProof) fd.append('businessProof', files.businessProof)
      if (files.taxDocument) fd.append('taxDocument', files.taxDocument)
      await sellerAPI.submitVerification(fd)
      toast.success('Documents submitted for verification')
      onSuccess()
    } catch (e) {
      toast.error(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2b2b2b] bg-[#1f1f1f] p-6">
        <h3 className="text-xl font-semibold text-white">Upload Documents</h3>
        <p className="mt-1 text-sm" style={{ color: theme.colors.text.secondary.dark }}>PAN / GST / Business Proof</p>
        <div className="mt-4 grid gap-3">
          {['identityProof','businessProof','taxDocument'].map(key => (
            <label key={key} className="block text-sm text-white">
              {key.replace(/([A-Z])/g,' $1')}
              <input type="file" accept="image/*,application/pdf"
                     onChange={(e)=>setFiles(f=>({...f,[key]:e.target.files?.[0]||null}))}
                     className="mt-1 w-full rounded-lg border border-[#2b2b2b] bg-[#1f1f1f] px-3 py-2 text-sm text-white"/>
            </label>
          ))}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border border-[#2b2b2b] px-4 py-2 text-sm text-white">Cancel</button>
            <button onClick={submit} disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
                    style={{ backgroundColor: theme.colors.brand.primary, color: theme.colors.brand.primaryText }}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========================= DATA HOOK (sellerAPI) ========================= */
function useSellerDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState('INR')
  const [seller, setSeller] = useState(null)
  const [stats, setStats] = useState({ totalEarnings: 0, totalSales: 0, totalProducts: 0, averageRating: 0, totalReviews: 0, formatted: { totalEarnings: '₹0' }, metrics: {} })
  const [permissions, setPermissions] = useState({ isApproved: false, commissionAccepted: false, canAddProducts: false, canManageOrders: false, canViewAnalytics: false })
  const [negotiationState, setNegotiationState] = useState(null)
  const [processingOffer, setProcessingOffer] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const profile = await sellerAPI.getProfile()
      const d = profile?.data || profile || {}
      // Fix: Include commission_offered as approved status since verification is complete at that stage
      const isApproved = d?.verification?.status === 'approved' || d?.verification?.status === 'commission_offered'
      // Fix: Only check commission offer status, not revenue share agreement
      const commissionAccepted = d?.commissionOffer?.status === 'accepted'

      setSeller({
        fullName: d.fullName,
        email: d.email,
        bio: d.bio,
        payoutInfo: {
          method: d?.payoutInfo?.method || 'bank transfer',
          paypalEmail: d?.payoutInfo?.paypalEmail || '',
          isVerified: !!d?.payoutInfo?.isVerified,
        },
        commissionOffer: { acceptedAt: d?.commissionOffer?.acceptedAt || null, rate: d?.commissionOffer?.rate ?? 10 },
        revenueShareAgreement: { accepted: d?.revenueShareAgreement?.accepted ?? false },
        verification: {
          status: d?.verification?.status || 'pending',
          submittedAt: d?.verification?.submittedAt || null,
          documents: d?.verification?.documents || [],
          feedback: d?.verification?.feedback || null,
        },
        completionPercentage: d?.completionPercentage || 0,
      })

      setStats({
        totalEarnings: d?.stats?.totalEarnings ?? 0,
        totalSales: d?.stats?.totalSales ?? 0,
        totalProducts: d?.stats?.totalProducts ?? 0,
        averageRating: d?.stats?.averageRating ?? 0,
        totalReviews: d?.stats?.totalReviews ?? 0,
        formatted: {
          totalEarnings: new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedCurrency, maximumFractionDigits: 0 })
            .format(d?.stats?.totalEarnings ?? 0)
        },
        metrics: { impressions: '—', clicks: '—', ctr: '—', roas: '—' }
      })

      setPermissions({
        isApproved,
        commissionAccepted,
        canAddProducts: isApproved && commissionAccepted, // Only allow products after commission is accepted
        canManageOrders: isApproved && commissionAccepted,
        canViewAnalytics: isApproved && commissionAccepted
      })

      // Fix the commission negotiation state logic
      const hasCommissionOffer = d?.verification?.status === 'commission_offered'
      const commissionStatus = d?.commissionOffer?.status
      const commissionAcceptedAt = d?.commissionOffer?.acceptedAt
      
      // Show negotiation if there's an offer and it hasn't been accepted yet
      const shouldShowNegotiation = hasCommissionOffer && !commissionAcceptedAt && commissionStatus !== 'accepted'

      setNegotiationState(shouldShowNegotiation ? {
        isAccepted: false,
        currentRate: d?.commissionOffer?.rate || 10,
        negotiationRound: d?.commissionOffer?.negotiationRound || 1,
        lastOfferedBy: d?.commissionOffer?.lastOfferedBy || 'admin',
        status: d?.commissionOffer?.status || 'pending',
        counterOffer: d?.commissionOffer?.counterOffer || null
      } : null)

      setError(null)
    } catch (e) {
      setError({ message: e?.message || 'Failed to load seller profile' })
    } finally {
      setLoading(false)
    }
  }, [selectedCurrency])

  useEffect(() => { load() }, [load])

  const formatCurrency = useCallback((amount) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedCurrency, maximumFractionDigits: 0 }).format(amount)
    } catch { return `₹${Math.round(amount).toLocaleString('en-IN')}` }
  }, [selectedCurrency])

  const accept = async () => {
    try { setProcessingOffer(true); await sellerAPI.acceptCommissionOffer(); toast.success('Offer accepted'); await load(); return true }
    catch (e) { toast.error(e?.message || 'Accept failed'); return false }
    finally { setProcessingOffer(false) }
  }
  const counter = async ({ rate, reason }) => {
    try { await sellerAPI.submitCounterOffer({ rate, reason }); return true }
    catch (e) { toast.error(e?.message || 'Counter failed'); return false }
  }
  const reject = async (reason) => {
    try { await sellerAPI.rejectCommissionOffer(reason || 'Not viable'); toast.message('Offer rejected'); return true }
    catch (e) { toast.error(e?.message || 'Reject failed'); return false }
  }

  const refresh = async () => { await load() }

  return {
    seller, loading, error, stats, selectedCurrency, setSelectedCurrency, formatCurrency,
    verificationStatus: { isApproved: permissions.isApproved },
    negotiationState, permissions,
    handleAcceptOffer: accept, handleCounterOffer: counter, handleRejectOffer: reject,
    processingOffer, refresh
  }
}

/* ========================= CURRENCY ========================= */
function CurrencySelector({ selectedCurrency, onChange }) {
  const currencies = useMemo(() => [
    { code: 'USD', label: 'USD ($)' }, { code: 'INR', label: 'INR (₹)' }, { code: 'EUR', label: 'EUR (€)' },
    { code: 'GBP', label: 'GBP (£)' }, { code: 'AUD', label: 'AUD (A$)' }, { code: 'CAD', label: 'CAD (C$)' },
    { code: 'SGD', label: 'SGD (S$)' }, { code: 'AED', label: 'AED' },
  ], [])
  return (
    <div className="relative">
      <select
        value={selectedCurrency}
        onChange={(e)=>onChange(e.target.value)}
        className="appearance-none border border-[#374151] bg-[#1f1f1f] px-3 py-2 pr-8 text-sm text-white rounded-lg focus:outline-none"
      >
        {currencies.map(c => <option key={c.code} value={c.code} className="bg-[#1f1f1f] text-white">{c.label}</option>)}
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

/* ========================= PAGE ========================= */
export default function SellerProfile() {
  const router = useRouter()
  const {
    seller, loading, error, stats, selectedCurrency, setSelectedCurrency, formatCurrency,
    verificationStatus, negotiationState, permissions,
    handleAcceptOffer, handleCounterOffer, handleRejectOffer, processingOffer, refresh
  } = useSellerDashboard()

  const [showUpload, setShowUpload] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)

  const onAccept = async () => {
    const ok = await handleAcceptOffer()
    if (ok) { setShowSuccess(true); setTimeout(()=>setShowSuccess(false), 1300) }
  }
  const onCounter = async (data) => { const ok = await handleCounterOffer(data); if (ok) toast.success('Counter offer submitted') }
  const onReject = async (reason) => { const ok = await handleRejectOffer(reason); if (ok) toast.success('Offer rejected') }

  const handleStatClick = (k) => {
    const r = { earnings: '/seller/analytics?tab=earnings', sales: '/seller/orders', products: '/seller/products', rating: '/seller/analytics?tab=reviews' }
    if (permissions.canViewAnalytics && r[k]) router.push(r[k])
  }

  const onUploadSuccess = () => {
    setShowUpload(false)
    refresh()
  }

  // Priority logic: Show verification alert first, then commission negotiation
  const shouldShowVerificationAlert = !verificationStatus.isApproved
  const shouldShowCommissionNegotiation = !shouldShowVerificationAlert && negotiationState

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.dark }}>
        <div className="mx-auto w-full max-w-[120rem] px-3 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className={`col-span-12 ${i<2?'lg:col-span-6':'lg:col-span-4'} h-28 rounded-2xl animate-pulse`} style={{ background:'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ backgroundColor: theme.colors.background.dark }}>
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-white">{error ? 'Error Loading Profile' : 'No Seller Profile Found'}</h1>
          <p className="mb-6" style={{ color: theme.colors.text.secondary.dark }}>
            {error ? error.message : 'You need to create a seller profile first.'}
          </p>
          <Link href="/become-seller"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold"
                style={{ backgroundColor: theme.colors.brand.primary, color: theme.colors.brand.primaryText }}>
            <Plus className="h-5 w-5" /> Create Seller Profile
          </Link>
        </div>
      </div>
    )
  }

  /* --------- HEADER (sticky, compact) --------- */
  const header = (
    <div className="sticky top-0 z-40 border-b border-[#374151] backdrop-blur-sm"
         style={{ backgroundColor: 'rgba(31,31,31,0.85)' }}>
      <div className="mx-auto flex w-full max-w-[120rem] items-center justify-between px-3 sm:px-6 lg:px-8 py-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {seller.fullName}</h1>
          <p className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>Manage your seller dashboard</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <CurrencySelector selectedCurrency={selectedCurrency} onChange={setSelectedCurrency} />
          <Link href="/seller/products/new"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium sm:px-4"
                style={{ backgroundColor: theme.colors.brand.primary, color: theme.colors.brand.primaryText }}>
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>
    </div>
  )

  /* --------- SIDEBAR + STATS ROW --------- */
  const sidebar = <SellerIdentity seller={seller} verificationApproved={verificationStatus.isApproved} />
  const statsRow = <StatsRow stats={stats} onStatClick={handleStatClick} />

  /* --------- MAIN CONTENT --------- */
  const main = (
    <>
      {/* Priority notification display - only show one at a time */}
      {shouldShowVerificationAlert && (
        <VerificationAlerts 
          approved={verificationStatus.isApproved} 
          seller={seller}
          onUpload={() => setShowUpload(true)} 
        />
      )}

      {shouldShowCommissionNegotiation && (
        <CommissionNegotiation
          negotiationState={negotiationState}
          onAccept={onAccept}
          onCounterOffer={onCounter}
        />
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <QuickActions permissions={permissions} />
      </section>

      <Card>
        <CardHeader><h3 className="text-lg font-semibold text-white">Recent Activity</h3></CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: theme.colors.text.secondary.dark }}>
            Your recent orders, reviews, and payouts will appear here.
          </p>
        </CardContent>
      </Card>
    </>
  )

  /* --------- RIGHT RAIL --------- */
  const rightRail = (
    <>
      <BusinessReadiness permissions={permissions} seller={{ commissionOffer: seller.commissionOffer, stats: { totalProducts: stats.totalProducts } }} />
      <MetricsCard stats={stats} />
      <PayoutInfo seller={seller} formatCurrency={formatCurrency} />
    </>
  )

  return (
    <div className={`${leagueSpartan.className} min-h-screen bg-[#0a0a0a] text-white`}>
      <Head>
        <title>Seller Dashboard - {seller.fullName} | Spyke AI</title>
        <meta name="description" content={`Manage your AI tools, track sales, and grow your business on Spyke AI marketplace. ${seller.bio || ''}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://spyke.ai/seller/profile" />
      </Head>

      <SellerShell header={header} sidebar={sidebar} statsRow={statsRow} rightRail={rightRail}>
        {main}
      </SellerShell>

      <DocumentUploadModal open={showUpload} onClose={()=>setShowUpload(false)} onSuccess={onUploadSuccess} />

      {showCounterOfferModal && (
        <CounterOfferModal
          open={showCounterOfferModal}
          onClose={() => setShowCounterOfferModal(false)}
          onSubmit={async (data) => {
            const success = await handleCounterOffer(data)
            if (success) {
              setShowCounterOfferModal(false)
              refresh()
              toast.success('Counter offer submitted!')
            }
          }}
          currentRate={negotiationState?.currentRate || 10}
        />
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-bounce rounded-2xl border border-emerald-500/30 bg-[#1f1f1f] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l-4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Offer Accepted!</h3>
            <p className="text-gray-400">You can now start adding products and earning at {negotiationState?.currentRate}% commission</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ========================= COUNTER OFFER MODAL ========================= */
function CounterOfferModal({ open, onClose, onSubmit, currentRate }) {
  const [rate, setRate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rate || !reason) {
      toast.error('Please fill in all fields')
      return
    }

    const rateNum = parseFloat(rate)
    if (isNaN(rateNum) || rateNum < 1 || rateNum > 50) {
      toast.error('Please enter a valid commission rate between 1% and 50%')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ rate: rateNum, reason })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2b2b2b] bg-[#1f1f1f] p-6">
        <h3 className="text-xl font-semibold text-white">Submit Counter Offer</h3>
        <p className="mt-1 text-sm" style={{ color: theme.colors.text.secondary.dark }}>
          Current rate: {currentRate}%
        </p>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Proposed Commission Rate (%)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min="1"
              max="50"
              step="0.1"
              placeholder="e.g., 8.5"
              className="w-full rounded-lg border border-[#2b2b2b] bg-[#1f1f1f] px-3 py-2 text-white placeholder-gray-400 focus:border-[#00FF89] focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reason for Counter Offer
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this rate works better for your business..."
              rows={3}
              className="w-full rounded-lg border border-[#2b2b2b] bg-[#1f1f1f] px-3 py-2 text-white placeholder-gray-400 focus:border-[#00FF89] focus:outline-none resize-none"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#2b2b2b] px-4 py-2 text-sm text-white hover:bg-[#2b2b2b] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 transition-colors"
              style={{ backgroundColor: theme.colors.brand.primary, color: theme.colors.brand.primaryText }}
            >
              {submitting ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
