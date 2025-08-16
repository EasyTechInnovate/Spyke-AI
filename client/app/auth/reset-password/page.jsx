import ResetPasswordPage from './ResetPasswordPage'

export const metadata = {
    title: 'Reset Password - Spyke AI',
    description: 'Create a new password for your Spyke AI account',
}

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }) {
    const params = await searchParams
    return <ResetPasswordPage token={params.token} />
}