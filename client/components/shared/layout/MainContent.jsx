export default function MainContent({ children, className = "" }) {
    return (
      <main 
        className={`
          flex-1 
          w-full 
          ${className}
        `.trim()}
      >
        {/* Container for consistent padding on all screen sizes */}
        <div className="w-full max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>
    )
  }
  