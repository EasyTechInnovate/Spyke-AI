// Public Seller Landing / Directory placeholder
// TODO: Replace with real seller marketplace listing

export const metadata = {
  title: 'Sellers | Spyke AI',
  description: 'Discover top sellers on the Spyke AI marketplace.'
}

export default function SellerDirectoryPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold">Seller Marketplace Coming Soon</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          We are preparing a curated directory of verified sellers. Soon you will be able to browse profiles, compare niches,
          and purchase high‑quality digital products.
        </p>
        <a href="/become-seller" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-colors">
          Become a Seller
        </a>
      </div>
    </div>
  )
}
