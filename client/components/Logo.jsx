import Image from 'next/image'

// Logo component for easy reuse throughout your app
export const SpykeLogo = ({ 
  size = 40, 
  className = "", 
  priority = false,
  showText = true,
  textSize = "text-xl"
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src="/logo.svg"
          alt="Spyke AI Logo"
          width={size}
          height={size}
          priority={priority}
          className="logo-icon"
        />
      </div>
      {showText && (
        <div>
          <span className={`${textSize} font-bold text-[#121212] title-font`}>
            Spyke AI
          </span>
          <div className="text-xs text-gray-500 hidden sm:block body-font">
            by FutureDesks
          </div>
        </div>
      )}
    </div>
  );
};

// Alternative compact logo for smaller spaces
export const SpykeLogoCompact = ({ 
  size = 32, 
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/logo-icon.svg"
        alt="Spyke AI"
        width={size}
        height={size}
        className="logo-icon"
      />
    </div>
  );
};