

// export const PageLoader = () => (
//   <div className="flex items-center justify-center min-h-screen">
//     <div className="relative">
//       <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#00FF89] animate-spin"></div>
//       <div className="absolute inset-0 flex items-center justify-center">
//         <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-white animate-spin animate-reverse"></div>
//       </div>
//     </div>
//   </div>
// )

// export const InlineLoader = () => (
//   <div className="inline-flex items-center gap-2">
//     <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//     </svg>
//     <span className="text-sm text-gray-400">Loading...</span>
//   </div>
// )

// export const SkeletonLoader = ({ className = "" }) => (
//   <div className={`animate-pulse bg-gray-800 rounded ${className}`}></div>
// )

// export const CardSkeletonLoader = () => (
//   <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
//     <SkeletonLoader className="h-40 mb-4" />
//     <SkeletonLoader className="h-4 mb-2 w-3/4" />
//     <SkeletonLoader className="h-4 mb-4 w-1/2" />
//     <div className="flex justify-between items-center">
//       <SkeletonLoader className="h-8 w-20" />
//       <SkeletonLoader className="h-8 w-24" />
//     </div>
//   </div>
// )

// export default ButtonLoader