import SellerProfile from "./SellerProfile"

export const metadata = {
  title: "Seller Profile",
  description:
    "View and manage your seller profile on Spyke AI. Join thousands of creators and buyers in the next-gen AI marketplace.",
}

export const dynamic = 'force-dynamic'

export default function Page() {
  return <SellerProfile />
}
