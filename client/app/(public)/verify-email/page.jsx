import { Suspense } from 'react'
import VerifyEmailContent from './VerifyEmailContent'
export default async function VerifyEmailPage({ searchParams }) {
    const params = await searchParams
    const email = params?.email || ''
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        }>
            <VerifyEmailContent email={email} />
        </Suspense>
    )
}
export const metadata = {
    title: 'Verify Email - Spyke AI',
    description: 'Verify your email address to complete your account setup'
}