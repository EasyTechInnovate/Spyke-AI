import React from 'react';

const SellerPageLoader = () => {
  return (
    <div 
      className="fixed inset-0 bg-[#121212] flex items-center justify-center z-50"
      role="status"
      aria-label="Loading seller dashboard"
    >
      <div className="flex flex-col items-center">
        {/* Animated bars with CSS-only animation */}
        <div className="flex items-end gap-1.5 h-16">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 bg-[#00FF89] rounded-full animate-pulse"
              style={{
                height: `${20 + i * 15}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: '1.5s'
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        
        <h2 className="text-xl text-[#00FF89] mt-6 font-[var(--font-league-spartan)]">

          Loading Seller Center
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-[var(--font-kumbh-sans)]">
          Preparing your dashboard...
        </p>
        
        {/* Screen reader only text */}
        <span className="sr-only">Please wait while we load your seller dashboard</span>
      </div>
    </div>
  );
};

export default SellerPageLoader;