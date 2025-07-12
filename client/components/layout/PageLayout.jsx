import Header from "./Header"
import Footer from "./Footer"
import MainContent from "./MainContent"

export default function PageLayout({ children, className = "" }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainContent className={className}>
        {children}
      </MainContent>
      <Footer />
    </div>
  )
}