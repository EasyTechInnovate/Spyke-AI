'use client'

import React from 'react'
import { Check } from 'lucide-react'
import Header from '@/components/shared/layout/Header'
import Container from '@/components/shared/layout/Container'
import {
    MultiStepForm,
    FormInput,
    FormTextArea,
    FormSelect,
    FormTagInput,
    FormCheckbox,
    FormSearchableSelect
} from '@/components/shared/forms'
import { useSellerForm } from '@/hooks/forms/useSellerForm'
import { 
    formSteps, 
    formFields, 
    countries, 
    timezones,
    popularNiches,
    popularTools 
} from '@/lib/config/forms/SellerFormConfig'

export default function BecomeSellerPage() {
    const {
        formData,
        errors,
        loading,
        submitError,
        handleInputChange,
        handleSocialHandleChange,
        addTag,
        removeTag,
        addPortfolioLink,
        removePortfolioLink,
        validateStep,
        handleSubmit
    } = useSellerForm()

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

                        <FormInput
                            label={formFields.sellerBanner.label}
                            name="sellerBanner"
                            type={formFields.sellerBanner.type}
                            value={formData.sellerBanner}
                            onChange={handleInputChange}
                            placeholder={formFields.sellerBanner.placeholder}
                            helperText={formFields.sellerBanner.helperText}
                            required={formFields.sellerBanner.required}
                            error={errors.sellerBanner}
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
                                options={timezones.map(tz => ({
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

                        <div className="bg-brand-primary/10 p-6 rounded-lg border border-brand-primary/30">
                            <h4 className="text-lg font-medium text-white mb-4">Payout Information</h4>
                            <div className="space-y-4">
                                <FormSelect
                                    label={formFields?.payoutInfo?.fields?.method?.label || 'Payout Method'}
                                    name="payoutInfo.method"
                                    value={formData?.payoutInfo?.method || ''}
                                    onChange={handleInputChange}
                                    options={formFields?.payoutInfo?.fields?.method?.options || []}
                                    required={formFields?.payoutInfo?.fields?.method?.required}
                                />

                                {formData?.payoutInfo?.method === 'paypal' && (
                                    <FormInput
                                        label={formFields?.payoutInfo?.fields?.paypalEmail?.label || 'PayPal Email'}
                                        name="payoutInfo.paypalEmail"
                                        type="email"
                                        value={formData?.payoutInfo?.paypalEmail || ''}
                                        onChange={handleInputChange}
                                        placeholder={formFields?.payoutInfo?.fields?.paypalEmail?.placeholder || 'Enter your PayPal email'}
                                        required={formFields?.payoutInfo?.fields?.paypalEmail?.required}
                                        error={errors['payoutInfo.paypalEmail']}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )

            default:
                return null
        }
    }

    return (
        <>
            <Header />

            {/* Hero Section */}
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

            {/* Form Section */}
            <section className="py-16 bg-black border-t border-gray-800">
                <Container>
                    <MultiStepForm
                        steps={formSteps}
                        formData={formData}
                        onSubmit={handleSubmit}
                        errors={errors}
                        loading={loading}
                        submitError={submitError}
                        validateStep={validateStep}
                        submitButtonText="Create Seller Profile"
                        submitButtonIcon={<Check className="w-5 h-5" />}
                        compactStepIndicator={false}
                    >
                        {renderStepContent}
                    </MultiStepForm>
                </Container>
            </section>
        </>
    )
}