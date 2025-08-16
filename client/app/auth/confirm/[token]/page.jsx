import EmailConfirmPage from './EmailConfirmPage'

export const metadata = {
    title: 'Confirm Email - Spyke AI',
    description: 'Confirm your email address to activate your Spyke AI account',
}

export const dynamic = 'force-dynamic'

export default function Page({ params, searchParams }) {
    return <EmailConfirmPage token={params.token} code={searchParams.code} />
}