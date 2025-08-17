import Header from "./Header"
import MainContent from "./MainContent"

export default function PageLayout({ children, className = "" }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainContent className={className}>
        {children}
      </MainContent>
    </div>
  )
}