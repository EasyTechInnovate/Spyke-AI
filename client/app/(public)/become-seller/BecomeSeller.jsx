'use client'
import React, { useState } from 'react'
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
    const handleFormSubmit = async (data) => {
        const isValid = validateStep(3)
        if (!isValid) {
            setShowValidationError(true)
            return
        }
        setShowValidationError(false)
        await handleSubmit(data)
    }
    const handleLogoutAndRedirect = async () => {
        try {
            logoutService.logout().catch(() => {})
        } finally {
            router.push('/signin')
        }
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
                            required={formFields.fullName.required}
                            error={errors.fullName}
                        />
                        <FormInput
                            label={formFields.email.label}
                            name="email"
                            type={formFields.email.type}
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={formFields.email.placeholder}
                            helperText={formFields.email.helperText}
                            required={formFields.email.required}
                            error={errors.email}
                        />
                        <FormInput
                            label={formFields.websiteUrl.label}
                            name="websiteUrl"
                            type={formFields.websiteUrl.type}
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            placeholder={formFields.websiteUrl.placeholder}
                            required={formFields.websiteUrl.required}
                            error={errors.websiteUrl}
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
                            required={formFields.bio.required}
                            maxLength={formFields.bio.maxLength}
                            minLength={formFields.bio.minLength}
                            rows={formFields.bio.rows}
                            error={errors.bio}
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
                            required={formFields.sellerBanner.required}
                            error={errors.sellerBanner}
                            helperText={formFields.sellerBanner.helperText}
                            placeholder="Upload banner image or enter URL"
                            maxSize={5}
                            acceptedFormats={['.jpg', '.jpeg', '.png', '.webp']}
                        />
                    </>
                )
            case 2:
                return (
                    <>
                        <FormTagInput
                            label={formFields.niches.label}
                            name="niches"
                            value={formData.niches}
                            onAddTag={(value) => addTag('niches', value)}
                            onRemoveTag={(value) => removeTag('niches', value)}
                            placeholder={formFields.niches.placeholder}
                            helperText={formFields.niches.helperText}
                            required={formFields.niches.required}
                            maxItems={formFields.niches.maxItems}
                            suggestions={popularNiches}
                            error={errors.niches}
                        />
                        <FormTagInput
                            label={formFields.toolsSpecialization.label}
                            name="toolsSpecialization"
                            value={formData.toolsSpecialization}
                            onAddTag={(value) => addTag('toolsSpecialization', value)}
                            onRemoveTag={(value) => removeTag('toolsSpecialization', value)}
                            placeholder={formFields.toolsSpecialization.placeholder}
                            helperText={formFields.toolsSpecialization.helperText}
                            required={formFields.toolsSpecialization.required}
                            maxItems={formFields.toolsSpecialization.maxItems}
                            suggestions={popularTools}
                            error={errors.toolsSpecialization}
                        />
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <FormCheckbox
                                name="customAutomationServices"
                                checked={formData.customAutomationServices}
                                onChange={handleInputChange}
                                label={formFields.customAutomationServices.label}
                                helperText={formFields.customAutomationServices.helperText}
                            />
                        </div>
                    </>
                )
            case 3:
                return (
                    <>
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormSelect
                                label={formFields?.location?.fields?.country?.label || 'Country'}
                                name="location.country"
                                value={formData?.location?.country || ''}
                                onChange={handleInputChange}
                                options={countries}
                                placeholder="Select country"
                                required={formFields?.location?.fields?.country?.required}
                                error={errors['location.country']}
                            />
                            <FormSearchableSelect
                                label={formFields?.location?.fields?.timezone?.label || 'Timezone'}
                                name="location.timezone"
                                value={formData?.location?.timezone || ''}
                                onChange={handleInputChange}
                                options={timezones.map((tz) => ({
                                    value: tz.value,
                                    label: tz.label,
                                    description: tz.offset
                                }))}
                                placeholder="Search timezone..."
                                required={formFields?.location?.fields?.timezone?.required}
                                error={errors['location.timezone']}
                            />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-white mb-4">Social Media (Optional)</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormInput
                                    type="url"
                                    value={formData?.socialHandles?.linkedin || ''}
                                    onChange={(e) => handleSocialHandleChange('linkedin', e.target.value)}
                                    placeholder="LinkedIn URL"
                                />
                                <FormInput
                                    type="url"
                                    value={formData?.socialHandles?.twitter || ''}
                                    onChange={(e) => handleSocialHandleChange('twitter', e.target.value)}
                                    placeholder="Twitter URL"
                                />
                                <FormInput
                                    type="url"
                                    value={formData?.socialHandles?.instagram || ''}
                                    onChange={(e) => handleSocialHandleChange('instagram', e.target.value)}
                                    placeholder="Instagram URL"
                                />
                                <FormInput
                                    type="url"
                                    value={formData?.socialHandles?.youtube || ''}
                                    onChange={(e) => handleSocialHandleChange('youtube', e.target.value)}
                                    placeholder="YouTube URL"
                                />
                            </div>
                        </div>
                        <FormTagInput
                            label={(formFields?.portfolioLinks?.label || 'Portfolio Links') + ' (Optional)'}
                            name="portfolioLinks"
                            value={formData?.portfolioLinks || []}
                            onAddTag={addPortfolioLink}
                            onRemoveTag={removePortfolioLink}
                            placeholder={formFields?.portfolioLinks?.placeholder || 'https://example.com/portfolio'}
                            required={formFields?.portfolioLinks?.required}
                            maxItems={formFields?.portfolioLinks?.maxItems}
                            error={errors.portfolioLinks}
                        />
                        <div className="bg-brand-primary/10 p-6 rounded-lg border border-brand-primary/30 space-y-4">
                            <h4 className="text-lg font-medium text-white">Payout Information</h4>
                            <p className="text-sm text-gray-400 -mt-2">Select your preferred payout method and provide required details.</p>
                            <FormSelect
                                label={formFields?.payoutInfo?.fields?.method?.label || 'Payout Method'}
                                name="payoutInfo.method"
                                value={formData?.payoutInfo?.method || ''}
                                onChange={handleInputChange}
                                options={formFields?.payoutInfo?.fields?.method?.options || []}
                                required={formFields?.payoutInfo?.fields?.method?.required}
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
                        <div className="bg-gray-800/60 p-5 rounded-lg border border-gray-700 space-y-3">
                            <h4 className="text-lg font-medium text-white">Revenue Share Agreement</h4>
                            <p className="text-sm text-gray-400">
                                You must accept the revenue share agreement to create your seller profile. Review the terms carefully before
                                proceeding.
                            </p>
                            <FormCheckbox
                                name="revenueShareAgreement.accepted"
                                checked={formData?.revenueShareAgreement?.accepted || false}
                                onChange={handleInputChange}
                                label={formFields?.revenueShareAgreement?.fields?.accepted?.label}
                                error={errors['revenueShareAgreement.accepted']}
                            />
                        </div>
                    </>
                )
            default:
                return null
        }
    }
    return (
        <>
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
                                <span className="text-gray-300">Keep 80% of sales</span>
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
                    {showValidationError && (
                        <Notification
                            id="validation-error"
                            type="error"
                            message="You must accept the revenue share agreement"
                            duration={5000}
                            onClose={() => setShowValidationError(false)}
                            onClick={() => setShowValidationError(false)}
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
                        <div className="text-center py-20">
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

