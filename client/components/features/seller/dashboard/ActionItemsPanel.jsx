'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, PlusCircle, FileText, DollarSign } from 'lucide-react'

/**
 * Derives prioritized action items for seller onboarding / operations
 */
export default function ActionItemsPanel({ seller, products = [], onUploadDocs }) {
  const tasks = useMemo(() => {
    if (!seller) return []
    const list = []
    const verificationStatus = seller?.verification?.status
    const commissionStatus = seller?.commissionOffer?.status

    // 1. Upload documents (pending)
    if (verificationStatus === 'pending') {
      list.push({
        id: 'upload_docs',
        title: 'Upload Verification Documents',
        desc: 'Submit required KYC / business documents to start selling.',
        action: { label: 'Upload', onClick: () => onUploadDocs?.() },
        icon: FileText,
        variant: 'primary'
      })
    }

    // 2. Accept / finalize commission
    if (verificationStatus === 'commission_offered' && commissionStatus !== 'accepted') {
      list.push({
        id: 'commission_offer',
        title: commissionStatus === 'pending' ? 'Accept Commission Offer' : 'Commission Negotiation In Progress',
        desc: commissionStatus === 'pending' ? 'Review and accept the platform commission to unlock product creation.' : 'Awaiting platform response to your counter offer.',
        href: '/seller/profile',
        cta: commissionStatus === 'pending' ? 'Review Offer' : 'View Status',
        icon: DollarSign,
        variant: 'primary'
      })
    }

    // 3. Add first product
    const canAddProducts = verificationStatus === 'approved' && commissionStatus === 'accepted'
    if (canAddProducts && products.length === 0) {
      list.push({
        id: 'first_product',
        title: 'Add Your First Product',
        desc: 'Start listing products to generate sales and analytics.',
        href: '/seller/products/new',
        cta: 'Create Product',
        icon: PlusCircle,
        variant: 'default'
      })
    }

    // 4. Complete profile details
    const incomplete = ['businessName','website','bio'].some(k => !seller?.[k])
    if (incomplete) {
      list.push({
        id: 'complete_profile',
        title: 'Complete Profile Details',
        desc: 'Add business name, website and bio to build buyer trust.',
        href: '/seller/profile',
        cta: 'Update Profile',
        icon: AlertCircle,
        variant: 'default'
      })
    }

    // If no tasks
    if (list.length === 0) {
      list.push({
        id: 'all_done',
        title: 'You are all set!',
        desc: 'No pending onboarding actions. Monitor performance below.',
        done: true,
        icon: CheckCircle,
        variant: 'success'
      })
    }
    return list
  }, [seller, products, onUploadDocs])

  return (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Action Center</h2>
      <ul className="space-y-4">
        {tasks.map(task => {
          const Icon = task.icon
          const content = (
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${task.done ? 'bg-green-500/10 border-green-500/30' : task.variant === 'primary' ? 'bg-[#00FF89]/10 border-[#00FF89]/30' : 'bg-[#121212] border-gray-700'}`}>
                <Icon className={`w-5 h-5 ${task.done ? 'text-green-500' : task.variant === 'primary' ? 'text-[#00FF89]' : 'text-gray-300'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">{task.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{task.desc}</p>
              </div>
              {!task.done && (task.action ? (
                <button onClick={task.action.onClick} className="px-3 py-1.5 rounded-md bg-[#00FF89] text-[#121212] text-xs font-medium hover:bg-[#00FF89]/90">{task.action.label}</button>
              ) : task.href ? (
                <Link href={task.href} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${task.variant === 'primary' ? 'bg-[#00FF89] text-[#121212] hover:bg-[#00FF89]/90 border-[#00FF89]/30' : 'bg-[#121212] text-gray-300 hover:bg-gray-800 border-gray-700'}`}>{task.cta}</Link>
              ) : null)}
            </div>
          )
          return <li key={task.id}>{content}</li>
        })}
      </ul>
    </div>
  )
}
