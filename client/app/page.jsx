'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowRight,
  Star,
  CheckCircle,
  Shield,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Rocket,
  Menu,
  X,
  Upload,
  Loader2,
  Zap,
  Clock,
  DollarSign,
  Building,
  Award,
  MessageSquare,
  FileText,
  Brain,
  Download,
  Search,
  Globe,
  Code,
  Lightbulb,
  Layers,
  BookOpen,
  Sparkles,
  Database,
  Server,
  Smartphone,
  CreditCard,
  UserCheck,
  Settings,
  ShoppingCart,
  PenTool,
  Palette,
} from "lucide-react";
import { SpykeLogo } from "@/components/Logo";

const CONSTANTS = {
  COMPANY: {
    NAME: "Spyke AI",
    LOGO_TEXT: "SA",
    DOMAIN: "spykeai.com",
    TAGLINE: "Premium AI Prompts & Automation Marketplace",
    DESCRIPTION: "by FutureDesks",
  },
  ANIMATION: {
    METRIC_INTERVAL: 3000,
    SCROLL_THRESHOLD: 50,
  },
  NAVIGATION: {
    ITEMS: ["Tech Stack", "Features", "About"],
  },
};

const buttonVariants = {
  primary:
    "bg-brand-primary text-brand-primary-text hover:hover-brand-primary focus:ring-4 focus:ring-[#00FF89]/20 shadow-lg hover:shadow-xl transform hover:scale-105",
  secondary:
    "bg-brand-secondary text-brand-secondary-text hover:hover-brand-secondary focus:ring-4 focus:ring-[#FFC050]/20 shadow-lg hover:shadow-xl transform hover:scale-105",
  dark:
    "bg-brand-dark text-brand-dark-text hover:hover-brand-dark focus:ring-4 focus:ring-[#121212]/20 shadow-lg hover:shadow-xl transform hover:scale-105",
  ghost:
    "text-gray-600 hover:text-[#00FF89] hover:bg-[#00FF89]/10 focus:ring-4 focus:ring-[#00FF89]/20",
  outline:
    "bg-transparent border-2 border-[#00FF89] text-[#00FF89] hover:bg-[#00FF89] hover:text-[#121212] focus:ring-4 focus:ring-[#00FF89]/20 shadow-sm hover:shadow-md",
};

const buttonSizes = {
  sm: "px-3 py-2 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base rounded-xl",
  lg: "px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg rounded-xl",
  xl: "px-8 py-4 text-lg sm:px-10 sm:py-5 sm:text-xl rounded-2xl",
};

const badgeVariants = {
  primary: "bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/20",
  secondary: "bg-[#FFC050]/10 text-[#FFC050] border border-[#FFC050]/20",
  dark: "bg-[#121212]/10 text-[#121212] border border-[#121212]/20",
  new: "gradient-primary text-white animate-pulse",
};

// Enhanced Button component
const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled = false,
  icon: Icon,
  ...props
}) => {
  const variantClass = buttonVariants[variant];
  const sizeClass = buttonSizes[size];

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-95 focus:outline-none title-font ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
        </>
      )}
    </button>
  );
};

// Enhanced Card component
const Card = ({
  children,
  className = "",
  gradient = false,
  hover = true,
  ...props
}) => (
  <div
    className={`bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-lg ${
      hover ? "hover:shadow-xl hover:-translate-y-1" : ""
    } transition-all duration-300 ${
      gradient ? "gradient-primary" : ""
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);

const Badge = ({
  children,
  variant = "primary",
  className = "",
  pulse = false,
}) => {
  const variantClass = badgeVariants[variant];
  return (
    <span
      className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium title-font ${variantClass} ${
        pulse ? "animate-pulse" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
};

// Enhanced hooks
const useScrolled = (threshold = CONSTANTS.ANIMATION.SCROLL_THRESHOLD) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
};

// Intersection observer hook
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [elementRef, isIntersecting];
};

// Tech Stack Data
const techStack = [
  {
    category: "Frontend",
    technologies: [
      { name: "Next.js", icon: Globe, description: "React framework for production" },
      { name: "React", icon: Code, description: "Component-based UI library" },
      { name: "Tailwind CSS", icon: Palette, description: "Utility-first CSS framework" },
      { name: "Framer Motion", icon: Zap, description: "Animation library" },
    ],
    color: "from-[#00FF89] to-[#FFC050]",
  },
  {
    category: "Backend",
    technologies: [
      { name: "Node.js", icon: Server, description: "JavaScript runtime environment" },
      { name: "MongoDB", icon: Database, description: "NoSQL document database" },
      { name: "ImageKit", icon: Shield, description: "Upload services" },
      { name: "Sanity CMS", icon: FileText, description: "Headless CMS for blogs" },
    ],
    color: "from-[#FFC050] to-[#00FF89]",
  },
  {
    category: "Integrations",
    technologies: [
      { name: "Razorpay", icon: CreditCard, description: "Payment gateway integration" },
      { name: "Google OAuth", icon: UserCheck, description: "Social login authentication" },
      { name: "SEO Optimization", icon: TrendingUp, description: "Search engine optimization" },
      { name: "Mobile Responsive", icon: Smartphone, description: "Cross-platform compatibility" },
    ],
    color: "from-[#121212] to-[#00FF89]",
  },
];

// Product Features
const productFeatures = [
  {
    title: "Multi-Dashboard System",
    description: "Separate dashboards for admins, sellers, and users with role-based access control",
    icon: Users,
    details: [
      "Admin panel for marketplace management",
      "Seller dashboard for product uploads",
      "User dashboard for purchases and downloads",
      "Real-time analytics and reporting"
    ]
  },
  {
    title: "Digital Product Marketplace",
    description: "Complete marketplace for AI prompts, automation docs, and digital solutions",
    icon: ShoppingCart,
    details: [
      "Upload prompts with titles & descriptions",
      "PDF documentation and guides",
      "Instant digital downloads",
      "Revenue sharing system"
    ]
  },
  {
    title: "Secure Payment System",
    description: "Integrated payment processing with automatic revenue distribution",
    icon: CreditCard,
    details: [
      "Razorpay payment gateway",
      "Automatic seller payouts",
      "Admin commission system",
      "Transaction tracking"
    ]
  },
  {
    title: "Content Management",
    description: "Powerful CMS for blogs, SEO optimization, and content marketing",
    icon: FileText,
    details: [
      "Sanity CMS integration",
      "SEO-optimized blog system",
      "Content marketing tools",
      "Social media integration"
    ]
  }
];

// Enhanced Navigation
const Navigation = () => {
  const scrolled = useScrolled();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
          : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-18">
         <SpykeLogo size={40} className="" showText={true} />

          <nav
            className="hidden lg:flex items-center space-x-8"
            aria-label="Primary navigation"
          >
            {CONSTANTS.NAVIGATION.ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[#121212] hover:text-[#00FF89] focus:text-[#00FF89] focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 rounded-md px-3 py-2 font-medium transition-colors body-font"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="primary" size="md" icon={Rocket}>
              Coming Soon
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00FF89]"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-100`}
      >
        <div className="px-4 py-6 space-y-4">
          {CONSTANTS.NAVIGATION.ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="block py-3 px-2 text-[#121212] hover:text-[#00FF89] focus:text-[#00FF89] focus:outline-none focus:ring-2 focus:ring-[#00FF89] rounded-md font-medium transition-colors body-font"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={Rocket}
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hero Section
const HeroSection = () => {
  const [heroRef, isVisible] = useIntersectionObserver();

  return (
    <section
      ref={heroRef}
      className="pt-20 sm:pt-24 pb-16 sm:pb-20 bg-gradient-to-br from-white via-[#00FF89]/5 to-[#FFC050]/5 relative overflow-hidden"
    >
      {/* Enhanced background with brand colors */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#00FF89]/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-[#FFC050]/20 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-[#00FF89]/10 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-8 sm:space-y-12">
          <div
            className={`space-y-6 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex justify-center">
              <Badge variant="new" pulse>
                <Sparkles className="mr-2 w-4 h-4" />
                Coming Soon
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-[#121212] max-w-5xl mx-auto title-font">
              <span className="gradient-text-primary">
                Spyke AI
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">
                Premium AI Marketplace
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto body-font">
              Discover premium AI prompts, automation solutions, and digital tools created by experts. 
              Spyke AI is the leading marketplace for battle-tested prompts, comprehensive guides, and 
              AI-powered automation solutions that transform your workflow.
            </p>

            <div className="text-lg text-gray-500 font-medium body-font">
              by FutureDesks
            </div>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-gray-600 body-font">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-[#00FF89] mr-2" />
                <span>AI Prompts & Automation</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-[#00FF89] mr-2" />
                <span>Multi-Dashboard System</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-[#00FF89] mr-2" />
                <span>Revenue Sharing Platform</span>
              </div>
            </div>
          </div>

          {/* Enhanced CTAs */}
          <div
            className={`space-y-6 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="xl" variant="primary" icon={Rocket}>
                Coming Soon
              </Button>
              <Button size="xl" variant="outline" icon={MessageSquare}>
                Stay Updated
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Tech Stack Section
const TechStackSection = () => {
  const [techRef, isVisible] = useIntersectionObserver();

  return (
    <section
      ref={techRef}
      id="tech-stack"
      className="py-20 bg-gradient-to-br from-gray-50 to-[#00FF89]/5"
      style={{ scrollMarginTop: "80px" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge variant="primary" className="mb-6">
            <Code className="mr-2 w-4 h-4" />
            Technology Stack
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#121212] mb-6 title-font">
            Powered by
            <span className="block gradient-text-primary">
              Next-Gen Technology
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto body-font">
            Built with the most advanced and reliable technologies in the industry for exceptional performance and scalability.
          </p>
        </div>

        <div
          className={`transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {techStack.map((stack, index) => (
              <Card key={index} className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-[#00FF89]/30 transition-all duration-300">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${stack.color} text-white font-bold text-lg mb-4 shadow-lg title-font`}>
                    {stack.category.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-[#121212] mb-2 title-font">{stack.category}</h3>
                </div>
                
                <div className="space-y-4">
                  {stack.technologies.map((tech, techIndex) => (
                    <div key={techIndex} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50/50 hover:bg-white/80 transition-colors">
                      <div className={`w-8 h-8 bg-gradient-to-r ${stack.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                        <tech.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#121212] title-font">{tech.name}</h4>
                        <p className="text-sm text-gray-600 body-font">{tech.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* API Status Card */}
          <Card className="p-6 bg-gradient-to-r from-[#00FF89]/10 to-[#FFC050]/10 border-[#00FF89]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#121212] title-font">API Infrastructure</h3>
                  <p className="text-gray-600 body-font">RESTful API with comprehensive endpoints</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="primary" className="text-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
                <div className="text-sm text-gray-500 mt-1 body-font">Health Check Available</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const [featuresRef, isVisible] = useIntersectionObserver();

  return (
    <section
      ref={featuresRef}
      id="features"
      className="py-20 bg-gray-50"
      style={{ scrollMarginTop: "80px" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge variant="secondary" className="mb-6">
            <Zap className="mr-2 w-4 h-4" />
            Product Features
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#121212] mb-6 title-font">
            Complete
            <span className="block gradient-text-primary">
              Marketplace Solution
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto body-font">
            Everything you need to run a successful AI prompt and automation marketplace.
          </p>
        </div>

        <div
          className={`grid lg:grid-cols-2 gap-8 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {productFeatures.map((feature, index) => (
            <Card key={index} className="p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#121212] mb-2 title-font">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 body-font">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600 body-font">
                        <CheckCircle className="w-4 h-4 text-[#00FF89] mr-2 flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  const [aboutRef, isVisible] = useIntersectionObserver();

  return (
    <section
      ref={aboutRef}
      id="about"
      className="py-20 bg-[#121212] text-white"
      style={{ scrollMarginTop: "80px" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge variant="dark" className="mb-6 bg-[#00FF89]/20 text-[#00FF89] border-[#00FF89]/30">
            <Building className="mr-2 w-4 h-4" />
            About the Project
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 title-font">
            Building the Future of
            <span className="block text-[#00FF89]">
              AI Marketplaces
            </span>
          </h2>
        </div>

        <div
          className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4 title-font">Project Overview</h3>
            <p className="text-gray-300 leading-relaxed body-font">
              Spyke AI is a comprehensive marketplace platform designed for AI prompts and automation solutions. 
              Built with modern web technologies, it features a complete ecosystem for creators, users, and administrators.
            </p>
            
            <h3 className="text-2xl font-bold mb-4 title-font">Key Components</h3>
            <div className="space-y-3">
              {[
                "Admin panel for marketplace management",
                "Seller dashboard for content upload",
                "User dashboard for purchases",
                "Secure payment processing with Razorpay",
                "Google OAuth authentication",
                "SEO-optimized architecture",
                "Mobile-responsive design"
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#00FF89] mr-3 flex-shrink-0" />
                  <span className="text-gray-300 body-font">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8 bg-gray-800 border-gray-700">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white mx-auto">
                <Rocket className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-white title-font">Development Status</h3>
              
              <p className="text-gray-400 body-font">
                Currently in development phase, focusing on core marketplace functionality, 
                payment integration, and user experience optimization.
              </p>
              
              <div className="space-y-4">
                <div className="text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400 body-font">Progress</span>
                    <span className="text-sm text-[#00FF89] title-font">75%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="gradient-primary h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
              
              <Button variant="primary" size="lg" icon={MessageSquare} className="w-full">
                Stay Updated
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-[#121212] text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold title-font">
                {CONSTANTS.COMPANY.LOGO_TEXT}
              </span>
            </div>
            <span className="text-lg font-bold title-font">{CONSTANTS.COMPANY.NAME}</span>
          </div>
          <p className="text-gray-400 body-font">
            {CONSTANTS.COMPANY.TAGLINE}
          </p>
          <p className="text-gray-500 body-font">
            {CONSTANTS.COMPANY.DESCRIPTION}
          </p>
          <div className="border-t border-gray-800 pt-8 text-gray-400">
            <p className="body-font">&copy; 2024 FutureDesks. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page component
const LandingPage = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <TechStackSection />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default LandingPage;