'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Landmark,
  ShieldCheck,
  Building2,
  Flag,
  Compass,
  Menu,
  X,
  ArrowRight,
  Info,
  Database,
  Cpu,
  TrendingUp,
  AlertTriangle,
  BarChart2,
  Shield,
  Server,
  CheckCircle2,
  ShieldAlert,
  BrainCircuit
  Users,
  BarChart3,
  Building,
  DollarSign,
  Clock,
  BrainCircuit,
  Bot,
  LineChart,
  Bell,
  FileSpreadsheet,
  Layers,
  User,
  Sun,
  Building2,
  Network,
  Train,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

/* =====================================================
   1. LOGO COMPONENT
===================================================== */
interface LogoProps {
  theme?: 'light' | 'dark';
  variant?: 'full' | 'compact';
  size?: 'normal' | 'large' | 'small';
}

export const Logo: React.FC<LogoProps> = ({
  theme = 'light',
  variant = 'full',
  size = 'normal',
}) => {
  const isDark = theme === 'dark';
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const navyColor = isDark ? '#FFF9EF' : '#17365D';
  const orangeColor = '#F59A00';
  const subtextColor = isDark ? 'rgba(255, 249, 239, 0.85)' : '#5E6C84';

  const scale = isLarge ? 1.2 : isSmall ? 0.85 : 1;
  const titleFontSize = isLarge ? '1.85rem' : isSmall ? '1.15rem' : '1.5rem';
  const taglineFontSize = isLarge ? '0.72rem' : isSmall ? '0.55rem' : '0.64rem';
  const ministryFontSize = isLarge ? '0.62rem' : isSmall ? '0.5rem' : '0.58rem';

  return (
    <div
      className="paimana-official-logo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${0.85 * scale}rem`,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingRight: '0.75rem',
          borderRight: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : '#17365D'}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg
            width={Math.round(34 * scale)}
            height={Math.round(42 * scale)}
            viewBox="0 0 100 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 2C42 2 38 8 38 15C38 21 43 25 50 25C57 25 62 21 62 15C62 8 58 2 50 2Z"
              fill={navyColor}
            />
            <path
              d="M25 14C19 14 16 20 18 26C20 32 27 33 30 30C33 27 31 18 25 14Z"
              fill={navyColor}
            />
            <path
              d="M75 14C81 14 84 20 82 26C80 32 73 33 70 30C67 27 69 18 75 14Z"
              fill={navyColor}
            />
            <path d="M35 25H65V42H35V25Z" fill={navyColor} />
            <path d="M42 42H58V50H42V42Z" fill={navyColor} />
            <rect x="14" y="50" width="72" height="24" rx="4" fill={navyColor} />
            <circle
              cx="50"
              cy="62"
              r="9"
              fill={isDark ? '#17365D' : '#FFF9EF'}
              stroke={navyColor}
              strokeWidth="1.5"
            />
            <circle cx="50" cy="62" r="2.5" fill={orangeColor} />
            <path
              d="M50 53V71M41 62H59M43.6 55.6L56.4 68.4M56.4 55.6L43.6 68.4"
              stroke={navyColor}
              strokeWidth="0.8"
            />
            <path d="M20 74L30 84H70L80 74H20Z" fill={navyColor} />
            <rect x="10" y="86" width="80" height="16" rx="3" fill={navyColor} />
            <text
              x="50"
              y="98"
              fontSize="8.5"
              fontWeight="900"
              fill={isDark ? '#17365D' : '#FFF9EF'}
              textAnchor="middle"
            >
              सत्यमेव जयते
            </text>
          </svg>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            fontSize: titleFontSize,
            fontWeight: 900,
            color: navyColor,
            letterSpacing: '0.04em',
            lineHeight: 0.95,
            textTransform: 'uppercase',
          }}
        >
          PAIMANA
        </div>
        <div
          style={{
            fontSize: taglineFontSize,
            color: orangeColor,
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginTop: '3px',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          AI-POWERED EARLY WARNING SYSTEM
        </div>
        {variant !== 'compact' && (
          <div
            style={{
              fontSize: ministryFontSize,
              color: subtextColor,
              fontWeight: 600,
              lineHeight: 1.2,
              marginTop: '3px',
            }}
          >
            Ministry of Statistics & Programme Implementation
            <br />
            Government of India
          </div>
        )}
      </div>
    </div>
  );
};

/* =====================================================
   2. ANIMATED BACKGROUND
===================================================== */
export const AnimatedBackground: React.FC = () => {
  const images = [
    { url: '/assets/images/expressway.jpg', title: 'National Highways & Cable Expressway Corridor' },
    { url: '/assets/images/railways.jpg', title: 'High-Speed Vande Bharat Rail Viaduct' },
    { url: '/assets/images/energy.jpg', title: 'National Renewable Solar & Wind Energy Grid' },
    { url: '/assets/images/port.jpg', title: 'Deep-Water Maritime Port & Container Logistics' },
    { url: '/assets/images/urban.jpg', title: 'Smart City Metro & Urban Infrastructure' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div
      className="paimana-animated-bg-wrapper"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {images.map((img, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={img.url}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("${img.url}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1.04)' : 'scale(1.0)',
              transition: 'opacity 1.8s ease-in-out, transform 5.5s ease-out',
              filter: 'brightness(0.95) contrast(1.05) saturate(1.1)',
            }}
          />
        );
      })}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to top, rgba(23, 54, 93, 0.4) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '22px',
          right: '25px',
          zIndex: 10,
          backgroundColor: '#FFFFFF',
          border: '2px solid #F59A00',
          borderRadius: '25px',
          padding: '0.45rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          boxShadow: '0 8px 24px rgba(23, 54, 93, 0.2)',
          fontSize: '0.78rem',
          fontWeight: 800,
          color: '#17365D',
          pointerEvents: 'auto',
        }}
      >
        <span
          className="animate-pulse-slow"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#F59A00',
            display: 'inline-block',
          }}
        />
        <span>Live Infrastructure: {images[currentIndex].title}</span>
      </div>
    </div>
  );
};

/* =====================================================
   3. NAVBAR (SINGLE WORKSPACE LOGIN WITH PRIMARY STYLE)
===================================================== */
interface NavLink {
  name: string;
  href: string;
}

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Home');

  // Handle Scroll, Sticky Header & Scroll-Spy Active Tab Detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['home', 'about', 'features', 'insights', 'resources', 'contact'];
      const scrollPosition = window.scrollY + 180;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            const formattedName = section.charAt(0).toUpperCase() + section.slice(1);
            setActiveNav(formattedName);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavLink[] = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Insights', href: '#insights' },
    { name: 'Resources', href: '#resources' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent, link: NavLink) => {
    e.preventDefault();
    setActiveNav(link.name);
    setMobileOpen(false);

    if (pathname !== '/') {
      router.push('/' + link.href);
      return;
    }

    if (link.href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const elem = document.querySelector(link.href);
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>
      {/* Main Header Bar */}
      <header
        className={`paimana-navbar ${scrolled ? 'scrolled' : ''}`}
        style={{
          width: '100%',
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : '#FFF9EF',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(23, 54, 93, 0.08)' : 'none',
          borderBottom: scrolled ? '1px solid #EAE2D5' : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          className="paimana-navbar-container"
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '0.85rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Logo variant="full" />
          </div>

          {/* Desktop Nav Links */}
          <nav
            className="desktop-nav-menu hidden md:flex"
            style={{ gap: '1.85rem', alignItems: 'center' }}
          >
            {navLinks.map((link) => {
              const isActive = activeNav === link.name;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  style={{
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#F59A00' : '#17365D',
                    position: 'relative',
                    padding: '0.25rem 0.2rem',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.name}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: '#F59A00',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Single Primary Workspace Login Button (Desktop) */}
          <div
            className="desktop-nav-buttons hidden md:flex"
            style={{ alignItems: 'center' }}
          >
            <button
              onClick={() => router.push('/workspace/login')}
              className="btn-primary"
              style={{
                padding: '0.65rem 1.35rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: '10px',
                backgroundColor: '#F59A00',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>Workspace Login</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#17365D',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            className="mobile-hamburger-btn block md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div
            className="mobile-drawer block md:hidden"
            style={{
              backgroundColor: '#FFF9EF',
              borderBottom: '1px solid #EAE2D5',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 25px rgba(23, 54, 93, 0.1)',
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                style={{
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: activeNav === link.name ? 700 : 500,
                  color: activeNav === link.name ? '#F59A00' : '#17365D',
                }}
              >
                {link.name}
              </a>
            ))}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #EAE2D5',
              }}
            >
              <button
                onClick={() => {
                  setMobileOpen(false);
                  router.push('/workspace/login');
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  backgroundColor: '#F59A00',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>Workspace Login</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Latest Updates Ticker Bar */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          borderBottom: '1px solid #BFDBFE',
          borderTop: '1px solid #DBEAFE',
          display: 'flex',
          alignItems: 'center',
          height: '36px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          fontSize: '0.82rem',
          fontWeight: 700,
        }}
      >
        <div
          style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            padding: '0 1.25rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 800,
            fontSize: '0.76rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            flexShrink: 0,
            zIndex: 2,
            boxShadow: '4px 0 10px rgba(37, 99, 235, 0.15)',
          }}
        >
          <Info size={14} strokeWidth={2.5} />
          <span>LATEST UPDATES</span>
        </div>

        <div
          style={{
            overflow: 'hidden',
            width: '100%',
            whiteSpace: 'nowrap',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <style>{`
            @keyframes updatesTicker {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .ticker-text-track {
              display: inline-block;
              white-space: nowrap;
              animation: updatesTicker 30s linear infinite;
              color: #1D4ED8;
              font-weight: 700;
              font-size: 0.83rem;
            }
            .ticker-text-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="ticker-text-track">
            * 14 New Mega Projects added in Q4 FY26 &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; AI
            Predictive Module v2.0 is now live for all central ministries
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Deadline for physical progress submission
            extended to 31st March *
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   HERO SECTION (DYNAMIC MULTI-TRANSITION BACKGROUNDS)
===================================================== */
interface DynamicSlide {
  id: string;
  category: string;
  title: string;
  imageUrl: string;
  transitionType: string;
  icon: React.ReactNode;
}

export const Hero: React.FC = () => {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // 6 Themes with High-Res Images & Unique Animation Styles
  const slides: DynamicSlide[] = [
    {
      id: 'chips',
      category: 'Semiconductor Fabrication',
      title: 'Live Infrastructure: Mega Silicon Semiconductor & Chip Plant',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80',
      transitionType: 'anim-zoom-in',
      icon: <Cpu size={16} color="#F59A00" />,
    },
    {
      id: 'metro',
      category: 'Transit Systems',
      title: 'Live Infrastructure: Rapid Metro Rail & Urban Transit Corridor',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80',
      transitionType: 'anim-pan-right',
      icon: <Train size={16} color="#F59A00" />,
    },
    {
      id: 'solar',
      category: 'Clean Energy',
      title: 'Live Infrastructure: 2000MW Ultra Mega Solar Power Park',
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=2000&q=80',
      transitionType: 'anim-zoom-out',
      icon: <Sun size={16} color="#F59A00" />,
    },
    {
      id: 'buildings',
      category: 'Urban Infrastructure',
      title: 'Live Infrastructure: Smart City Skyscraper & Urban High-Rise',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
      transitionType: 'anim-pan-left',
      icon: <Building2 size={16} color="#F59A00" />,
    },
    {
      id: 'networking',
      category: 'Telecom Backbone',
      title: 'Live Infrastructure: 5G Fiber Optical & Data Grid Mesh Network',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=2000&q=80',
      transitionType: 'anim-fade-blur',
      icon: <Network size={16} color="#F59A00" />,
    },
    {
      id: 'ai',
      category: 'Artificial Intelligence',
      title: 'Live Infrastructure: AI Neural Matrix & Autonomous Digital Twin',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=80',
      transitionType: 'anim-pulse-scale',
      icon: <BrainCircuit size={16} color="#F59A00" />,
    },
  ];

  // Auto-slide transition every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlideIndex];

  return (
    <section
      id="home"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        padding: '4rem 2rem',
        overflow: 'hidden',
      }}
    >
      {/* CSS Keyframe Animations for Dynamic Transitions */}
      <style>{`
        /* Smooth Fade & Zoom In Effect */
        @keyframes animZoomIn {
          0% { opacity: 0; transform: scale(1); }
          15% { opacity: 1; }
          100% { opacity: 1; transform: scale(1.12); }
        }
        
        /* Pan Right Effect */
        @keyframes animPanRight {
          0% { opacity: 0; transform: translateX(-3%) scale(1.05); }
          15% { opacity: 1; }
          100% { opacity: 1; transform: translateX(2%) scale(1.08); }
        }

        /* Zoom Out Effect */
        @keyframes animZoomOut {
          0% { opacity: 0; transform: scale(1.15); }
          15% { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }

        /* Pan Left Effect */
        @keyframes animPanLeft {
          0% { opacity: 0; transform: translateX(3%) scale(1.05); }
          15% { opacity: 1; }
          100% { opacity: 1; transform: translateX(-2%) scale(1.08); }
        }

        /* Soft Fade with Subtle Blur */
        @keyframes animFadeBlur {
          0% { opacity: 0; filter: blur(8px); transform: scale(1.02); }
          15% { opacity: 1; filter: blur(0px); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1.06); }
        }

        /* Pulse Scale Effect */
        @keyframes animPulseScale {
          0% { opacity: 0; transform: scale(1); }
          15% { opacity: 1; }
          50% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1.03); }
        }

        .hero-bg-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: opacity 1s ease-in-out;
        }

        .anim-zoom-in { animation: animZoomIn 6s ease-out forwards; }
        .anim-pan-right { animation: animPanRight 6s ease-out forwards; }
        .anim-zoom-out { animation: animZoomOut 6s ease-out forwards; }
        .anim-pan-left { animation: animPanLeft 6s ease-out forwards; }
        .anim-fade-blur { animation: animFadeBlur 6s ease-out forwards; }
        .anim-pulse-scale { animation: animPulseScale 6s ease-out forwards; }
      `}</style>

      {/* Render Dynamic Background Images with Layering */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentSlideIndex;
        return (
          <div
            key={slide.id}
            className={`hero-bg-image ${isActive ? slide.transitionType : ''}`}
            style={{
              backgroundImage: `url('${slide.imageUrl}')`,
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Dark Overlay over all images for 100% Text Contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.90) 100%)',
          zIndex: 2,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          {/* Main Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
            }}
          >
            <span style={{ color: '#FFFFFF', display: 'block' }}>
              Predict Risks.
            </span>
            <span style={{ color: '#F59A00', display: 'block' }}>
              Protect Investments.
            </span>
            <span style={{ color: '#FFFFFF', display: 'block' }}>
              Build a Stronger India.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              marginBottom: '2rem',
            }}
          >
            PAIMANA transforms infrastructure monitoring with AI-powered early
            warning signals, helping policymakers and agencies identify cost
            escalations and schedule delays before they impact national development.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
            }}
          >
            <button
              onClick={() => router.push('/workspace/login')}
              style={{
                backgroundColor: '#F59A00',
                color: '#FFFFFF',
                padding: '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(245, 154, 0, 0.35)',
                transition: 'transform 0.2s ease',
              }}
            >
              <span>Workspace Login</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => {
                const elem = document.querySelector('#features');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#17365D',
                padding: '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              }}
            >
              <span>Explore Platform</span>
              <BarChart2 size={18} color="#F59A00" />
            </button>
          </div>

          {/* Feature Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="#F59A00" />
              <span>Secure</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={18} color="#F59A00" />
              <span>Data-Driven</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={18} color="#F59A00" />
              <span>Built for Bharat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Dots Indicator (Interactive) */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 4,
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlideIndex(i)}
            style={{
              width: i === currentSlideIndex ? '28px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: i === currentSlideIndex ? '#F59A00' : 'rgba(255, 255, 255, 0.35)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Dynamic Live Infrastructure Tag (Updates automatically with active image) */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          right: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#17365D',
          padding: '0.55rem 1.1rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          zIndex: 4,
          transition: 'all 0.4s ease',
        }}
      >
        {activeSlide.icon}
        <span>{activeSlide.title}</span>
      </div>
    </section>
  );
};

/* =====================================================
   5. TRUST SECTION
===================================================== */
export const TrustSection: React.FC = () => {
  const partners = [
    {
      name: 'Ministry of Statistics & Programme Implementation',
      code: 'MoSPI',
      icon: Landmark,
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    },
    {
      name: 'NITI Aayog Infrastructure Division',
      code: 'NITI',
      icon: Building2,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
    },
    {
      name: 'Department for Promotion of Industry and Internal Trade',
      code: 'DPIIT',
      icon: Flag,
      color: '#EA580C',
      bg: '#FFF7ED',
      border: '#FFEDD5',
    },
    {
      name: 'PM GatiShakti National Master Plan',
      code: 'PM GatiShakti',
      icon: Compass,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
    },
    {
      name: 'Smart Cities Mission Project Cell',
      code: 'Smart Cities',
      icon: ShieldCheck,
      color: '#0D9488',
      bg: '#CCFBF1',
      border: '#99F6E4',
    },
  ];

  return (
    <section
      style={{
        padding: '3.5rem 2rem 4rem',
        backgroundColor: '#FFFFFF',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
          padding: '3rem 2.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.25rem',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            borderRadius: '30px',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#1D4ED8',
            marginBottom: '1.1rem',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
          }}
        >
          <Landmark size={16} style={{ color: '#1D4ED8' }} />
          <span>GOVERNMENT ENTERPRISE TRUST</span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)',
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            marginBottom: '0.65rem',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          Trusted by <span style={{ color: '#2563EB' }}>Government.</span>{' '}
          <span style={{ color: '#EA580C' }}>Built for Impact.</span>
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            marginBottom: '1rem',
          }}
        >
          <div style={{ width: '28px', height: '4px', backgroundColor: '#FF9933', borderRadius: '2px' }} />
          <div style={{ width: '28px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px' }} />
          <div style={{ width: '28px', height: '4px', backgroundColor: '#138808', borderRadius: '2px' }} />
        </div>

        <p
          style={{
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#64748B',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '2.5rem',
          }}
        >
          Designed for government infrastructure monitoring & policy decision-making
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.1rem',
            flexWrap: 'wrap',
          }}
        >
          {partners.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.8rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  border: `1.5px solid #E2E8F0`,
                  borderRadius: '30px',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = p.color;
                  e.currentTarget.style.boxShadow = `0 10px 25px ${p.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: p.bg,
                    border: `1.5px solid ${p.border}`,
                    color: p.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} strokeWidth={2.4} />
                </div>
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   6. FEATURE CARDS
===================================================== */
export const FeatureCards: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      id: 'early-warning-system',
      icon: ShieldAlert,
      title: 'Early Warning System',
      description:
        'AI models detect risks early and provide actionable warnings before cost overruns materialize.',
      tag: 'RISK DETECTION',
      themeColor: '#2563EB',
      bgColor: '#EFF6FF',
      tagBg: '#EFF6FF',
      tagColor: '#2563EB',
      tagBorder: '#BFDBFE',
      btnBg: '#2563EB',
      btnHover: '#1D4ED8',
    },
    {
      id: 'ai-powered-insights',
      icon: TrendingUp,
      title: 'AI-Powered Insights',
      description:
        'Explainable AI reveals the key underlying factors behind every project risk through SHAP attribution.',
      tag: 'EXPLAINABLE AI',
      themeColor: '#059669',
      bgColor: '#ECFDF5',
      tagBg: '#ECFDF5',
      tagColor: '#059669',
      tagBorder: '#A7F3D0',
      btnBg: '#059669',
      btnHover: '#047857',
    },
    {
      id: 'data-driven-decisions',
      icon: Database,
      title: 'Data-Driven Decisions',
      description:
        'Transform historical infrastructure data into high-precision predictive intelligence.',
      tag: 'DATA INTELLIGENCE',
      themeColor: '#7C3AED',
      bgColor: '#F5F3FF',
      tagBg: '#F5F3FF',
      tagColor: '#7C3AED',
      tagBorder: '#DDD6FE',
      btnBg: '#7C3AED',
      btnHover: '#6D28D9',
    },
    {
      id: 'collaborative-monitoring',
      icon: Users,
      title: 'Collaborative Monitoring',
      description:
        'Enable policymakers and monitoring agencies to act together with shared real-time intelligence.',
      tag: 'MULTI-AGENCY',
      themeColor: '#EA580C',
      bgColor: '#FFF7ED',
      tagBg: '#FFF7ED',
      tagColor: '#EA580C',
      tagBorder: '#FFEDD5',
      btnBg: '#EA580C',
      btnHover: '#C2410C',
    },
  ];

  const trustPillars = [
    { icon: ShieldCheck, title: 'Secure & Reliable', desc: 'Enterprise-grade security', color: '#2563EB', bg: '#EFF6FF' },
    { icon: BarChart3, title: 'Data-Driven', desc: 'Evidence-based planning', color: '#059669', bg: '#ECFDF5' },
    { icon: Users, title: 'Collaborative', desc: 'Stronger together', color: '#7C3AED', bg: '#F5F3FF' },
    { icon: Building, title: 'Policy-Focused', desc: 'Impactful governance', color: '#EA580C', bg: '#FFF7ED' },
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{ padding: '4rem 2rem 5rem', backgroundColor: '#FFFFFF', position: 'relative' }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.2rem',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '30px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#1D4ED8',
              marginBottom: '1rem',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
            }}
          >
            <Landmark size={16} style={{ color: '#1D4ED8' }} />
            <span>SMART GOVERNANCE. STRONGER INDIA.</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Intelligent Solutions for{' '}
            <span style={{ color: '#EA580C' }}>Smarter</span>{' '}
            <span style={{ color: '#059669' }}>Infrastructure</span>
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              marginBottom: '1.1rem',
            }}
          >
            <div style={{ width: '28px', height: '4px', backgroundColor: '#FF9933', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#138808', borderRadius: '2px' }} />
          </div>

          <p
            style={{
              color: '#64748B',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Advanced capabilities built to predict risks, optimize investments, and accelerate
            national development.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                onClick={() => router.push(`/capability/${feat.id}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.35s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${idx * 0.1}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px ${feat.themeColor}1A`;
                  e.currentTarget.style.borderColor = feat.themeColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.06)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{ padding: '2rem 1.75rem 3.5rem', position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        backgroundColor: feat.themeColor,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 18px ${feat.themeColor}40`,
                      }}
                    >
                      <Icon size={24} strokeWidth={2.4} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: feat.tagColor,
                        backgroundColor: feat.tagBg,
                        border: `1.5px solid ${feat.tagBorder}`,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {feat.tag}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.28rem',
                      fontWeight: 900,
                      color: '#0F172A',
                      marginBottom: '0.75rem',
                      fontFamily: 'Outfit, sans-serif',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      color: '#64748B',
                      fontWeight: 400,
                    }}
                  >
                    {feat.description}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/capability/${feat.id}`);
                  }}
                  style={{
                    backgroundColor: feat.btnBg,
                    color: '#FFFFFF',
                    padding: '0.95rem 1.5rem',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    position: 'relative',
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = feat.btnHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = feat.btnBg)}
                >
                  <span>Explore Capability</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 25px rgba(15, 23, 42, 0.04)',
            padding: '1.25rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          {trustPillars.map((tp, i) => {
            const TIcon = tp.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  paddingRight: i < trustPillars.length - 1 ? '1rem' : 0,
                  borderRight: i < trustPillars.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: tp.bg,
                    color: tp.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TIcon size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                    {tp.title}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 500 }}>
                    {tp.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   7. ABOUT SECTION
===================================================== */
export const AboutSection: React.FC = () => {
  const cards = [
    {
      value: '1,981',
      label: 'Active Infrastructure Projects',
      badge: '↑ 12.4% MoSPI Portfolio',
      icon: Layers,
      themeColor: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      badgeBg: '#EFF6FF',
      badgeColor: '#2563EB',
      badgeBorder: '#BFDBFE',
    },
    {
      value: '₹150+ Cr',
      label: 'Project Capital Under Monitoring',
      badge: 'National Infrastructure Pipeline',
      icon: TrendingUp,
      themeColor: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      badgeBg: '#ECFDF5',
      badgeColor: '#059669',
      badgeBorder: '#A7F3D0',
    },
    {
      value: 'AI-Powered',
      label: 'Predictive Risk Intelligence',
      badge: 'SHAP Explainable Machine Learning',
      icon: Cpu,
      themeColor: '#EA580C',
      bgColor: '#FFF7ED',
      borderColor: '#FFEDD5',
      badgeBg: '#FFF7ED',
      badgeColor: '#EA580C',
      badgeBorder: '#FFEDD5',
    },
  ];

  const trustPillars = [
    {
      icon: ShieldCheck,
      title: 'Secure & Reliable',
      desc: 'Enterprise-grade security for critical data',
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      icon: Database,
      title: 'Data-Driven',
      desc: 'Evidence-based planning for better outcomes',
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      icon: Users,
      title: 'Collaborative',
      desc: 'Stronger together with real-time intelligence',
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
    {
      icon: Landmark,
      title: 'Policy-Focused',
      desc: 'Enabling impactful governance decisions',
      color: '#EA580C',
      bg: '#FFF7ED',
    },
  ];

  return (
    <section
      id="about"
      style={{ padding: '4.5rem 2rem 5rem', backgroundColor: '#FFFFFF', position: 'relative' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '30px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#1D4ED8',
              marginBottom: '1.1rem',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
            }}
          >
            <Landmark size={16} style={{ color: '#1D4ED8' }} />
            <span>DATA-DRIVEN GOVERNANCE</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            From Reactive Monitoring to{' '}
            <span style={{ color: '#2563EB' }}>Predictive</span>{' '}
            <span style={{ color: '#059669' }}>Intelligence</span>
          </h2>

          <p
            style={{
              color: '#64748B',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto 1.1rem',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Traditional monitoring tells us what happened. PAIMANA helps decision-makers understand
            what is likely to happen next—and why.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <div style={{ width: '28px', height: '4px', backgroundColor: '#FF9933', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#138808', borderRadius: '2px' }} />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
            marginBottom: '3rem',
          }}
        >
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: `1.5px solid ${c.borderColor}`,
                  boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
                  padding: '2.5rem 2rem 5.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 20px 45px ${c.themeColor}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(15, 23, 42, 0.06)';
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: c.themeColor,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 20px ${c.themeColor}40`,
                    marginBottom: '1.25rem',
                  }}
                >
                  <Icon size={26} strokeWidth={2.4} />
                </div>

                <div
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: c.value === 'AI-Powered' ? '2.3rem' : '2.8rem',
                    fontWeight: 900,
                    color: c.themeColor,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    marginBottom: '0.4rem',
                  }}
                >
                  {c.value}
                </div>

                <div
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    marginBottom: '1rem',
                  }}
                >
                  {c.label}
                </div>

                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: c.badgeColor,
                    backgroundColor: c.badgeBg,
                    border: `1.5px solid ${c.badgeBorder}`,
                    padding: '0.3rem 0.85rem',
                    borderRadius: '20px',
                    letterSpacing: '0.02em',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {c.badge}
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
            padding: '1.35rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          {trustPillars.map((tp, i) => {
            const TIcon = tp.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  paddingRight: i < trustPillars.length - 1 ? '1rem' : 0,
                  borderRight: i < trustPillars.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: tp.bg,
                    color: tp.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TIcon size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                    {tp.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: '#64748B',
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {tp.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   8. HOW IT WORKS
===================================================== */
export const HowItWorks: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      step: '01',
      title: 'Collect',
      desc: 'Historical CUF and infrastructure project data streams.',
      icon: Database,
      tag: 'DATA STREAMS',
      themeColor: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      badgeBg: '#EFF6FF',
      badgeColor: '#2563EB',
      badgeBorder: '#BFDBFE',
    },
    {
      step: '02',
      title: 'Analyze',
      desc: 'AI/ML risk attribution models identify underlying patterns.',
      icon: Cpu,
      tag: 'AI/ML MODELS',
      themeColor: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      badgeBg: '#ECFDF5',
      badgeColor: '#059669',
      badgeBorder: '#A7F3D0',
    },
    {
      step: '03',
      title: 'Predict',
      desc: 'Forecast future cost variance and schedule slippage risks.',
      icon: TrendingUp,
      tag: 'FORECASTING',
      themeColor: '#7C3AED',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
      badgeBg: '#F5F3FF',
      badgeColor: '#7C3AED',
      badgeBorder: '#DDD6FE',
    },
    {
      step: '04',
      title: 'Act',
      desc: 'Deliver actionable early warnings for proactive policy intervention.',
      icon: AlertTriangle,
      tag: 'EARLY WARNINGS',
      themeColor: '#EA580C',
      bgColor: '#FFF7ED',
      borderColor: '#FFEDD5',
      badgeBg: '#FFF7ED',
      badgeColor: '#EA580C',
      badgeBorder: '#FFEDD5',
    },
  ];

  return (
    <section
      id="methodology"
      ref={sectionRef}
      style={{ padding: '4.5rem 2rem 5rem', backgroundColor: '#FFFFFF', position: 'relative' }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '30px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#1D4ED8',
              marginBottom: '1.1rem',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
            }}
          >
            <Landmark size={16} style={{ color: '#1D4ED8' }} />
            <span>PAIMANA METHODOLOGY</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            How <span style={{ color: '#EA580C' }}>PAIMANA</span>{' '}
            <span style={{ color: '#2563EB' }}>Operates</span>
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              marginBottom: '1.1rem',
            }}
          >
            <div style={{ width: '28px', height: '4px', backgroundColor: '#FF9933', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#138808', borderRadius: '2px' }} />
          </div>

          <p
            style={{
              color: '#64748B',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            A seamless four-step pipeline connecting raw infrastructure monitoring data to
            proactive policy intervention.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '52px',
              left: '10%',
              right: '10%',
              height: '4px',
              background:
                'linear-gradient(90deg, #2563EB 0%, #059669 33%, #7C3AED 66%, #EA580C 100%)',
              borderRadius: '4px',
              zIndex: 0,
              opacity: isVisible ? 0.7 : 0.2,
              transition: 'opacity 1s ease-in-out',
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {steps.map((st, i) => {
              const StepIcon = st.icon;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    border: `1.5px solid ${st.borderColor}`,
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                    padding: '2.25rem 1.6rem 2.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                    transitionDelay: `${i * 0.12}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = `0 20px 45px ${st.themeColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.06)';
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: st.themeColor,
                      color: '#FFFFFF',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 900,
                      fontSize: '1.3rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      boxShadow: `0 8px 24px ${st.themeColor}50`,
                      border: '4px solid #FFFFFF',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {st.step}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: st.bgColor,
                        color: st.themeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StepIcon size={18} strokeWidth={2.4} />
                    </div>
                    <h3
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 900,
                        color: '#0F172A',
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {st.title}
                    </h3>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        color: st.badgeColor,
                        backgroundColor: st.badgeBg,
                        border: `1px solid ${st.badgeBorder}`,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '20px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {st.tag}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      color: '#64748B',
                      fontWeight: 400,
                    }}
                  >
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   9. CAPABILITIES
===================================================== */
export const Capabilities: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const capabilities = [
    {
      icon: BarChart3,
      title: 'Composite Risk Scoring',
      desc: 'Unified risk score calculated across financial, physical, and administrative parameters.',
      tag: 'RISK INDEX',
      themeColor: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      tagBg: '#EFF6FF',
      tagColor: '#2563EB',
      tagBorder: '#BFDBFE',
    },
    {
      icon: DollarSign,
      title: 'Cost Escalation Analysis',
      desc: 'Detect early budget variances and project final cost overruns before financial commitments.',
      tag: 'BUDGET VARIANCE',
      themeColor: '#EA580C',
      bgColor: '#FFF7ED',
      borderColor: '#FFEDD5',
      tagBg: '#FFF7ED',
      tagColor: '#EA580C',
      tagBorder: '#FFEDD5',
    },
    {
      icon: Clock,
      title: 'Schedule Delay Prediction',
      desc: 'Forecast milestone slippages months in advance using historical completion velocity.',
      tag: 'TIMELINE FORECAST',
      themeColor: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      tagBg: '#FEF3C7',
      tagColor: '#D97706',
      tagBorder: '#FDE68A',
    },
    {
      icon: BrainCircuit,
      title: 'Explainable AI',
      desc: 'SHAP attribution models explain why a project is flagged as high risk down to root drivers.',
      tag: 'SHAP ATTRIBUTION',
      themeColor: '#7C3AED',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
      tagBg: '#F5F3FF',
      tagColor: '#7C3AED',
      tagBorder: '#DDD6FE',
    },
    {
      icon: Bot,
      title: 'AI Intelligence Assistant',
      desc: 'Natural language query interface over national infrastructure project databases.',
      tag: 'NLP QUERY',
      themeColor: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      tagBg: '#ECFDF5',
      tagColor: '#059669',
      tagBorder: '#A7F3D0',
    },
    {
      icon: LineChart,
      title: 'Statistical Benchmarking',
      desc: 'Compare project execution timelines against peer sector baselines and regional averages.',
      tag: 'PEER COMPARISON',
      themeColor: '#0D9488',
      bgColor: '#CCFBF1',
      borderColor: '#99F6E4',
      tagBg: '#CCFBF1',
      tagColor: '#0D9488',
      tagBorder: '#99F6E4',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      desc: 'Automated threshold notifications sent directly to monitoring officers and department heads.',
      tag: 'REAL-TIME',
      themeColor: '#E11D48',
      bgColor: '#FFE4E6',
      borderColor: '#FECDD3',
      tagBg: '#FFE4E6',
      tagColor: '#E11D48',
      tagBorder: '#FECDD3',
    },
    {
      icon: FileSpreadsheet,
      title: 'Executive Reporting',
      desc: 'One-click generation of audit-ready summary briefs for cabinet meetings and reviews.',
      tag: 'AUDIT READY',
      themeColor: '#4F46E5',
      bgColor: '#E0E7FF',
      borderColor: '#C7D2FE',
      tagBg: '#E0E7FF',
      tagColor: '#4F46E5',
      tagBorder: '#C7D2FE',
    },
  ];

  return (
    <section
      id="insights"
      ref={sectionRef}
      style={{ padding: '4.5rem 2rem 5rem', backgroundColor: '#FFFFFF', position: 'relative' }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '30px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#1D4ED8',
              marginBottom: '1.1rem',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
            }}
          >
            <Landmark size={16} style={{ color: '#1D4ED8' }} />
            <span>CORE CAPABILITIES</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            One Platform. <span style={{ color: '#EA580C' }}>Complete</span>{' '}
            <span style={{ color: '#059669' }}>Risk Intelligence.</span>
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              marginBottom: '1.1rem',
            }}
          >
            <div style={{ width: '28px', height: '4px', backgroundColor: '#FF9933', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#138808', borderRadius: '2px' }} />
          </div>

          <p
            style={{
              color: '#64748B',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Comprehensive AI-driven tools built specifically to solve infrastructure monitoring
            complexities.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: `1.5px solid ${cap.borderColor}`,
                  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
                  padding: '2rem 1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(35px)',
                  transitionDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 18px 40px ${cap.themeColor}1E`;
                  e.currentTarget.style.borderColor = cap.themeColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(15, 23, 42, 0.05)';
                  e.currentTarget.style.borderColor = cap.borderColor;
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.35rem',
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '16px',
                      backgroundColor: cap.themeColor,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 18px ${cap.themeColor}38`,
                    }}
                  >
                    <Icon size={24} strokeWidth={2.4} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      color: cap.tagColor,
                      backgroundColor: cap.tagBg,
                      border: `1.5px solid ${cap.tagBorder}`,
                      padding: '0.22rem 0.65rem',
                      borderRadius: '20px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {cap.tag}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    marginBottom: '0.65rem',
                    fontFamily: 'Outfit, sans-serif',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {cap.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#64748B',
                    fontWeight: 400,
                  }}
                >
                  {cap.desc}
                </p>

                <div
                  style={{
                    height: '3px',
                    width: '40px',
                    backgroundColor: cap.themeColor,
                    borderRadius: '2px',
                    marginTop: '1.35rem',
                    opacity: 0.8,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   10. AI ASSISTANT PREVIEW
===================================================== */
export const AIAssistantPreview: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPrompt, setSelectedPrompt] = useState(
    'Summarize the bottlenecks in the Transport sector.'
  );
  const [aiText, setAiText] = useState(
    'Transport projects show elevated risk primarily due to land acquisition delays, funding constraints and schedule slippage across multiple projects.'
  );

  const prompts = [
    {
      q: 'Summarize the bottlenecks in the Transport sector.',
      a: 'Transport projects show elevated risk primarily due to land acquisition delays, funding constraints and schedule slippage across multiple projects.',
    },
    {
      q: 'Which projects are at highest risk?',
      a: 'Currently, 5 mega transport and energy projects (including Delhi-Mumbai Expressway PIM-1042 and Polavaram Hydro Unit PIM-1003) exhibit critical risk scores >75%.',
    },
    {
      q: 'Why is this project high risk?',
      a: 'Project PIM-1042 is flagged high risk primarily due to a 32% SHAP attribution on land acquisition delays and a 24% shortfall in quarterly state equity release.',
    },
    {
      q: 'Which sectors have the highest cost escalation?',
      a: 'Railways and Urban Infrastructure show the highest relative cost escalation at +18.4% and +14.2% over initial sanctioned estimates.',
    },
  ];

  const handlePromptClick = (p: { q: string; a: string }) => {
    setSelectedPrompt(p.q);
    setAiText(p.a);
  };

  return (
    <section
      id="ai-assistant-preview"
      style={{ padding: '4.5rem 2rem 5rem', backgroundColor: '#FFFFFF', position: 'relative' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '30px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#1D4ED8',
              marginBottom: '1.1rem',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
            }}
          >
            <Landmark size={16} style={{ color: '#1D4ED8' }} />
            <span>PAIMANA INTELLIGENCE</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Ask Your <span style={{ color: '#2563EB' }}>Infrastructure Data</span>{' '}
            <span style={{ color: '#EA580C' }}>Anything.</span>
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              marginBottom: '1.1rem',
            }}
          >
            <div style={{ width: '28px', height: '4px', backgroundColor: '#FF9933', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#138808', borderRadius: '2px' }} />
          </div>

          <p
            style={{
              color: '#64748B',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Query thousands of project monitoring documents and real-time risk feeds in plain
            English.
          </p>
        </div>

        <div
          style={{
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 16px 45px rgba(15, 23, 42, 0.07)',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#0F172A',
              padding: '1.2rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #1E293B',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#EA580C',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
                }}
              >
                <Bot size={22} strokeWidth={2.5} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  PAIMANA AI Assistant
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94A3B8', fontWeight: 500 }}>
                  Infrastructure Policy Intelligence Model
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/ai-assistant')}
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: '12px',
                backgroundColor: '#EA580C',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C2410C')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EA580C')}
            >
              <span>Explore AI Intelligence</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div
            style={{
              padding: '2.25rem 2rem',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                alignSelf: 'flex-end',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '20px 20px 4px 20px',
                padding: '0.95rem 1.4rem',
                maxWidth: '82%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)',
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5 }}>
                {selectedPrompt}
              </span>
              <User size={18} style={{ color: '#EA580C', flexShrink: 0 }} />
            </div>

            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '20px 20px 20px 4px',
                padding: '1.4rem 1.6rem',
                maxWidth: '88%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#FFF7ED',
                  border: '1.5px solid #FFEDD5',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Bot size={20} strokeWidth={2.4} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: '#EA580C',
                    letterSpacing: '0.04em',
                  }}
                >
                  PAIMANA INSIGHT
                </div>
                <p
                  style={{
                    lineHeight: 1.65,
                    color: '#0F172A',
                    fontSize: '0.96rem',
                    fontWeight: 500,
                  }}
                >
                  {aiText}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  marginBottom: '0.75rem',
                }}
              >
                Try clicking a suggested query:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                {prompts.map((p, idx) => {
                  const isSelected = selectedPrompt === p.q;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(p)}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 800 : 600,
                        borderRadius: '20px',
                        border: isSelected ? '1.5px solid #EA580C' : '1.5px solid #E2E8F0',
                        backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                        color: isSelected ? '#EA580C' : '#475569',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 12px rgba(234, 88, 12, 0.15)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {p.q}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   11. ANALYTICS PREVIEW
===================================================== */
export const AnalyticsPreview: React.FC = () => {
  const sectorRiskData = [
    { sector: 'Transport', highRisk: 84, color: '#EF4444' },
    { sector: 'Railways', highRisk: 62, color: '#EF4444' },
    { sector: 'Water', highRisk: 45, color: '#F59A00' },
    { sector: 'Energy', highRisk: 38, color: '#F59A00' },
    { sector: 'Urban Dev', highRisk: 27, color: '#10B981' },
  ];

  const distributionData = [
    { name: 'High Risk', value: 256, color: '#EF4444' },
    { name: 'Medium Risk', value: 687, color: '#F59A00' },
    { name: 'Low Risk', value: 1038, color: '#10B981' },
  ];

  const costTrendData = [
    { year: '2021', escalation: 12.4 },
    { year: '2022', escalation: 18.2 },
    { year: '2023', escalation: 24.8 },
    { year: '2024', escalation: 32.1 },
    { year: '2025', escalation: 38.5 },
    { year: '2026', escalation: 42.78 },
  ];

  return (
    <section
      id="resources"
      style={{ padding: '4.5rem 2rem 5rem', backgroundColor: '#FFFFFF', position: 'relative' }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '30px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#1D4ED8',
              marginBottom: '1.1rem',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
            }}
          >
            <Landmark size={16} style={{ color: '#1D4ED8' }} />
            <span>ANALYTICS PREVIEW</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Macro <span style={{ color: '#2563EB' }}>Infrastructure Risk</span>{' '}
            <span style={{ color: '#059669' }}>Analytics</span>
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              marginBottom: '1.1rem',
            }}
          >
            <div style={{ width: '28px', height: '4px', backgroundColor: '#FF9933', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#2563EB', borderRadius: '2px' }} />
            <div style={{ width: '28px', height: '4px', backgroundColor: '#138808', borderRadius: '2px' }} />
          </div>

          <p
            style={{
              color: '#64748B',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Real-time aggregation across national infrastructure portfolios, financial variances,
            and sector vulnerability profiles.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {/* Sector Risk */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
              padding: '2.25rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BarChart2 size={20} strokeWidth={2.4} />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      color: '#0F172A',
                    }}
                  >
                    Risk by Sector
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                  }}
                >
                  5 SECTORS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {sectorRiskData.map((s, idx) => (
                  <div key={idx} style={{ fontSize: '0.88rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 800,
                        color: '#0F172A',
                        marginBottom: '6px',
                      }}
                    >
                      <span>{s.sector}</span>
                      <span style={{ color: s.color }}>{s.highRisk} High Risk</span>
                    </div>
                    <div
                      style={{
                        height: '9px',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '99px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${(s.highRisk / 90) * 100}%`,
                          height: '100%',
                          backgroundColor: s.color,
                          borderRadius: '99px',
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
              padding: '2.25rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PieIcon size={20} strokeWidth={2.4} />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      color: '#0F172A',
                    }}
                  >
                    Risk Distribution
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                  }}
                >
                  1,981 PROJECTS
                </span>
              </div>

              <div style={{ width: '100%', height: '190px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontSize: '12px',
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '0.88rem',
                fontWeight: 800,
                borderTop: '1.5px solid #F1F5F9',
                paddingTop: '1rem',
              }}
            >
              <div style={{ color: '#EF4444' }}>High: 256</div>
              <div style={{ color: '#F59A00' }}>Med: 687</div>
              <div style={{ color: '#10B981' }}>Low: 1,038</div>
            </div>
          </div>

          {/* Cost Escalation */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
              padding: '2.25rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: '#FFF7ED',
                      color: '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUp size={20} strokeWidth={2.4} />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      color: '#0F172A',
                    }}
                  >
                    Cost Escalation (₹ Cr)
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color: '#EA580C',
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                  }}
                >
                  +42.78 CR TOTAL
                </span>
              </div>

              <div style={{ width: '100%', height: '190px' }}>
                <ResponsiveContainer>
                  <RechartsLineChart data={costTrendData}>
                    <XAxis dataKey="year" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        fontSize: '12px',
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="escalation"
                      stroke="#EA580C"
                      strokeWidth={3.5}
                      dot={{ r: 4, fill: '#EA580C' }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   12. CTA SECTION
===================================================== */
export const CTASection: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <section
      id="contact"
      className="section-wrapper"
      style={{ padding: '4rem 2rem 5rem 2rem' }}
    >
      <div className="cta-banner" style={{ borderRadius: '28px', padding: '4.5rem 3rem' }}>
        <h2
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 4.2vw, 3.2rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: '1.25rem',
            letterSpacing: '-0.03em',
          }}
        >
          Ready to Move From
          <br />
          <span style={{ color: '#F59A00' }}>Monitoring to Prediction?</span>
        </h2>

        <p
          style={{
            fontSize: '1.12rem',
            color: '#E2E8F0',
            maxWidth: '700px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.75,
          }}
        >
          Give policymakers and project administrators the intelligence they need to identify risks
          early and intervene before they become costly.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => router.push('/workspace/login')}
            className="btn-primary"
            style={{
              padding: '0.95rem 2.4rem',
              fontSize: '1.02rem',
              borderRadius: '12px',
              backgroundColor: '#F59A00',
              color: '#FFFFFF',
              boxShadow: '0 6px 20px rgba(245, 154, 0, 0.4)',
            }}
          >
            <span>Enter Workspace</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="btn-secondary"
            style={{
              padding: '0.95rem 2.2rem',
              fontSize: '1.02rem',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <BarChart2 size={18} style={{ color: '#F59A00' }} />
            <span>Explore Intelligence</span>
          </button>
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   13. FOOTER
===================================================== */
export const Footer: React.FC = () => {
  return (
    <footer className="paimana-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <Logo theme="light" variant="full" size="large" />
            <p className="footer-brand-desc">
              Predictive intelligence for infrastructure development. Empowering policymakers and
              monitoring agencies across India with actionable early warnings.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links-list">
              <li>
                <Link href="/dashboard" className="footer-link-item">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/risk-intelligence" className="footer-link-item">
                  Risk Intelligence
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="footer-link-item">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="footer-link-item">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#insights" className="footer-link-item">
                  Insights
                </a>
              </li>
              <li>
                <Link href="/reports" className="footer-link-item">
                  Reports
                </Link>
              </li>
              <li>
                <a href="#documentation" className="footer-link-item">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#benchmarks" className="footer-link-item">
                  Benchmarking
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#about" className="footer-link-item">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="footer-link-item">
                  Contact
                </a>
              </li>
              <li>
                <a href="#privacy" className="footer-link-item">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="footer-link-item">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>
            © 2026 PAIMANA. All rights reserved. Built for National Infrastructure Intelligence.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#privacy" className="footer-link-item">
              Privacy
            </a>
            <a href="#terms" className="footer-link-item">
              Terms
            </a>
            <a href="#security" className="footer-link-item">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* =====================================================
   14. MAIN HOME / LANDING PAGE
===================================================== */
export const Home: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFF9EF',
        position: 'relative',
      }}
    >
      {/* Hero Header Area with Animated Infrastructure Background */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatedBackground />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Navbar />
          <Hero />
        </div>
      </div>

      {/* Solid Background Container for lower sections */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: '#FFF9EF',
        }}
      >
        <main>
          <TrustSection />
          <FeatureCards />
          <AboutSection />
          <HowItWorks />
          <Capabilities />
          <AIAssistantPreview />
          <AnalyticsPreview />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Home;