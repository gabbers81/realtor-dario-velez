import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactModal } from "@/components/contact-modal";
import { CalendlyModal } from "@/components/calendly-modal";
import { AnimatedButton } from "@/components/animated-button";
import { BlurImage } from "@/components/blur-image";
import { Home, Calendar, ArrowRight, Check, Shield, CheckCircle, Phone, Mail, MapPin, Scale, FileText, Star, Quote } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/language-switcher";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { SEOHead } from "@/components/seo-head";
import { generatePropertySchema } from "@/lib/property-schema";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { PageTransition } from "@/components/page-transition";
import { 
  fadeIn, fadeInUp, fadeInDown, scaleIn, 
  staggerContainer, staggerItem, 
  heroTitle, heroSubtitle, 
  cardHover, float, gradientAnimation 
} from "@/lib/animations";
import type { Project } from "@/lib/types";

import WhatsApp_Image_2025_06_25_at_19_11_55 from "@assets/WhatsApp Image 2025-06-25 at 19.11.55.jpeg";
import DarioVelezLogo from "@assets/DarioRealtorLogo_cropped_1750974653123.png";

// Counter animation component
function CounterAnimation({ end, suffix = "", className }: { end: number; suffix?: string; className?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div ref={ref} className={className}>
      {count}{suffix}
    </div>
  );
}

// About Section Component
function AboutSection() {
  const { t } = useTranslation(['home']);
  const sectionRef = useRef(null);
  const controls = useScrollAnimation(sectionRef);

  const features = [
    {
      icon: CheckCircle,
      color: "caribbean",
      title: "Especializado",
      description: "Asesor inmobiliario, miembro de AEI, especializado en propiedades turísticas de República Dominicana"
    },
    {
      icon: Shield,
      color: "turquoise",
      title: "Experiencia",
      description: "Más de 15+ transacciones exitosas en la zona turística de Punta Cana, Bávaro, Bayahibe, Las Terrenas y Santo Domingo"
    },
    {
      icon: MapPin,
      color: "sage",
      title: "Internacional",
      description: "Atendiendo clientes de Estados Unidos, Canadá, Europa y Latinoamérica"
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate={controls}
        variants={staggerContainer}
      >
        <motion.div className="text-center mb-16" variants={fadeIn}>
          <h2 className="font-bold text-4xl text-gray-900 mb-4">{t('home:about.title')}</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            {t('home:about.experience')}
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={cardHover}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6">
                    <motion.div 
                      className={`w-16 h-16 bg-${feature.color}/10 rounded-full flex items-center justify-center mx-auto mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className={`text-${feature.color} text-2xl`} size={32} />
                    </motion.div>
                    <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

// Projects Section Component
function ProjectsSection({ projects, isLoading, navigateToProject, getTranslatedProject }: any) {
  const { t } = useTranslation(['home', 'projects', 'actions']);
  const sectionRef = useRef(null);
  const controls = useScrollAnimation(sectionRef);

  return (
    <section ref={sectionRef} id="proyectos" className="py-20 bg-gray-50">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate={controls}
        variants={staggerContainer}
      >
        <motion.div className="text-center mb-16" variants={fadeIn}>
          <h2 className="font-bold text-4xl text-gray-900 mb-4">{t('home:projects.title')}</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            {t('home:projects.subtitle')}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="overflow-hidden"
              >
                <Card className="overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            variants={staggerContainer}
          >
            {(projects as Project[])?.sort((a, b) => a.title.localeCompare(b.title)).map((project: Project) => {
              const translatedProject = getTranslatedProject(project);
              return (
                <motion.div
                  key={project.id}
                  variants={staggerItem}
                  whileHover={cardHover}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="overflow-hidden hover:shadow-xl active:shadow-lg transition-all duration-300 cursor-pointer h-full"
                    onClick={() => navigateToProject(project)}
                  >
                    <div className="overflow-hidden relative">
                      <BlurImage
                        src={project.imageUrl} 
                        alt={translatedProject.title}
                        className="w-full h-48 sm:h-52 object-cover"
                      />
                      <motion.div 
                        className="absolute inset-0 bg-black bg-opacity-0 group-active:bg-opacity-10 transition-all duration-200 sm:hidden"
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                      />
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-semibold text-lg sm:text-xl mb-2 leading-tight">{translatedProject.title}</h3>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">{translatedProject.description}</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                        <span className="text-caribbean font-bold text-lg sm:text-xl">
                          {translatedProject.price}
                        </span>
                        <motion.button 
                          className="text-turquoise hover:text-caribbean active:text-caribbean/80 font-medium flex items-center justify-center sm:justify-start h-10 sm:h-auto transition-colors duration-200"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {t('actions:view_details')} 
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="ml-1" size={16} />
                          </motion.span>
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  const { t, i18n } = useTranslation(['common', 'home', 'contact', 'projects', 'legal', 'testimonials']);
  const [, setLocation] = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Hero Parallax Scroll
  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroBgElement1Y = useTransform(heroScrollYProgress, [0, 1], ["0%", "30%"]);
  const heroBgElement2Y = useTransform(heroScrollYProgress, [0, 1], ["0%", "50%"]);
  const heroImageY = useTransform(heroScrollYProgress, [0, 1], ["0%", "-10%"]);
  const heroContentY = useTransform(heroScrollYProgress, [0, 1], ["0%", "5%"]);


  // Enable smooth scrolling
  useSmoothScroll();

  // Get testimonials with fallback
  const getTestimonials = () => {
    try {
      const testimonials = t('testimonials:testimonials', { returnObjects: true });
      return Array.isArray(testimonials) ? testimonials : [];
    } catch (error) {
      console.error('Error loading testimonials:', error);
      return [];
    }
  };

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const navigateToProject = (project: Project) => {
    setLocation(`/proyecto/${project.slug}`);
  };

  // Function to get translated project content
  const getTranslatedProject = (project: Project) => {
    // Convert slug to the format used in translation files (replace hyphens with underscores)
    const translationKey = project.slug.replace(/-/g, '_');
    
    const translatedTitle = t(`projects:properties.${translationKey}.title`, { defaultValue: project.title });
    const translatedDescription = t(`projects:properties.${translationKey}.description`, { defaultValue: project.description });
    const translatedLocation = t(`projects:properties.${translationKey}.location`, { defaultValue: project.location });
    const translatedPrice = t(`projects:properties.${translationKey}.price`, { defaultValue: project.price });
    
    return {
      ...project,
      title: translatedTitle,
      description: translatedDescription,
      location: translatedLocation,
      price: translatedPrice
    };
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <SEOHead 
          title={t('home:seo.title', 'Dario Velez - Propiedades Exclusivas en República Dominicana')}
          description={t('common:seo.description')}
        />
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button onClick={() => scrollToSection('inicio')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
                <img 
                  src={DarioVelezLogo} 
                  alt="Dario Velez Real Estate Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h1 className="font-semibold text-gray-900 text-lg text-left">Dario Velez</h1>
                <p className="text-sm text-gray-600 text-left">{t('tagline')}</p>
              </div>
            </button>
            
            <nav className="hidden md:flex items-center space-x-6">
              <motion.button
                onClick={() => scrollToSection('inicio')}
                className="text-gray-700 hover:text-caribbean font-medium transition-colors"
                whileHover={{ y: -2 }}
              >
                {t('navigation.home')}
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('proyectos')}
                className="text-gray-700 hover:text-caribbean font-medium transition-colors"
                whileHover={{ y: -2 }}
              >
                {t('navigation.projects')}
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-caribbean font-medium transition-colors"
                whileHover={{ y: -2 }}
              >
                {t('navigation.testimonials')}
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('info-legal')}
                className="text-gray-700 hover:text-caribbean font-medium transition-colors"
                whileHover={{ y: -2 }}
              >
                {t('navigation.legal')}
              </motion.button>
              <LanguageSwitcher />
              <CookieSettingsButton variant="navigation" />
              <Button 
                onClick={() => setIsContactModalOpen(true)}
                className="bg-caribbean text-white hover:bg-caribbean/90"
              >
                {t('navigation.contact')}
              </Button>
            </nav>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <div className="relative w-6 h-6">
                <div className={`absolute transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}>
                  <FaBars size={20} className={isMobileMenuOpen ? 'opacity-0' : 'opacity-100'} />
                </div>
                <div className={`absolute transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 rotate-45'}`}>
                  <FaTimes size={20} />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden bg-white border-t overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-3 space-y-1">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="block w-full text-left text-gray-700 hover:text-caribbean hover:bg-gray-50 font-medium py-3 px-3 rounded-lg transition-all duration-200 touch-manipulation"
            >
              <div className="flex items-center">
                <Home className="mr-3" size={18} />
                {t('navigation.home')}
              </div>
            </button>
            <button 
              onClick={() => scrollToSection('proyectos')}
              className="block w-full text-left text-gray-700 hover:text-caribbean hover:bg-gray-50 font-medium py-3 px-3 rounded-lg transition-all duration-200 touch-manipulation"
            >
              <div className="flex items-center">
                <ArrowRight className="mr-3" size={18} />
                {t('navigation.projects')}
              </div>
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="block w-full text-left text-gray-700 hover:text-caribbean hover:bg-gray-50 font-medium py-3 px-3 rounded-lg transition-all duration-200 touch-manipulation"
            >
              <div className="flex items-center">
                <Star className="mr-3" size={18} />
                {t('navigation.testimonials')}
              </div>
            </button>
            <button 
              onClick={() => scrollToSection('info-legal')}
              className="block w-full text-left text-gray-700 hover:text-caribbean hover:bg-gray-50 font-medium py-3 px-3 rounded-lg transition-all duration-200 touch-manipulation"
            >
              <div className="flex items-center">
                <Scale className="mr-3" size={18} />
                {t('navigation.legal')}
              </div>
            </button>
            <div className="py-2 px-3 flex items-center space-x-2">
              <LanguageSwitcher />
              <CookieSettingsButton variant="navigation" />
            </div>
            <div className="px-3 pt-2">
              <Button 
                onClick={() => {
                  setIsContactModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-caribbean text-white hover:bg-caribbean/90 h-12 text-base touch-manipulation"
              >
                {t('navigation.contact')}
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        id="inicio" 
        className="relative bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 min-h-screen flex items-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Background decorative elements */}
        <motion.div 
          className="absolute top-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-60 blur-2xl"
          animate={float}
          style={{ y: heroBgElement1Y }}
        />
        <motion.div 
          className="absolute bottom-32 left-20 w-48 h-48 bg-turquoise/20 rounded-full opacity-60 blur-3xl"
          animate={float}
          transition={{ delay: 1, duration: 8 }}
          style={{ y: heroBgElement2Y }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div className="space-y-8" style={{ y: heroContentY }}>
              <div>
                <motion.p 
                  className="text-turquoise font-medium text-lg mb-4"
                  variants={fadeInDown}
                >
                  {t('home:hero.specialist_title')}
                </motion.p>
                <motion.h1 
                  className="font-bold text-5xl lg:text-6xl text-gray-900 leading-tight"
                  variants={heroTitle}
                >
                  {t('home:hero.title')}
                </motion.h1>
              </div>
              
              <motion.p 
                className="text-gray-600 text-lg leading-relaxed max-w-lg"
                variants={heroSubtitle}
              >
                {t('home:hero.description')}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
              >
                <AnimatedButton
                  onClick={() => setIsContactModalOpen(true)}
                  variant="primary"
                  size="lg"
                  icon={<Calendar size={20} />}
                  iconPosition="left"
                  className="shadow-lg hover:shadow-xl"
                >
                  {t('buttons.schedule_appointment')}
                </AnimatedButton>
                <AnimatedButton
                  variant="secondary"
                  size="lg"
                  onClick={() => scrollToSection('proyectos')}
                  icon={<ArrowRight size={20} />}
                >
                  {t('home:hero.cta')}
                </AnimatedButton>
              </motion.div>

              {/* Statistics */}
              <motion.div 
                className="grid grid-cols-3 gap-8 pt-8"
                variants={staggerContainer}
              >
                <motion.div className="text-center" variants={staggerItem}>
                  <CounterAnimation end={5} suffix="+" className="text-3xl font-bold text-caribbean" />
                  <div className="text-gray-600 text-sm">Años de Experiencia</div>
                </motion.div>
                <motion.div className="text-center" variants={staggerItem}>
                  <CounterAnimation end={5} suffix="+" className="text-3xl font-bold text-sage" />
                  <div className="text-gray-600 text-sm">Proyectos Completados</div>
                </motion.div>
                <motion.div className="text-center" variants={staggerItem}>
                  <CounterAnimation end={15} suffix="+" className="text-3xl font-bold text-yellow-500" />
                  <div className="text-gray-600 text-sm">Clientes Satisfechos</div>
                </motion.div>
              </motion.div>
            </motion.div> {/* End of heroContentY motion.div */}

            {/* Right content - Professional photo */}
            <motion.div 
              className="relative"
              variants={scaleIn}
              transition={{ delay: 0.3 }}
              style={{ y: heroImageY }}
            >
              <motion.div 
                className="relative z-10"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <BlurImage
                  src={WhatsApp_Image_2025_06_25_at_19_11_55} 
                  alt="Dario Velez - Realtor Profesional" 
                  className="rounded-2xl shadow-2xl w-full max-w-md mx-auto object-cover h-[600px]"
                  priority
                />
              </motion.div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-turquoise/20 to-caribbean/20 rounded-2xl transform rotate-6 scale-105 -z-10"
                animate={float}
                transition={{ delay: 0.5, duration: 6 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* About Section */}
      <AboutSection />
      {/* Projects Section */}
      <ProjectsSection 
        projects={projects} 
        isLoading={isLoading} 
        navigateToProject={navigateToProject}
        getTranslatedProject={getTranslatedProject}
      />
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl text-gray-900 mb-4">{t('testimonials:section_title')}</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              {t('testimonials:section_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {getTestimonials().map((testimonial: any, index: number) => (
              <motion.div
                key={index}
                whileHover={cardHover}
                className="h-full" // Ensure motion.div takes full height for consistent hover effect
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-gray-100 h-full">
                  <CardContent className="p-0">
                    {/* Client Transaction Image */}
                    <div className="relative h-48 overflow-hidden">
                    <img 
                      src={testimonial.avatar} 
                      alt={`${testimonial.name} - Client transaction`}
                      className="w-full h-full object-cover"
                    />
                    {/* Quote overlay */}
                    <div className="absolute top-4 left-4">
                      <Quote className="text-white opacity-80 drop-shadow-md" size={28} />
                    </div>
                    {/* Rating overlay */}
                    <div className="absolute bottom-4 left-4 flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="text-yellow-400 fill-current drop-shadow-md" size={14} />
                      ))}
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6">
                    {/* Testimonial Text */}
                    <p className="text-gray-700 mb-4 italic leading-relaxed text-sm">
                      "{testimonial.text}"
                    </p>
                    
                    {/* Client Info */}
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                      <p className="text-xs text-turquoise font-medium mt-1">{testimonial.property_type}</p>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Legal Information Section */}
      <section id="info-legal" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('legal:section_title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Side - Ley CONFOTUR */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-turquoise rounded-lg flex items-center justify-center mr-4">
                  <Scale className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-900">{t('legal:confotur.title')}</h3>
                  <p className="text-gray-600">{t('legal:confotur.subtitle')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-turquoise mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('legal:confotur.benefits.tax_exemption.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('legal:confotur.benefits.tax_exemption.description')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-turquoise mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('legal:confotur.benefits.import_exemption.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('legal:confotur.benefits.import_exemption.description')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-turquoise mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('legal:confotur.benefits.transfer_exemption.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('legal:confotur.benefits.transfer_exemption.description')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Proceso Legal Simplificado */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-turquoise rounded-lg flex items-center justify-center mr-4">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-900">{t('legal:process.title')}</h3>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-turquoise rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('legal:process.steps.due_diligence.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('legal:process.steps.due_diligence.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-turquoise rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('legal:process.steps.purchase_contract.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('legal:process.steps.purchase_contract.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-turquoise rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('legal:process.steps.title_registration.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('legal:process.steps.title_registration.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-turquoise rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('legal:process.steps.certificates.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('legal:process.steps.certificates.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                  <img 
                    src={DarioVelezLogo} 
                    alt="Dario Velez Real Estate Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Dario Velez</h3>
                  <p className="text-gray-400">{t('home:hero.specialist_title')}</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                {t('home:footer.description')}
              </p>
              <div className="flex space-x-4">
                <motion.a
                  href="https://www.facebook.com/profile.php?id=61553046359767"
                  className="text-gray-400 hover:text-turquoise transition-colors"
                  whileHover={{ y: -2, scale: 1.1 }}
                  target="_blank" rel="noopener noreferrer"
                >
                  <FaFacebook size={20} />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/dariovelez.oird/"
                  className="text-gray-400 hover:text-turquoise transition-colors"
                  whileHover={{ y: -2, scale: 1.1 }}
                  target="_blank" rel="noopener noreferrer"
                >
                  <FaInstagram size={20} />
                </motion.a>
                <motion.a
                  href="https://wa.me/18294444431"  // Assuming this is the WhatsApp link
                  className="text-gray-400 hover:text-turquoise transition-colors"
                  whileHover={{ y: -2, scale: 1.1 }}
                  target="_blank" rel="noopener noreferrer"
                >
                  <FaWhatsapp size={20} />
                </motion.a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('general.contact')}</h4>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center"><Phone className="mr-2" size={16} /> +1 (829) 444-4431</p>
                <p className="flex items-center"><Mail className="mr-2 flex-shrink-0" size={16} /> <span className="break-all">dariovelez@ofertainmobiliariard.com</span></p>
                <p className="flex items-center"><MapPin className="mr-2" size={16} /> Punta Cana, {t('general.dominican_republic')}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('general.services')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>{t('home:footer.services_list.tourism_investments')}</li>
                <li>{t('home:footer.services_list.confotur_advisory')}</li>
                <li>{t('home:footer.services_list.property_management')}</li>
                <li>{t('home:footer.services_list.legal_consulting')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t('home:footer.copyright')}</p>
            <p className="text-xs mt-2 opacity-70">Website hecho por Agentic Innovations</p>
          </div>
        </div>
      </footer>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
        <a
          href="https://wa.me/18294444431?text=Hola%20Dario,%20estoy%20interesado%20en%20tus%20propiedades%20en%20República%20Dominicana"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 touch-manipulation group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
          
          {/* Mobile tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block sm:group-hover:block">
            <div className="bg-gray-900 text-white text-xs sm:text-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">
              {t('contact:whatsapp_tooltip', 'Contactar por WhatsApp')}
              <div className="absolute top-full right-2 sm:right-4 w-0 h-0 border-l-2 border-r-2 border-t-2 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </a>
      </div>
      {/* Quick Action Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 sm:hidden shadow-lg">
        <div className="flex space-x-2 max-w-screen-sm mx-auto">
          <Button
            onClick={() => setIsContactModalOpen(true)}
            className="flex-1 bg-caribbean text-white hover:bg-caribbean/90 active:bg-caribbean/80 h-12 text-xs touch-manipulation min-w-0 px-3"
          >
            <Mail className="mr-1 flex-shrink-0" size={14} />
            <span className="truncate">{t('common:buttons.contact_me')}</span>
          </Button>
          <Button
            onClick={() => setIsCalendlyModalOpen(true)}
            className="flex-1 bg-turquoise text-white hover:bg-turquoise/90 active:bg-turquoise/80 h-12 text-xs touch-manipulation min-w-0 px-3"
          >
            <Calendar className="mr-1 flex-shrink-0" size={14} />
            <span className="truncate">{t('common:buttons.schedule_appointment')}</span>
          </Button>
        </div>
      </div>
      {/* Modals */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)}
        onOpenCalendly={() => {
          setIsContactModalOpen(false);
          setIsCalendlyModalOpen(true);
        }}
      />
      <CalendlyModal 
        isOpen={isCalendlyModalOpen} 
        onClose={() => setIsCalendlyModalOpen(false)}
      />
      </div>
    </PageTransition>
  );
}
