import { theme } from '@/config/theme';
import React from 'react';


const SellerPageLoader = () => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: theme.colors.background.dark }}
    >
      <div className="flex flex-col items-center">
        {/* Animated bars */}
        <div className="flex items-end gap-1 h-12 mb-6">
          <div 
            className="w-1 animate-bar-1"
            style={{ backgroundColor: theme.colors.brand.primary }}
          />
          <div 
            className="w-1 animate-bar-2"
            style={{ backgroundColor: theme.colors.brand.primary }}
          />
          <div 
            className="w-1 animate-bar-3"
            style={{ backgroundColor: theme.colors.brand.primary }}
          />
          <div 
            className="w-1 animate-bar-4"
            style={{ backgroundColor: theme.colors.brand.primary }}
          />
          <div 
            className="w-1 animate-bar-5"
            style={{ backgroundColor: theme.colors.brand.primary }}
          />
        </div>
        
        <h2 
          className="text-lg tracking-wide"
          style={{ 
            color: theme.colors.brand.primary,
            fontFamily: theme.fonts.title
          }}
        >
          Seller Center
        </h2>
      </div>

      <style jsx>{`
        @keyframes bar-1 {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        
        @keyframes bar-2 {
          0%, 100% { height: 40%; }
          50% { height: 80%; }
        }
        
        @keyframes bar-3 {
          0%, 100% { height: 60%; }
          50% { height: 90%; }
        }
        
        @keyframes bar-4 {
          0%, 100% { height: 80%; }
          50% { height: 70%; }
        }
        
        @keyframes bar-5 {
          0%, 100% { height: 100%; }
          50% { height: 50%; }
        }
        
        .animate-bar-1 {
          animation: bar-1 1.2s ease-in-out infinite;
        }
        
        .animate-bar-2 {
          animation: bar-2 1.2s ease-in-out infinite;
          animation-delay: 0.1s;
        }
        
        .animate-bar-3 {
          animation: bar-3 1.2s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        .animate-bar-4 {
          animation: bar-4 1.2s ease-in-out infinite;
          animation-delay: 0.3s;
        }
        
        .animate-bar-5 {
          animation: bar-5 1.2s ease-in-out infinite;
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default SellerPageLoader;