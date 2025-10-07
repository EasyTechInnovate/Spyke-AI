'use client'
import React, { useState, useEffect } from 'react'
import { Check, User, Store, Package, Settings, LogOut, ArrowRight } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import {
    MultiStepForm,
    FormInput,
    FormTextArea,
    FormSelect,
    FormTagInput,
    FormCheckbox,
    FormSearchableSelect,
    ImageUpload
} from '@/components/shared/forms'
import { useSellerForm } from '@/hooks/forms/useSellerForm'
import Notification from '@/components/shared/Notification'
import { formSteps, formFields, countries, timezones, popularNiches, popularTools } from '@/lib/config/forms/SellerFormConfig'
import { logoutService } from '@/lib/services/logout'
import { useRouter } from 'next/navigation'
import { SELLER_VALIDATION_RULES } from '@/lib/validation/sellerValidation'
import { categoryAPI, toolAPI } from '@/lib/api/toolsNiche'
import CustomSelect from '@/components/shared/CustomSelect'

export default function BecomeSellerPage() {
    const {
        formData,
        errors,
        loading,
        submitError,
        notification,
        dismissNotification,
        imageUploading,
        setImageUploading,
        isSuccess,
        handleInputChange,
        handleSocialHandleChange,
        addTag,
        removeTag,
        addPortfolioLink,
        removePortfolioLink,
        validateStep,
        handleSubmit
    } = useSellerForm()

    const router = useRouter()
    const [showValidationError, setShowValidationError] = useState(false)
    const [categoryOptions, setCategoryOptions] = useState([])
    const [toolOptions, setToolOptions] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [loadingTools, setLoadingTools] = useState(false)
    const [showAgreementModal, setShowAgreementModal] = useState(false)

    // Fetch dynamic categories and tools (replace hardcoded suggestions)
    useEffect(() => {
        let isMounted = true
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true)
                const res = await categoryAPI.getCategories({ isActive: 'true' })
                const raw = res?.data?.categories || res?.categories || res?.data || []
                if (!isMounted) return
                const opts = Array.isArray(raw) ? raw.filter((c) => c?.isActive !== false).map((c) => ({ value: c.name, label: c.name })) : []
                setCategoryOptions(opts)
            } catch (e) {
                if (isMounted) setCategoryOptions([])
            } finally {
                if (isMounted) setLoadingCategories(false)
            }
        }
        const fetchTools = async () => {
            try {
                setLoadingTools(true)
                const res = await toolAPI.getTools({ isActive: 'true' })
                const raw = res?.data?.tools || res?.tools || res?.data || []
                if (!isMounted) return
                const opts = Array.isArray(raw) ? raw.filter((t) => t?.isActive !== false).map((t) => ({ value: t.name, label: t.name })) : []
                setToolOptions(opts)
            } catch (e) {
                if (isMounted) setToolOptions([])
            } finally {
                if (isMounted) setLoadingTools(false)
            }
        }
        fetchCategories()
        fetchTools()
        return () => {
            isMounted = false
        }
    }, [])

    const handleMultiSelectChange = (fieldName, values) => {
        handleInputChange({ target: { name: fieldName, value: values } })
    }

    const openAgreementModal = () => setShowAgreementModal(true)
    const closeAgreementModal = () => setShowAgreementModal(false)
    const acceptAgreement = () => {
        handleInputChange({ target: { name: 'revenueShareAgreement.accepted', type: 'checkbox', checked: true, value: true } })
        closeAgreementModal()
    }

    const AgreementModal = () => {
        if (!showAgreementModal) return null
        const today = new Date()
        const dateStr = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        const sellerName = formData.fullName || 'Seller'
        return (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-24 md:pt-32 px-4 pb-10">
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={closeAgreementModal}
                />
                <div className="relative z-10 w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white tracking-tight"><span className="text-[#00FF89]">Revenue Share</span> Agreement</h3>
                        <button
                            onClick={closeAgreementModal}
                            className="text-gray-400 hover:text-white text-sm">
                            Close
                        </button>
                    </div>
                    <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-sm leading-relaxed text-gray-300">
                        <div>
                            <p><span className="font-medium text-[#00FF89]">Effective Date:</span> <span className="text-white">{dateStr}</span></p>
                            <p className="mt-2">This Revenue Share Agreement (“Agreement”) is entered into by and between <span className="font-medium text-[#00FF89]">SpykeAI</span> ("<span className='text-[#00FF89]'>Platform</span>") and <span className="font-medium text-[#00FF89]">{sellerName}</span> ("<span className='text-[#00FF89]'>Seller</span>"). Collectively they are the “Parties.”</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">1. Purpose</h4>
                            <p>This Agreement governs Seller participation in the Platform’s commerce or service ecosystem and outlines the revenue distribution framework for transactions facilitated through the Platform.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">2. Revenue Share Structure</h4>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>The applicable revenue share, commissions, and fees are those stated in the Platform’s current Revenue Share Policy, as updated from time to time.</li>
                                <li>Modifications become effective upon written notice or publication within the Seller dashboard. Continued use of the Platform constitutes acceptance.</li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">3. Payment and Payout Terms</h4>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Payouts follow the standard payment cycle and the Seller’s chosen payout method.</li>
                                <li>All payouts are subject to compliance, fraud-prevention procedures, and legally required withholding.</li>
                                <li>The Platform may withhold or adjust payouts in cases of refunds, chargebacks, fraudulent activity, or policy violations.</li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">4. Refunds and Adjustments</h4>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Refunds, cancellations, or disputes result in proportional deductions from the Seller’s balance.</li>
                                <li>All such adjustments are final per Platform refund and chargeback policies.</li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">5. Seller Responsibilities</h4>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Seller content, listings, and conduct must comply with all applicable laws, regulations, and Platform Policies.</li>
                                <li>Deceptive, infringing, or unlawful practices may trigger suspension, termination, or forfeiture of unpaid earnings.</li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">6. Platform Rights</h4>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>The Platform may review, remove, or suspend listings or accounts violating Platform Policies.</li>
                                <li>The Platform may modify this Agreement or related policies with notice.</li>
                                <li>The Platform retains ownership of its intellectual property and proprietary systems.</li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">7. Term and Termination</h4>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>This Agreement is effective as of the Effective Date and continues until terminated.</li>
                                <li>Either Party may terminate at any time with or without cause by written or electronic notice.</li>
                                <li>Upon termination, accrued and approved earnings are disbursed under the standard payout schedule.</li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">8. Limitation of Liability</h4>
                            <p>The Platform is not liable for indirect, incidental, consequential, or punitive damages except where required by law.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#00FF89] mt-4 mb-2">9. Entire Agreement</h4>
                            <p>This Agreement, together with the Platform Terms of Service and applicable Policies, constitutes the entire understanding between the Parties and supersedes prior communications related to its subject matter.</p>
                        </div>
                        <div className="pt-2 border-t border-gray-800">
                            <p className="text-gray-300">By clicking <span className="text-[#00FF89] font-semibold">“I Agree”</span>, the <span className="text-[#00FF89] font-medium">Seller</span> confirms they have read, understood, and agree to be bound by this Agreement and all related Platform Policies.</p>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3 bg-gray-950/80">
                        <button
                            onClick={closeAgreementModal}
                            className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800">
                            Cancel
                        </button>
                        <button
                            onClick={acceptAgreement}
                            className="px-5 py-2 rounded-lg bg-[#00FF89] text-black font-semibold hover:bg-[#00FF89]/90">
                            I Agree
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const handleFormSubmit = async (data) => {
        await handleSubmit(data)
    }

    const handleLogoutAndRedirect = () => {
        try {
            logoutService.logout()
        } catch (e) {}
        setTimeout(() => {
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/signin')) {
                router.replace('/signin?relogin=1')
            }
        }, 600)
    }

    const SellerBannerUpload = ({ ...props }) => {
        return (
            <ImageUpload
                {...props}
                onUploadStart={() => setImageUploading(true)}
                onUploadEnd={() => setImageUploading(false)}
            />
        )
    }

    function SellerModeVisualGuide() {
        return (
            <div className="pointer-events-none select-none max-w-3xl mx-auto">
                <div className="relative bg-[#0a0f14] border border-gray-800/60 rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-md bg-emerald-500" />
                            <div className="hidden md:flex items-center gap-3 opacity-60">
                                <div className="h-3 w-16 rounded bg-gray-800" />
                                <div className="h-3 w-14 rounded bg-gray-800" />
                                <div className="h-3 w-20 rounded bg-gray-800" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gray-800" />
                            <div className="h-9 w-9 rounded-lg bg-gray-800" />
                            <div className="h-9 w-9 rounded-lg bg-gray-800 relative">
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                                    8
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/60 p-1 pr-2 bg-[#0c131a]">
                                <div className="flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1">
                                    <User className="h-4 w-4 text-emerald-400" />
                                    <span className="text-sm text-emerald-400 font-medium">Buyer</span>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-4 top-16 w-[360px] rounded-2xl border border-gray-800 bg-[#0b1117] shadow-2xl">
                        <div className="flex items-center gap-3 px-5 py-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-black font-bold">
                                A
                            </div>
                            <div>
                                <div className="text-white font-semibold leading-tight">seller</div>
                                <div className="text-gray-400 text-sm">anandseller1@gmail.com</div>
                            </div>
                        </div>
                        <div className="h-px bg-gray-800" />
                        <div className="px-5 py-3">
                            <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">Switch Mode</div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-2 rounded-xl bg-emerald-500 text-black px-4 py-2 shadow-inner">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-semibold">Buy Mode</span>
                                </div>
                                <div className="relative flex-1">
                                    <div className="flex items-center gap-2 rounded-xl bg-gray-800/70 px-4 py-2 border border-emerald-400/40">
                                        <Store className="h-4 w-4 text-gray-300" />
                                        <span className="text-sm text-gray-200">Sell Mode</span>
                                    </div>
                                    <ArrowRight className="absolute -left-10 top-1/2 -translate-y-1/2 h-12 w-12 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-bounce" />
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-gray-800" />
                        <div className="px-5 py-3 space-y-2">
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="h-9 w-9 rounded-lg bg-gray-800/80 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-gray-400" />
                                </div>
                                <span className="text-[15px]">My Purchases</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="h-9 w-9 rounded-lg bg-gray-800/80 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <span className="text-[15px]">Profile</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="h-9 w-9 rounded-lg bg-gray-800/80 flex items-center justify-center">
                                    <Settings className="h-4 w-4 text-gray-400" />
                                </div>
                                <span className="text-[15px]">Settings</span>
                            </div>
                        </div>
                        <div className="h-px bg-gray-800" />
                        <div className="px-5 py-3">
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="h-9 w-9 rounded-lg bg-gray-800/80 flex items-center justify-center">
                                    <LogOut className="h-4 w-4 text-gray-400" />
                                </div>
                                <span className="text-[15px]">Log out</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64" />
                </div>
            </div>
        )
    }

    const renderStepContent = ({ currentStep }) => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <FormInput
                            label={formFields.fullName.label}
                            name="fullName"
                            type={formFields.fullName.type}
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder={formFields.fullName.placeholder}
                            required={SELLER_VALIDATION_RULES.fullName.required}
                            error={errors.fullName}
                            minLength={SELLER_VALIDATION_RULES.fullName.minLength}
                            maxLength={SELLER_VALIDATION_RULES.fullName.maxLength}
                            helperText={`${formData.fullName?.length || 0}/${SELLER_VALIDATION_RULES.fullName.maxLength} characters`}
                        />

                        <FormInput
                            label={formFields.email.label}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={formFields.email.placeholder}
                            helperText={formFields.email.helperText}
                            required={SELLER_VALIDATION_RULES.email.required}
                            error={errors.email}
                        />

                        <FormInput
                            label={formFields.websiteUrl.label}
                            name="websiteUrl"
                            type="url"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            placeholder={formFields.websiteUrl.placeholder}
                            required={SELLER_VALIDATION_RULES.websiteUrl.required}
                            error={errors.websiteUrl}
                            helperText="Optional - Your personal or business website"
                            dataAttributes={{
                                'data-gramm': 'false',
                                'data-gramm_editor': 'false',
                                'data-enable-grammarly': 'false'
                            }}
                        />

                        <FormTextArea
                            label={formFields.bio.label}
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder={formFields.bio.placeholder}
                            required={SELLER_VALIDATION_RULES.bio.required}
                            maxLength={SELLER_VALIDATION_RULES.bio.maxLength}
                            minLength={SELLER_VALIDATION_RULES.bio.minLength}
                            rows={formFields.bio.rows}
                            error={errors.bio}
                            helperText={`${formData.bio?.length || 0}/${SELLER_VALIDATION_RULES.bio.maxLength} characters (minimum ${SELLER_VALIDATION_RULES.bio.minLength} required)`}
                        />

                        <SellerBannerUpload
                            label={formFields.sellerBanner.label}
                            value={formData.sellerBanner}
                            onChange={(e) =>
                                handleInputChange({
                                    target: {
                                        name: 'sellerBanner',
                                        value: e.target.value
                                    }
                                })
                            }
                            category="seller-banners"
                            required={SELLER_VALIDATION_RULES.sellerBanner.required}
                            error={errors.sellerBanner}
                            helperText="Optional - Upload banner image or enter URL. Recommended size: 1200x300px"
                            placeholder="Upload banner image or enter URL"
                            maxSize={5}
                            acceptedFormats={['.jpg', '.jpeg', '.png', '.webp']}
                        />
                    </>
                )
            case 2:
                return (
                    <>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">{formFields.niches.label} *</label>
                            <CustomSelect
                                multiple
                                searchable
                                value={formData.niches}
                                options={categoryOptions}
                                loading={loadingCategories}
                                placeholder={loadingCategories ? 'Loading categories...' : 'Select categories'}
                                onChange={(vals) => handleMultiSelectChange('niches', vals)}
                                maxHeight="max-h-72"
                            />
                            <p className="text-xs text-gray-400">
                                Selected: {formData.niches.length}/{SELLER_VALIDATION_RULES.niches.maxItems} (min{' '}
                                {SELLER_VALIDATION_RULES.niches.minItems})
                            </p>
                            {errors.niches && <p className="text-xs text-red-400">{errors.niches}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">{formFields.toolsSpecialization.label} *</label>
                            <CustomSelect
                                multiple
                                searchable
                                value={formData.toolsSpecialization}
                                options={toolOptions}
                                loading={loadingTools}
                                placeholder={loadingTools ? 'Loading tools...' : 'Select tools you specialize in'}
                                onChange={(vals) => handleMultiSelectChange('toolsSpecialization', vals)}
                                maxHeight="max-h-72"
                            />
                            <p className="text-xs text-gray-400">
                                Selected: {formData.toolsSpecialization.length}/{SELLER_VALIDATION_RULES.toolsSpecialization.maxItems} (min{' '}
                                {SELLER_VALIDATION_RULES.toolsSpecialization.minItems})
                            </p>
                            {errors.toolsSpecialization && <p className="text-xs text-red-400">{errors.toolsSpecialization}</p>}
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <FormCheckbox
                                name="customAutomationServices"
                                checked={formData.customAutomationServices}
                                onChange={handleInputChange}
                                label={formFields.customAutomationServices.label}
                                helperText={formFields.customAutomationServices.helperText}
                                required={SELLER_VALIDATION_RULES.customAutomationServices.required}
                                error={errors.customAutomationServices}
                            />
                        </div>
                    </>
                )
            case 3:
                return (
                    <>
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormSelect
                                label="Country *"
                                name="location.country"
                                value={formData?.location?.country || ''}
                                onChange={handleInputChange}
                                options={countries}
                                placeholder="Select country"
                                required={SELLER_VALIDATION_RULES['location.country'].required}
                                error={errors['location.country']}
                            />

                            <FormSearchableSelect
                                label="Timezone *"
                                name="location.timezone"
                                value={formData?.location?.timezone || ''}
                                onChange={handleInputChange}
                                options={timezones.map((tz) => ({
                                    value: tz.value,
                                    label: tz.label,
                                    description: tz.offset
                                }))}
                                placeholder="Search timezone..."
                                required={SELLER_VALIDATION_RULES['location.timezone'].required}
                                error={errors['location.timezone']}
                            />
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-white mb-4">Social Media (Optional)</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormInput
                                    label="LinkedIn"
                                    type="url"
                                    value={formData?.socialHandles?.linkedin || ''}
                                    onChange={(e) => handleSocialHandleChange('linkedin', e.target.value)}
                                    placeholder="LinkedIn URL"
                                    required={SELLER_VALIDATION_RULES['socialHandles.linkedin'].required}
                                    error={errors['socialHandles.linkedin']}
                                />
                                <FormInput
                                    label="Twitter/X"
                                    type="url"
                                    value={formData?.socialHandles?.twitter || ''}
                                    onChange={(e) => handleSocialHandleChange('twitter', e.target.value)}
                                    placeholder="Twitter URL"
                                    required={SELLER_VALIDATION_RULES['socialHandles.twitter'].required}
                                    error={errors['socialHandles.twitter']}
                                />
                                <FormInput
                                    label="Instagram"
                                    type="url"
                                    value={formData?.socialHandles?.instagram || ''}
                                    onChange={(e) => handleSocialHandleChange('instagram', e.target.value)}
                                    placeholder="Instagram URL"
                                    required={SELLER_VALIDATION_RULES['socialHandles.instagram'].required}
                                    error={errors['socialHandles.instagram']}
                                />
                                <FormInput
                                    label="YouTube"
                                    type="url"
                                    value={formData?.socialHandles?.youtube || ''}
                                    onChange={(e) => handleSocialHandleChange('youtube', e.target.value)}
                                    placeholder="YouTube URL"
                                    required={SELLER_VALIDATION_RULES['socialHandles.youtube'].required}
                                    error={errors['socialHandles.youtube']}
                                />
                            </div>
                        </div>

                        <FormTagInput
                            label="Portfolio Links (Optional)"
                            name="portfolioLinks"
                            value={formData?.portfolioLinks || []}
                            onAddTag={addPortfolioLink}
                            onRemoveTag={removePortfolioLink}
                            placeholder="https://example.com/portfolio"
                            required={SELLER_VALIDATION_RULES.portfolioLinks.required}
                            maxItems={SELLER_VALIDATION_RULES.portfolioLinks.maxItems}
                            error={errors.portfolioLinks}
                            helperText={`Added: ${formData?.portfolioLinks?.length || 0}/${SELLER_VALIDATION_RULES.portfolioLinks.maxItems} links`}
                            validateItem={(url) => {
                                const urlPattern = /^https?:\/\/.+/
                                return urlPattern.test(url) ? null : 'Please enter a valid URL starting with http:// or https://'
                            }}
                        />

                        <div className="bg-brand-primary/10 p-6 rounded-lg border border-brand-primary/30 space-y-4">
                            <h4 className="text-lg font-medium text-white">Payout Information *</h4>
                            <p className="text-sm text-gray-400 -mt-2">Select your preferred payout method and provide required details.</p>

                            <FormSelect
                                label="Payout Method *"
                                name="payoutInfo.method"
                                value={formData?.payoutInfo?.method || ''}
                                onChange={handleInputChange}
                                options={formFields?.payoutInfo?.fields?.method?.options || []}
                                required={SELLER_VALIDATION_RULES['payoutInfo.method'].required}
                                error={errors['payoutInfo.method']}
                            />

                            {Object.entries(formFields?.payoutInfo?.fields || {})
                                .filter(([key]) => key !== 'method')
                                .map(([key, cfg]) => {
                                    const show = !cfg.showIf || cfg.showIf(formData)
                                    if (!show) return null

                                    const fieldName = `payoutInfo.${key}`
                                    const value = formData?.payoutInfo?.[key] || ''

                                    const commonProps = {
                                        key,
                                        label: cfg.label,
                                        name: fieldName,
                                        value,
                                        onChange: handleInputChange,
                                        required: cfg.required,
                                        placeholder: cfg.placeholder,
                                        error: errors[fieldName]
                                    }

                                    if (cfg.type === 'email' || cfg.type === 'text') {
                                        return (
                                            <FormInput
                                                type={cfg.type === 'email' ? 'email' : 'text'}
                                                {...commonProps}
                                            />
                                        )
                                    }
                                    return null
                                })}
                        </div>

                        <div className="bg-gray-800/60 p-5 rounded-lg border border-gray-700 space-y-4">
                            <h4 className="text-lg font-medium text-white">Revenue Share Agreement *</h4>
                            <p className="text-sm text-gray-400">You must review and accept the agreement before submitting.</p>
                            <div className="flex items-center gap-4 flex-wrap">
                                <button
                                    type="button"
                                    onClick={openAgreementModal}
                                    className="px-5 py-2.5 rounded-lg bg-brand-primary text-black font-semibold hover:bg-brand-primary/90 transition">
                                    {formData?.revenueShareAgreement?.accepted ? 'Agreement Accepted ✅' : 'Review & Accept'}
                                </button>
                                {!formData?.revenueShareAgreement?.accepted && <span className="text-xs text-red-400">Pending acceptance</span>}
                            </div>
                            {errors['revenueShareAgreement.accepted'] && !formData?.revenueShareAgreement?.accepted && (
                                <p className="text-xs text-red-400">{errors['revenueShareAgreement.accepted']}</p>
                            )}
                        </div>
                        <AgreementModal />
                    </>
                )
            default:
                return null
        }
    }

    return (
        <>
            {/* ...existing sections... */}
            <section className="relative bg-black pt-24 pb-16">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/20"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
                </div>
                <Container className="relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-kumbh-sans font-bold mb-6 text-white">
                            Turn Your <span className="text-brand-primary">Expertise</span> Into Income
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-300">
                            Join thousands of automation experts selling their tools and workflows
                        </p>
                        <div className="flex flex-wrap gap-8 justify-center text-lg">
                            <div className="flex items-center gap-2">
                                <Check className="w-6 h-6 text-brand-primary" />
                                <span className="text-gray-300">No upfront costs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-6 h-6 text-brand-primary" />
                                <span className="text-gray-300">{process.env.NEXT_PUBLIC_SELLER_SHARE_DISPLAY || 'Custom commission rate (agreed with platform)'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-6 h-6 text-brand-primary" />
                                <span className="text-gray-300">Instant payouts</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-16 bg-black border-t border-gray-800">
                <Container>
                    {notification && (
                        <Notification
                            id={notification.id}
                            type={notification.type}
                            message={notification.message}
                            duration={notification.duration}
                            onClose={dismissNotification}
                            onClick={dismissNotification}
                        />
                    )}

                    {!isSuccess ? (
                        <MultiStepForm
                            steps={formSteps}
                            formData={formData}
                            onSubmit={handleFormSubmit}
                            errors={errors}
                            loading={loading}
                            submitError={submitError}
                            validateStep={validateStep}
                            submitButtonText="Create Seller Profile"
                            submitButtonIcon={<Check className="w-5 h-5" />}
                            compactStepIndicator={false}
                            imageUploading={imageUploading}>
                            {renderStepContent}
                        </MultiStepForm>
                    ) : (
                        <div className="text-center py-20 mt-2">
                            <div className="max-w-2xl mx-auto">
                                <h2 className="text-4xl font-kumbh-sans font-bold text-white mb-6">🎉 Seller Profile Created Successfully!</h2>
                                <p className="text-xl text-gray-300 mb-8">Your seller profile has been submitted for review.</p>
                                <div className="bg-brand-primary/10 p-6 rounded-2xl border border-brand-primary/30 mb-6">
                                    <h3 className="text-lg font-semibold text-brand-primary mb-2">Next Steps:</h3>
                                    <p className="text-gray-200">
                                        Please <span className="font-bold text-brand-primary underline decoration-2">relogin</span> and visit your
                                        seller profile to start selling!
                                    </p>
                                </div>
                                <SellerModeVisualGuide />
                                <button
                                    type="button"
                                    onClick={handleLogoutAndRedirect}
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-black font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
                                    🚀 Ready to Start Selling? Sign In Again!
                                </button>
                            </div>
                        </div>
                    )}
                </Container>
            </section>
        </>
    )
}

