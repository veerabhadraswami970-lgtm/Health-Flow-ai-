import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { landingData } from '../../data/landingData';
import '../../styles/landing.css';
import {
  Heart, Shield, Sparkles, Activity, PhoneCall, ChevronRight, ChevronLeft,
  ArrowRight, Award, Stethoscope, Pill, Building2, User, CheckCircle2,
  Calendar, FileText, Lock, Users, AlertTriangle, X, Menu, ExternalLink, ArrowUp
} from 'lucide-react';

/**
 * Scroll Reveal Wrapper Component
 */
function Reveal({ children, width = "100%", delay = 0.1 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} style={{ width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 36 },
          visible: { opacity: 1, y: 0 }
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Animated Stat Counter Component
 */
function CountUpStat({ value, suffix, label, desc }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="hf-stat-card">
      <div className="hf-stat-value font-editorial-serif">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="hf-stat-label">{label}</div>
      <div className="hf-stat-desc">{desc}</div>
    </div>
  );
}

export default function HealthFlowLandingPage({
  onSelectRole,
  onOpenEmergencyModal,
  onNavigateTab,
  t = {}
}) {
  // Navigation & Scroll State
  const [scrolled, setScrolled] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero Rotating CTA Panels State
  const [activeHeroPanelIndex, setActiveHeroPanelIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // Service Tabs State
  const [activeServiceTabId, setActiveServiceTabId] = useState('patients');

  // Testimonial Carousel State
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // News Category State & Load More
  const [activeNewsCategory, setActiveNewsCategory] = useState("All Stories");
  const [visibleNewsCount, setVisibleNewsCount] = useState(3);
  const [loadingNews, setLoadingNews] = useState(false);

  // Help Modal State
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Handle Scroll Header state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate Hero CTA Panels every 5 seconds (pause on hover)
  useEffect(() => {
    if (isHeroPaused) return;
    const interval = setInterval(() => {
      setActiveHeroPanelIndex((prev) => (prev + 1) % landingData.hero.rotatingPanels.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHeroPaused]);

  // Handle Testimonial Carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % landingData.testimonialCarousel.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Escape Key listener for mobile menu & help modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setHelpModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when Help Modal is open
  useEffect(() => {
    if (helpModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [helpModalOpen]);

  const activeServiceGroup = landingData.serviceTabs.find(t => t.id === activeServiceTabId) || landingData.serviceTabs[0];

  const filteredNews = activeNewsCategory === "All Stories"
    ? landingData.newsStories
    : landingData.newsStories.filter(s => s.category === activeNewsCategory);

  const handleLoadMoreNews = () => {
    setLoadingNews(true);
    setTimeout(() => {
      setVisibleNewsCount(prev => prev + 3);
      setLoadingNews(false);
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCtaClick = (tabOrAction) => {
    if (tabOrAction === 'emergency') {
      if (onOpenEmergencyModal) onOpenEmergencyModal();
      else setHelpModalOpen(true);
    } else if (onNavigateTab) {
      onNavigateTab(tabOrAction);
    } else if (onSelectRole) {
      onSelectRole('Patient');
    }
  };

  return (
    <div className="hf-landing-root">
      
      {/* 0. ANNOUNCEMENT / UTILITY BAR */}
      {!announcementDismissed && (
        <div className="hf-announcement-bar">
          <div className="hf-landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="hf-announcement-badge">24/7 SUPPORT</span>
              <span>{landingData.announcement.text}</span>
            </div>
            <div className="hf-announcement-links" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {landingData.announcement.quickLinks.map((link, idx) => (
                <a key={idx} href={link.href} className="hf-announcement-link">
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => setAnnouncementDismissed(true)}
                className="hf-dismiss-btn"
                aria-label="Dismiss notice"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. STICKY HEADER & NAV */}
      <header className={`hf-header ${scrolled ? 'hf-header-scrolled' : ''}`}>
        <div className="hf-landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
          
          {/* Logo */}
          <a href="#hero" className="hf-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div className="hf-logo-icon">
              <Heart size={20} color="#ffffff" fill="#ffffff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="hf-logo-title font-editorial-serif">HealthFlow AI</span>
              <span className="hf-logo-sub">CARE WITHOUT BARRIERS</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hf-desktop-nav" aria-label="Main Navigation">
            <a href="#services" className="hf-nav-link">Services</a>
            <a href="#impact" className="hf-nav-link">Impact</a>
            <a href="#stories" className="hf-nav-link">Patient Stories</a>
            <a href="#careers" className="hf-nav-link">Careers</a>
            <a href="#news" className="hf-nav-link">News & AI</a>
          </nav>

          {/* Action Buttons */}
          <div className="hf-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setHelpModalOpen(true)}
              className="hf-btn hf-btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <PhoneCall size={16} color="var(--hf-coral)" />
              <span>Get Help Now</span>
            </button>
            
            <button
              onClick={() => onSelectRole && onSelectRole('Patient')}
              className="hf-btn hf-btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.88rem' }}
            >
              <span>Portal Sign In</span>
              <ArrowRight size={16} />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="hf-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="hf-mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="hf-landing-container" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <a href="#services" onClick={() => setMobileMenuOpen(false)} className="hf-mobile-link">Services</a>
                  <a href="#impact" onClick={() => setMobileMenuOpen(false)} className="hf-mobile-link">Impact & Stats</a>
                  <a href="#stories" onClick={() => setMobileMenuOpen(false)} className="hf-mobile-link">Patient Stories</a>
                  <a href="#careers" onClick={() => setMobileMenuOpen(false)} className="hf-mobile-link">Careers</a>
                  <a href="#news" onClick={() => setMobileMenuOpen(false)} className="hf-mobile-link">News & AI</a>
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(22, 32, 36, 0.1)', margin: '12px 0' }} />
                  <button
                    onClick={() => { setMobileMenuOpen(false); setHelpModalOpen(true); }}
                    className="hf-btn hf-btn-coral"
                    style={{ width: '100%' }}
                  >
                    <PhoneCall size={18} />
                    <span>Get Help Now</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onSelectRole && onSelectRole('Patient'); }}
                    className="hf-btn hf-btn-primary"
                    style={{ width: '100%' }}
                  >
                    <span>Sign In to App</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero" className="hf-hero-section">
        <div className="hf-landing-container">
          <div className="hf-hero-grid">
            
            {/* Hero Main Content */}
            <div className="hf-hero-text-block">
              <Reveal delay={0.1}>
                <span className="hf-badge hf-badge-teal mb-4">
                  <Sparkles size={14} />
                  <span>{landingData.hero.eyebrow}</span>
                </span>
              </Reveal>

              <Reveal delay={0.2}>
                <h1 className="hf-hero-headline font-editorial-serif">
                  {landingData.hero.titleWords.map((word, i) => (
                    <span key={i} style={{ display: 'inline-block', marginRight: '0.28em' }}>{word}</span>
                  ))}{' '}
                  <span className="text-gradient-teal">{landingData.hero.titleHighlight}</span>
                </h1>
              </Reveal>

              <Reveal delay={0.3}>
                <p className="hf-hero-subtitle">
                  {landingData.hero.subtitle}
                </p>
              </Reveal>

              <Reveal delay={0.4}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '24px' }}>
                  <button onClick={() => onSelectRole && onSelectRole('Patient')} className="hf-btn hf-btn-primary">
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                  </button>
                  <button onClick={() => setHelpModalOpen(true)} className="hf-btn hf-btn-secondary">
                    <Shield size={18} color="var(--hf-teal)" />
                    <span>Emergency SOS</span>
                  </button>
                </div>
              </Reveal>
            </div>

            {/* Hero 3 Rotating CTA Panels */}
            <div
              className="hf-hero-panels-wrapper"
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
            >
              <div className="hf-panels-header">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--hf-ink-muted)' }}>
                  QUICK CARE PATHWAYS ({activeHeroPanelIndex + 1}/3)
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setActiveHeroPanelIndex((prev) => (prev === 0 ? 2 : prev - 1))}
                    className="hf-carousel-btn"
                    aria-label="Previous panel"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveHeroPanelIndex((prev) => (prev + 1) % 3)}
                    className="hf-carousel-btn"
                    aria-label="Next panel"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Panel Content Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHeroPanelIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className={`hf-hero-panel-card hf-hero-panel-${landingData.hero.rotatingPanels[activeHeroPanelIndex].accent}`}
                >
                  <span className={`hf-badge hf-badge-${landingData.hero.rotatingPanels[activeHeroPanelIndex].accent}`}>
                    {landingData.hero.rotatingPanels[activeHeroPanelIndex].badge}
                  </span>
                  <h3 className="font-editorial-serif" style={{ fontSize: '1.45rem', margin: '14px 0 10px 0' }}>
                    {landingData.hero.rotatingPanels[activeHeroPanelIndex].title}
                  </h3>
                  <p style={{ fontSize: '0.94rem', color: 'var(--hf-ink-muted)', marginBottom: '20px' }}>
                    {landingData.hero.rotatingPanels[activeHeroPanelIndex].desc}
                  </p>
                  <button
                    onClick={() => handleCtaClick(landingData.hero.rotatingPanels[activeHeroPanelIndex].ctaTab)}
                    className={`hf-btn hf-btn-${landingData.hero.rotatingPanels[activeHeroPanelIndex].accent === 'danger' ? 'danger' : landingData.hero.rotatingPanels[activeHeroPanelIndex].accent === 'coral' ? 'coral' : 'primary'}`}
                    style={{ width: '100%' }}
                  >
                    <span>{landingData.hero.rotatingPanels[activeHeroPanelIndex].ctaText}</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              </AnimatePresence>

              {/* Panel Rotation Dots */}
              <div className="hf-panel-dots">
                {landingData.hero.rotatingPanels.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveHeroPanelIndex(i)}
                    className={`hf-dot ${activeHeroPanelIndex === i ? 'active' : ''}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MISSION STATEMENT SECTION */}
      <section className="hf-section hf-mission-section">
        <div className="hf-landing-container">
          <Reveal>
            <div className="hf-mission-card">
              <span className="hf-badge hf-badge-gold mb-3">OUR CORE MISSION</span>
              <blockquote className="hf-mission-quote font-editorial-serif">
                {landingData.mission.quote}
              </blockquote>
              <div className="hf-mission-attribution">
                <strong>{landingData.mission.author}</strong>
                <span>— {landingData.mission.title}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. SPOTLIGHT ON IMPACT INTRO BAND */}
      <section id="impact" className="hf-section">
        <div className="hf-landing-container">
          <div className="hf-spotlight-grid">
            <Reveal>
              <div className="hf-spotlight-content">
                <span className="hf-badge hf-badge-teal mb-3">{landingData.spotlight.eyebrow}</span>
                <h2 className="font-editorial-serif" style={{ fontSize: '2.4rem', margin: '12px 0 16px 0' }}>
                  {landingData.spotlight.title}
                </h2>
                <p style={{ fontSize: '1.05rem', color: 'var(--hf-ink-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
                  {landingData.spotlight.desc}
                </p>
                <a href="#stats" className="hf-spotlight-link">
                  <span>{landingData.spotlight.linkText}</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="hf-spotlight-image-wrapper">
                <img
                  src={landingData.spotlight.image}
                  alt={landingData.spotlight.imageAlt}
                  loading="lazy"
                  className="hf-spotlight-img"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. YOUR IMPACT IN ACTION — ANIMATED STATS */}
      <section id="stats" className="hf-section hf-stats-section">
        <div className="hf-landing-container">
          <div className="hf-section-header">
            <span className="hf-badge hf-badge-coral">MEASURABLE OUTCOMES</span>
            <h2>Your Impact in Action</h2>
            <p>Empowering millions through verifiable, high-speed medical assistance across India.</p>
          </div>

          <div className="hf-stats-grid">
            {landingData.stats.map((stat, idx) => (
              <CountUpStat
                key={idx}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                desc={stat.desc}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '48px' }}>
            <button onClick={() => onSelectRole && onSelectRole('Patient')} className="hf-btn hf-btn-primary">
              <span>View ABDM Compliance Report</span>
              <ExternalLink size={16} />
            </button>
            <button onClick={() => setHelpModalOpen(true)} className="hf-btn hf-btn-secondary">
              <span>Support Our Mission</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. FEATURED TESTIMONIAL */}
      <section className="hf-section">
        <div className="hf-landing-container">
          <Reveal>
            <div className="hf-featured-testimonial-card">
              <div className="hf-testimonial-img-box">
                <img
                  src={landingData.featuredTestimonial.image}
                  alt={landingData.featuredTestimonial.imageAlt}
                  loading="lazy"
                  className="hf-testimonial-img"
                />
              </div>
              <div className="hf-testimonial-content">
                <div className="hf-quote-icon">“</div>
                <blockquote className="hf-testimonial-quote font-editorial-serif">
                  {landingData.featuredTestimonial.quote}
                </blockquote>
                <div className="hf-testimonial-meta">
                  <strong>{landingData.featuredTestimonial.author}</strong>
                  <span>{landingData.featuredTestimonial.role} • {landingData.featuredTestimonial.location}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. CRISIS / SAFETY BAND */}
      <section id="crisis" className="hf-section hf-crisis-section">
        <div className="hf-landing-container">
          <div className="hf-crisis-card">
            <div style={{ maxWidth: '800px', margin: '0 auto', textStyle: 'center' }}>
              <span className="hf-badge hf-badge-danger mb-3">
                <AlertTriangle size={14} />
                <span>{landingData.crisis.badge}</span>
              </span>
              <h2 className="font-editorial-serif" style={{ fontSize: '2.25rem', color: '#ffffff', margin: '16px 0' }}>
                {landingData.crisis.title}
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '28px' }}>
                {landingData.crisis.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (onOpenEmergencyModal) onOpenEmergencyModal();
                    else setHelpModalOpen(true);
                  }}
                  className="hf-btn hf-btn-danger"
                  style={{ padding: '14px 32px' }}
                >
                  <PhoneCall size={18} />
                  <span>{landingData.crisis.primaryCta}</span>
                </button>
                <a
                  href="tel:112"
                  className="hf-btn hf-btn-secondary"
                  style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  <span>{landingData.crisis.secondaryCta}</span>
                </a>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '20px' }}>
                {landingData.crisis.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SERVICES — LIFE-STAGE & ROLE TABS */}
      <section id="services" className="hf-section">
        <div className="hf-landing-container">
          <div className="hf-section-header">
            <span className="hf-badge hf-badge-teal">CONNECTED HEALTHCARE SERVICES</span>
            <h2>Support for Every User Persona</h2>
            <p>Explore customized features engineered for patients, doctors, pharmacists, and hospitals.</p>
          </div>

          {/* Accessible Tab Navigation */}
          <div className="hf-tabs-wrapper" role="tablist" aria-label="Healthcare Services by Role">
            {landingData.serviceTabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeServiceTabId === tab.id}
                onClick={() => setActiveServiceTabId(tab.id)}
                className={`hf-tab-btn ${activeServiceTabId === tab.id ? 'active' : ''}`}
              >
                {tab.id === 'patients' && <User size={16} />}
                {tab.id === 'doctors' && <Stethoscope size={16} />}
                {tab.id === 'pharmacists' && <Pill size={16} />}
                {tab.id === 'hospitals' && <Building2 size={16} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Panel Content Grid */}
          <div className="hf-services-grid" role="tabpanel">
            <AnimatePresence mode="wait">
              {activeServiceGroup.services.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="hf-service-card"
                >
                  <div className="hf-service-img-box">
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      loading="lazy"
                      className="hf-service-img"
                    />
                    <span className="hf-service-badge">{service.badge}</span>
                  </div>
                  <div className="hf-service-body">
                    <h3 className="font-editorial-serif" style={{ fontSize: '1.35rem', marginBottom: '10px' }}>
                      {service.title}
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--hf-ink-muted)', marginBottom: '18px' }}>
                      {service.desc}
                    </p>
                    <button
                      onClick={() => onSelectRole && onSelectRole(activeServiceTabId === 'doctors' ? 'Doctor' : activeServiceTabId === 'pharmacists' ? 'Pharmacist' : activeServiceTabId === 'hospitals' ? 'HospitalAdmin' : 'Patient')}
                      className="hf-service-link"
                    >
                      <span>Explore Capability</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 9. CAREERS BAND */}
      <section id="careers" className="hf-section hf-careers-section">
        <div className="hf-landing-container">
          <div className="hf-careers-card">
            <div className="hf-careers-grid">
              <div>
                <span className="hf-badge hf-badge-gold mb-3">{landingData.careers.eyebrow}</span>
                <h2 className="font-editorial-serif" style={{ fontSize: '2.2rem', margin: '12px 0 16px 0' }}>
                  {landingData.careers.title}
                </h2>
                <p style={{ fontSize: '1.02rem', color: 'var(--hf-ink-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {landingData.careers.desc}
                </p>
                <button onClick={() => onSelectRole && onSelectRole('Patient')} className="hf-btn hf-btn-primary">
                  <span>{landingData.careers.ctaText}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="hf-careers-img-box">
                <img
                  src={landingData.careers.image}
                  alt={landingData.careers.imageAlt}
                  loading="lazy"
                  className="hf-careers-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIAL CAROUSEL */}
      <section id="stories" className="hf-section">
        <div className="hf-landing-container">
          <div className="hf-section-header">
            <span className="hf-badge hf-badge-coral">COMMUNITY VOICES</span>
            <h2>Together, We Break Barriers</h2>
            <p>Read inspiring experiences from clinicians, pharmacists, and family caregivers.</p>
          </div>

          <div className="hf-carousel-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
              >
                <div style={{ fontSize: '3rem', color: 'var(--hf-coral)', fontFamily: 'serif', lineHeight: 1 }}>“</div>
                <p className="font-editorial-serif" style={{ fontSize: '1.5rem', lineHeight: 1.5, color: 'var(--hf-ink)', marginBottom: '24px' }}>
                  {landingData.testimonialCarousel[testimonialIndex].quote}
                </p>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--hf-teal)' }}>
                  {landingData.testimonialCarousel[testimonialIndex].author}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--hf-ink-muted)' }}>
                  {landingData.testimonialCarousel[testimonialIndex].role} • {landingData.testimonialCarousel[testimonialIndex].location}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button
                onClick={() => setTestimonialIndex((prev) => (prev === 0 ? landingData.testimonialCarousel.length - 1 : prev - 1))}
                className="hf-carousel-btn"
                aria-label="Previous story"
              >
                <ChevronLeft size={18} />
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {landingData.testimonialCarousel.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`hf-dot ${testimonialIndex === i ? 'active' : ''}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setTestimonialIndex((prev) => (prev + 1) % landingData.testimonialCarousel.length)}
                className="hf-carousel-btn"
                aria-label="Next story"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. NEWS & STORIES CAROUSEL WITH CATEGORY TABS */}
      <section id="news" className="hf-section hf-news-section">
        <div className="hf-landing-container">
          <div className="hf-section-header">
            <span className="hf-badge hf-badge-teal">NEWS & INSIGHTS</span>
            <h2>Latest Healthcare Innovations</h2>
            <p>Stay informed on medical AI, Ayushman Bharat updates, and digital health policy.</p>
          </div>

          {/* Category Tabs */}
          <div className="hf-news-categories" style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}>
            {landingData.newsCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveNewsCategory(cat); setVisibleNewsCount(3); }}
                className={`hf-category-btn ${activeNewsCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News Card Grid */}
          <div className="hf-news-grid">
            {filteredNews.slice(0, visibleNewsCount).map((story) => (
              <div key={story.id} className="hf-news-card">
                <div className="hf-news-img-box">
                  <img
                    src={story.image}
                    alt={story.imageAlt}
                    loading="lazy"
                    className="hf-news-img"
                  />
                  <span className="hf-news-category-tag">{story.category}</span>
                </div>
                <div className="hf-news-body">
                  <div style={{ fontSize: '0.8rem', color: 'var(--hf-ink-light)', marginBottom: '8px' }}>
                    {story.date} • {story.readTime}
                  </div>
                  <h3 className="font-editorial-serif" style={{ fontSize: '1.2rem', marginBottom: '10px', lineHeight: 1.4 }}>
                    {story.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--hf-ink-muted)', marginBottom: '16px' }}>
                    {story.desc}
                  </p>
                  <a href="#hero" className="hf-news-read-link">
                    <span>Read Article</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleNewsCount < filteredNews.length && (
            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <button
                onClick={handleLoadMoreNews}
                disabled={loadingNews}
                className="hf-btn hf-btn-secondary"
              >
                {loadingNews ? (
                  <span>Loading Stories...</span>
                ) : (
                  <>
                    <span>Load More Stories</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 12. CONNECT WITH US CTA BAND */}
      <section className="hf-section hf-cta-band-section">
        <div className="hf-landing-container">
          <div className="hf-cta-band-card">
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <span className="hf-badge hf-badge-gold mb-3">GET STARTED TODAY</span>
              <h2 className="font-editorial-serif" style={{ fontSize: '2.5rem', color: '#ffffff', margin: '16px 0' }}>
                {landingData.connectCta.title}
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem', marginBottom: '32px' }}>
                {landingData.connectCta.subtitle}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onSelectRole && onSelectRole('Patient')}
                  className="hf-btn hf-btn-coral"
                  style={{ padding: '14px 32px' }}
                >
                  <span>{landingData.connectCta.primaryBtn}</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setHelpModalOpen(true)}
                  className="hf-btn hf-btn-secondary"
                  style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  <span>{landingData.connectCta.secondaryBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. MULTI-COLUMN FOOTER */}
      <footer className="hf-footer">
        <div className="hf-landing-container">
          <div className="hf-footer-grid">
            
            {/* Column 1: Brand & Mission */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div className="hf-logo-icon">
                  <Heart size={20} color="#ffffff" fill="#ffffff" />
                </div>
                <span className="hf-logo-title font-editorial-serif" style={{ color: '#ffffff', fontSize: '1.4rem' }}>
                  HealthFlow AI
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, maxWidth: '360px', marginBottom: '20px' }}>
                {landingData.footer.about}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                ABDM Gateway Compliant • CDSCO Shielded Architecture
              </div>
            </div>

            {/* Column 2: Sections */}
            <div>
              <h4 className="hf-footer-col-title">{landingData.footer.col1Title}</h4>
              <ul className="hf-footer-links">
                {landingData.footer.col1Links.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="hf-footer-link">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Role Portals */}
            <div>
              <h4 className="hf-footer-col-title">{landingData.footer.col2Title}</h4>
              <ul className="hf-footer-links">
                {landingData.footer.col2Links.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => onSelectRole && onSelectRole(item.role)}
                      className="hf-footer-btn-link"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Support */}
            <div>
              <h4 className="hf-footer-col-title">{landingData.footer.col3Title}</h4>
              <ul className="hf-footer-links">
                {landingData.footer.col3Links.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href || '#'} className="hf-footer-link">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.12)', margin: '40px 0 24px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            <div>{landingData.footer.copyright}</div>
            <div style={{ maxWidth: '500px', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              {landingData.footer.emergencyNotice}
            </div>
            <button onClick={scrollToTop} className="hf-back-to-top-btn">
              <span>Back to top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </footer>

      {/* 14. GET HELP NOW / EMERGENCY ACCESS MODAL */}
      <AnimatePresence>
        {helpModalOpen && (
          <div className="hf-modal-backdrop" onClick={() => setHelpModalOpen(false)}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-modal-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="hf-help-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="hf-modal-icon-badge">
                    <PhoneCall size={20} color="var(--hf-coral)" />
                  </div>
                  <h3 id="help-modal-title" className="font-editorial-serif" style={{ fontSize: '1.4rem', margin: 0 }}>
                    Emergency & Assistance Directory
                  </h3>
                </div>
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="hf-dismiss-btn"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--hf-ink-muted)', marginBottom: '24px' }}>
                Select an immediate care pathway below. Verified national dispatch services and HealthFlow AI Emergency SOS are available 24/7.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <a
                  href="tel:108"
                  className="hf-help-option-card"
                  style={{ borderColor: 'var(--hf-danger-border)', background: 'var(--hf-danger-bg)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <AlertTriangle size={24} color="var(--hf-danger-red)" />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--hf-danger-red)', fontSize: '1.05rem' }}>
                        108 / 112 National Ambulance & Police
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--hf-ink-muted)' }}>
                        Immediate life-threatening emergencies, trauma, and accidents
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--hf-danger-red)" />
                </a>

                <button
                  onClick={() => {
                    setHelpModalOpen(false);
                    if (onOpenEmergencyModal) onOpenEmergencyModal();
                    else if (onSelectRole) onSelectRole('Patient');
                  }}
                  className="hf-help-option-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Shield size={24} color="var(--hf-teal)" />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--hf-ink)', fontSize: '1.05rem' }}>
                        HealthFlow AI Emergency SOS
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--hf-ink-muted)' }}>
                        Live blood bank search, nearby hospital routing, and contact pings
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--hf-teal)" />
                </button>

                <button
                  onClick={() => {
                    setHelpModalOpen(false);
                    if (onSelectRole) onSelectRole('Patient');
                  }}
                  className="hf-help-option-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Stethoscope size={24} color="var(--hf-sage)" />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--hf-ink)', fontSize: '1.05rem' }}>
                        OPD Doctor Consultation & Prescriptions
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--hf-ink-muted)' }}>
                        Find top empaneled doctors and upload prescriptions
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--hf-sage)" />
                </button>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="hf-btn hf-btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
