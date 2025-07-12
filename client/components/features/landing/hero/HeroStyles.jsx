export default function HeroStyles() {
    return (
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
  
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
  
        .animate-blob {
          animation: blob 20s infinite;
        }
  
        .animation-delay-2000 {
          animation-delay: 2s;
        }
  
        .animation-delay-4000 {
          animation-delay: 4s;
        }
  
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
  
        .bg-300 {
          background-size: 300% 300%;
        }
  
        .bg-400 {
          background-size: 400% 400%;
        }
  
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
  
        .focus\\:not-sr-only:focus {
          position: absolute;
          width: auto;
          height: auto;
          padding: 0.5rem 1rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
  
        /* Mobile optimizations */
        @media (max-width: 640px) {
          @keyframes blob {
            0%, 100% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(15px, -25px) scale(1.05);
            }
            66% {
              transform: translate(-10px, 10px) scale(0.95);
            }
          }
        }
  
        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .animate-blob,
          .animate-gradient,
          .animate-pulse,
          .animate-ping {
            animation: none !important;
          }
        }
  
        /* High contrast */
        @media (prefers-contrast: high) {
          .text-gray-300 {
            color: #f3f4f6;
          }
          .text-gray-400 {
            color: #e5e7eb;
          }
          .bg-white\\/10 {
            background-color: rgba(255, 255, 255, 0.2);
          }
          .border-white\\/20 {
            border-color: rgba(255, 255, 255, 0.3);
          }
        }
  
        /* Focus visible */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible {
          outline: 2px solid #00ff89;
          outline-offset: 2px;
        }
  
        /* Touch-friendly tap targets */
        @media (max-width: 768px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
  
        /* Prevent horizontal scroll */
        html, body {
          overflow-x: hidden;
          max-width: 100%;
        }
      `}</style>
    )
  }