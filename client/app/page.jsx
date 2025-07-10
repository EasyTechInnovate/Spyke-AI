import HeroSection from "@/components/landing/HeroSection"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"


export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
      </main>
      <Footer />
    </>
  )
}