import { motion } from 'framer-motion'
import FloatingParticles from './FloatingParticles'
import { useMousePosition } from '@/hooks/useMousePosition'
import { useResponsive } from '@/hooks/useResponsive'

export default function BackgroundEffects() {
  const { isDesktop } = useResponsive()
  const mousePosition = useMousePosition(isDesktop)
  
  return (
    <>
      {/* Gradient mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-brand-primary/20 rounded-full filter blur-[80px] sm:blur-[100px] md:blur-[120px] animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-[150px] sm:w-[250px] md:w-[350px] lg:w-[400px] h-[150px] sm:h-[250px] md:h-[350px] lg:h-[400px] bg-purple-500/20 rounded-full filter blur-[80px] sm:blur-[100px] md:blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-[250px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-brand-primary/10 rounded-full filter blur-[80px] sm:blur-[100px] md:blur-[120px] animate-blob animation-delay-4000" />
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%22100%22%20height%3D%22100%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%20100%200%20L%200%200%200%20100%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.5%22%20opacity%3D%220.1%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%20%2F%3E%3C%2Fsvg%3E')] opacity-20 sm:opacity-30 md:opacity-50"
      />
      
      <FloatingParticles />
      
      {/* Spotlight that follows mouse - desktop only */}
      {isDesktop && (
        <motion.div
          className="absolute w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,137,0.1) 0%, transparent 70%)',
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
      )}
    </>
  )
}