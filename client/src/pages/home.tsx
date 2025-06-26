import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactModal } from "@/components/contact-modal";
import { CalendlyModal } from "@/components/calendly-modal";
import { Home, Calendar, ArrowRight, Check, Shield, CheckCircle, Phone, Mail, MapPin, Scale, FileText, Star, Quote } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Project } from "@/lib/types";

import WhatsApp_Image_2025_06_25_at_19_11_55 from "@assets/WhatsApp Image 2025-06-25 at 19.11.55.jpeg";

export default function HomePage() {
  const { t } = useTranslation(['common', 'home', 'contact', 'projects', 'legal', 'testimonials']);
  const [, setLocation] = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-turquoise rounded-full flex items-center justify-center">
                <Home className="text-white text-lg" size={20} />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 text-lg">Dario Velez</h1>
                <p className="text-sm text-gray-600">{t('tagline')}</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('inicio')}
                className="text-gray-700 hover:text-caribbean font-medium transition-colors"
              >
                {t('navigation.home')}
              </button>
              <button 
                onClick={() => scrollToSection('proyectos')}
                className="text-gray-700 hover:text-caribbean font-medium transition-colors"
              >
                {t('navigation.projects')}
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-caribbean font-medium transition-colors"
              >
                {t('navigation.testimonials')}
              </button>
              <button 
                onClick={() => scrollToSection('info-legal')}
                className="text-gray-700 hover:text-caribbean font-medium transition-colors"
              >
                {t('navigation.legal')}
              </button>
              <LanguageSwitcher />
              <Button 
                onClick={() => setIsContactModalOpen(true)}
                className="bg-caribbean text-white hover:bg-caribbean/90"
              >
                {t('navigation.contact')}
              </Button>
            </nav>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <button 
                onClick={() => scrollToSection('inicio')}
                className="block w-full text-left text-gray-700 font-medium py-2"
              >
                {t('navigation.home')}
              </button>
              <button 
                onClick={() => scrollToSection('proyectos')}
                className="block w-full text-left text-gray-700 font-medium py-2"
              >
                {t('navigation.projects')}
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left text-gray-700 font-medium py-2"
              >
                {t('navigation.testimonials')}
              </button>
              <button 
                onClick={() => scrollToSection('info-legal')}
                className="block w-full text-left text-gray-700 font-medium py-2"
              >
                {t('navigation.legal')}
              </button>
              <div className="py-2">
                <LanguageSwitcher />
              </div>
              <Button 
                onClick={() => {
                  setIsContactModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-caribbean text-white hover:bg-caribbean/90"
              >
                {t('navigation.contact')}
              </Button>
            </div>
          </div>
        )}
      </header>
      {/* Hero Section */}
      <section id="inicio" className="relative bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 min-h-screen flex items-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-60 blur-2xl"></div>
        <div className="absolute bottom-32 left-20 w-48 h-48 bg-turquoise/20 rounded-full opacity-60 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div>
                <p className="text-turquoise font-medium text-lg mb-4">{t('home:hero.specialist_title')}</p>
                <h1 className="font-bold text-5xl lg:text-6xl text-gray-900 leading-tight">
                  {t('home:hero.title')}
                </h1>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                {t('home:hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="bg-caribbean text-white hover:bg-caribbean/90 px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <Calendar className="mr-2" size={20} />
                  {t('buttons.schedule_appointment')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => scrollToSection('proyectos')}
                  className="border-2 border-turquoise text-turquoise hover:bg-turquoise hover:text-white px-8 py-4 text-base font-semibold transition-all duration-300"
                >
                  {t('home:hero.cta')}
                </Button>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-caribbean">5+</div>
                  <div className="text-gray-600 text-sm">Años de Experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sage">5+</div>
                  <div className="text-gray-600 text-sm">Proyectos Completados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">10+</div>
                  <div className="text-gray-600 text-sm">Clientes Satisfechos</div>
                </div>
              </div>
            </div>

            {/* Right content - Professional photo */}
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src={WhatsApp_Image_2025_06_25_at_19_11_55} 
                  alt="Dario Velez - Realtor Profesional" 
                  className="rounded-2xl shadow-2xl w-full max-w-md mx-auto object-cover h-[600px]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-turquoise/20 to-caribbean/20 rounded-2xl transform rotate-6 scale-105 -z-10"></div>
            </div>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl text-gray-900 mb-4">{t('home:about.title')}</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              {t('home:about.experience')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-caribbean/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-caribbean text-2xl" size={32} />
                </div>
                <h3 className="font-semibold text-xl mb-2">Especializado</h3>
                <p className="text-gray-600">Especializado en propiedades turísticas del Este de República Dominicana (Punta Cana, Bávaro, Cap Cana)</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-turquoise text-2xl" size={32} />
                </div>
                <h3 className="font-semibold text-xl mb-2">Experiencia</h3>
                <p className="text-gray-600">Más de 15+ transacciones exitosas en la zona turística de Punta Cana y Bávaro</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-sage text-2xl" size={32} />
                </div>
                <h3 className="font-semibold text-xl mb-2">Internacional</h3>
                <p className="text-gray-600">Atendiendo clientes de Estados Unidos, Canadá, Europa y Latinoamérica</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Projects Section */}
      <section id="proyectos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl text-gray-900 mb-4">{t('home:projects.title')}</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              {t('home:projects.subtitle')}
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
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
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(projects as Project[])?.map((project: Project) => (
                <Card 
                  key={project.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
                  onClick={() => navigateToProject(project)}
                >
                  <div className="overflow-hidden">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-caribbean font-bold text-lg">{project.price}</span>
                      <button className="text-turquoise hover:text-caribbean font-medium flex items-center">
                        Ver Detalles <ArrowRight className="ml-1" size={16} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      
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
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-white border border-gray-100">
                <CardContent className="p-0">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="text-turquoise opacity-20" size={32} />
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={16} />
                    ))}
                  </div>
                  
                  {/* Testimonial Text */}
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  {/* Client Info */}
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                      <p className="text-xs text-turquoise font-medium">{testimonial.property_type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                <div className="w-10 h-10 bg-turquoise rounded-full flex items-center justify-center">
                  <Home className="text-white" size={20} />
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
                <a href="#" className="text-gray-400 hover:text-turquoise transition-colors">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-turquoise transition-colors">
                  <FaInstagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-turquoise transition-colors">
                  <FaLinkedin size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-turquoise transition-colors">
                  <FaWhatsapp size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('general.contact')}</h4>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center"><Phone className="mr-2" size={16} /> +1 (829) 123-4567</p>
                <p className="flex items-center"><Mail className="mr-2" size={16} /> dario@caribeinversiones.com</p>
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
          </div>
        </div>
      </footer>
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
  );
}
