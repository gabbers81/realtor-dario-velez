import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async"; // Import Helmet
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactModal } from "@/components/contact-modal";
import { ProjectModal } from "@/components/project-modal";
import { CalendlyModal } from "@/components/calendly-modal";
import { Home, Calendar, ArrowRight, Check, Shield, CheckCircle, Phone, Mail, MapPin, Scale, FileText } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/language-switcher";
import AnimateOnScroll from "@/components/animate-on-scroll";
import type { Project } from "@/lib/types";

import WhatsApp_Image_2025_06_25_at_19_11_55 from "@assets/WhatsApp Image 2025-06-25 at 19.11.55.jpeg";

export default function HomePage() {
  const { t, i18n } = useTranslation(); // Added i18n for language attribute
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const openContactFromProject = () => {
    setIsProjectModalOpen(false);
    setTimeout(() => setIsContactModalOpen(true), 300);
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

  const baseCanonicalUrl = "https://www.dariovelezrealty.com"; // TODO: Confirm final domain
  const canonicalUrl = `${baseCanonicalUrl}${i18n.language === 'es' ? '' : '/' + i18n.language}`;

  const supportedLanguages = ["es", "en", "ru", "fr", "de", "pt"];


  return (
    <>
      <Helmet htmlAttributes={{ lang: i18n.language }}>
        <title>{t('seo:home_page_title', 'Dario Velez - Dominican Republic Real Estate Expert | Punta Cana Investments')}</title>
        <meta name="description" content={t('seo:home_page_description', 'Invest in Paradise with Dario Velez, your expert realtor for properties in Punta Cana, Bávaro, and across the Dominican Republic. Discover luxury villas, apartments, and land for sale.')} />
        <link rel="canonical" href={canonicalUrl} />
        {supportedLanguages.map(lang => {
          if (lang === i18n.language) return null;
          const langPath = lang === 'es' ? '' : `/${lang}`;
          return <link key={lang} rel="alternate" hrefLang={lang} href={`${baseCanonicalUrl}${langPath}`} />;
        })}
        {i18n.language !== 'x-default' && ( // Assuming 'es' is the default and we want x-default to point to it
            <link rel="alternate" hrefLang="x-default" href={baseCanonicalUrl} />
        )}

        <meta property="og:title" content={t('seo:home_page_title', 'Dario Velez - Dominican Republic Real Estate Expert | Punta Cana Investments')} />
        <meta property="og:description" content={t('seo:home_page_description', 'Invest in Paradise with Dario Velez, your expert realtor for properties in Punta Cana, Bávaro, and across the Dominican Republic. Discover luxury villas, apartments, and land for sale.')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        {/* <meta property="og:image" content={`${baseCanonicalUrl}/og-image.jpg`} /> */} {/* TODO: Add actual OG image URL */}
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "RealEstateAgent",
                "name": "Dario Velez",
                "url": baseCanonicalUrl,
                "logo": `${baseCanonicalUrl}/logo.png`, // TODO: Replace with actual logo URL
                "image": `${baseCanonicalUrl}/dario-velez-profile.jpg`, // TODO: Replace with an absolute URL to the realtor's image
                "telephone": "+18291234567", // TODO: Use actual phone from a central config or translation
                "email": "dario@caribeinversiones.com", // TODO: Use actual email
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Punta Cana",
                  "addressCountry": "DO"
                },
                "areaServed": [
                  {"@type": "Place", "name": "Punta Cana"},
                  {"@type": "Place", "name": "Bávaro"},
                  {"@type": "Place", "name": "Cap Cana"},
                  {"@type": "Country", "name": "Dominican Republic"}
                ],
                "priceRange": "$$ - $$$",
                "knowsLanguage": supportedLanguages
              },
              {
                "@type": "WebSite",
                "url": baseCanonicalUrl,
                "name": "Dario Velez Real Estate",
                "publisher": {
                  "@type": "Organization",
                  "name": "Dario Velez Real Estate",
                  "logo": {
                    "@type": "ImageObject",
                    "url": `${baseCanonicalUrl}/logo.png` // TODO: Replace with actual logo URL
                  }
                },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `${baseCanonicalUrl}/search?q={search_term_string}`, // TODO: Implement search functionality if planned
                  "query-input": "required name=search_term_string"
                }
              }
            ]
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <AnimateOnScroll initialClassName="opacity-0 scale-50" animationClassName="opacity-100 scale-100" delay="delay-500">
                  <div className="w-10 h-10 bg-turquoise rounded-full flex items-center justify-center">
                    <Home className="text-white text-lg" size={20} />
                  </div>
                </AnimateOnScroll>
                <AnimateOnScroll initialClassName="opacity-0 translate-x-[-20px]" animationClassName="opacity-100 translate-x-0" delay="delay-700">
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">Dario Velez</div> {/* Corrected from h1 */}
                    <p className="text-sm text-gray-600">Realtor Especializado</p>
                  </div>
                </AnimateOnScroll>
              </div>
              
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-gray-700 hover:text-caribbean font-medium transition-all hover:scale-105 active:scale-100"
                >
                  {t('navigation.home')}
                </button>
                <button
                  onClick={() => scrollToSection('proyectos')}
                  className="text-gray-700 hover:text-caribbean font-medium transition-all hover:scale-105 active:scale-100"
                >
                  {t('navigation.projects')}
                </button>
                <button
                  onClick={() => scrollToSection('info-legal')}
                  className="text-gray-700 hover:text-caribbean font-medium transition-all hover:scale-105 active:scale-100"
                >
                  {t('navigation.legal')}
                </button>
                <LanguageSwitcher />
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  className="bg-caribbean text-white hover:bg-caribbean/90 transform hover:scale-105 transition-transform"
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
                  className="block w-full text-left text-gray-700 font-medium py-2 px-3 rounded-md hover:bg-gray-100 hover:text-caribbean transition-colors active:bg-gray-200"
                >
                  {t('navigation.home')}
                </button>
                <button
                  onClick={() => scrollToSection('proyectos')}
                  className="block w-full text-left text-gray-700 font-medium py-2 px-3 rounded-md hover:bg-gray-100 hover:text-caribbean transition-colors active:bg-gray-200"
                >
                  {t('navigation.projects')}
                </button>
                <button
                  onClick={() => scrollToSection('info-legal')}
                  className="block w-full text-left text-gray-700 font-medium py-2 px-3 rounded-md hover:bg-gray-100 hover:text-caribbean transition-colors active:bg-gray-200"
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
          <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-50 blur-2xl animate-float"></div>
          <div className="absolute bottom-32 left-20 w-48 h-48 bg-turquoise/20 rounded-full opacity-50 blur-3xl animate-float delay-[1500ms]"></div> {/* Corrected delay */}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimateOnScroll className="space-y-8" initialClassName="opacity-0 translate-x-[-50px]" animationClassName="opacity-100 translate-x-0" delay="delay-100">
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
                    className="border-2 border-turquoise text-turquoise hover:bg-turquoise hover:text-white px-8 py-4 text-base font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    {t('home:hero.cta')}
                  </Button>
                </div>

                <AnimateOnScroll className="grid grid-cols-3 gap-8 pt-8" initialClassName="opacity-0 translate-y-10" animationClassName="opacity-100 translate-y-0" delay="delay-500">
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
                </AnimateOnScroll>
              </AnimateOnScroll>

              <AnimateOnScroll className="relative group" initialClassName="opacity-0 scale-90" animationClassName="opacity-100 scale-100" delay="delay-300">
                <div className="relative z-10">
                  <img
                    src={WhatsApp_Image_2025_06_25_at_19_11_55}
                    alt="Dario Velez - Realtor Profesional en República Dominicana"
                    className="rounded-2xl shadow-2xl w-full max-w-md mx-auto object-cover h-[600px]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-turquoise/20 to-caribbean/20 rounded-2xl transform rotate-3 scale-105 -z-10 group-hover:rotate-0 group-hover:scale-100 transition-all duration-500"></div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-16" initialClassName="opacity-0 translate-y-10" animationClassName="opacity-100 translate-y-0">
              <h2 className="font-bold text-4xl text-gray-900 mb-4">{t('home:about.title')}</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                {t('home:about.experience')}
              </p>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-3 gap-8">
              <AnimateOnScroll initialClassName="opacity-0 translate-y-10" animationClassName="opacity-100 translate-y-0" delay="delay-100">
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-caribbean/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-caribbean text-2xl" size={32} />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">Especializado</h3>
                    <p className="text-gray-600">Especializado en propiedades turísticas del Este de República Dominicana (Punta Cana, Bávaro, Cap Cana)</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              <AnimateOnScroll initialClassName="opacity-0 translate-y-10" animationClassName="opacity-100 translate-y-0" delay="delay-200">
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="text-turquoise text-2xl" size={32} />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">Experiencia</h3>
                    <p className="text-gray-600">Más de 15+ transacciones exitosas en la zona turística de Punta Cana y Bávaro</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              <AnimateOnScroll initialClassName="opacity-0 translate-y-10" animationClassName="opacity-100 translate-y-0" delay="delay-300">
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="text-sage text-2xl" size={32} />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">Internacional</h3>
                    <p className="text-gray-600">Atendiendo clientes de Estados Unidos, Canadá, Europa y Latinoamérica</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="proyectos" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-16" initialClassName="opacity-0 translate-y-10" animationClassName="opacity-100 translate-y-0">
              <h2 className="font-bold text-4xl text-gray-900 mb-4">{t('home:projects.title')}</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                {t('home:projects.subtitle')}
              </p>
            </AnimateOnScroll>

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
                {projects?.map((project: Project, index: number) => (
                  <AnimateOnScroll
                    key={project.id}
                    initialClassName="opacity-0 scale-95"
                    animationClassName="opacity-100 scale-100"
                    delay={`delay-${100 + index * 100}`}
                  >
                    <Card
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-2 h-full flex flex-col"
                      onClick={() => openProjectModal(project)}
                    >
                      <div className="overflow-hidden">
                        <img
                          src={project.imageUrl}
                          alt={`${project.title} - ${project.location || 'Propiedad en República Dominicana'}`}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{project.description}</p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-caribbean font-bold text-lg">{project.price}</span>
                          <button className="text-turquoise hover:text-caribbean font-medium flex items-center">
                            Ver Detalles <ArrowRight className="ml-1" size={16} />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimateOnScroll>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Legal Information Section */}
        <section id="info-legal" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-16" initialClassName="opacity-0 translate-y-10" animationClassName="opacity-100 translate-y-0">
              <h2 className="font-bold text-4xl text-gray-900 mb-4">{t('home:legal_info.title', 'Información Legal Clave')}</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">{t('home:legal_info.subtitle', 'Entendiendo el proceso y los beneficios de invertir en RD.')}</p>
            </AnimateOnScroll>
            <div className="grid md:grid-cols-2 gap-12">
              <AnimateOnScroll initialClassName="opacity-0 translate-x-[-50px]" animationClassName="opacity-100 translate-x-0" delay="delay-100">
                <div className="bg-white rounded-lg p-8 shadow-lg h-full">
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
              </AnimateOnScroll>

              <AnimateOnScroll initialClassName="opacity-0 translate-x-[50px]" animationClassName="opacity-100 translate-x-0" delay="delay-200">
                <div className="bg-white rounded-lg p-8 shadow-lg h-full">
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
              </AnimateOnScroll>
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
                  <a href="#" className="text-gray-400 hover:text-turquoise transition-colors transform hover:scale-110"><FaFacebook size={20} /></a>
                  <a href="#" className="text-gray-400 hover:text-turquoise transition-colors transform hover:scale-110"><FaInstagram size={20} /></a>
                  <a href="#" className="text-gray-400 hover:text-turquoise transition-colors transform hover:scale-110"><FaLinkedin size={20} /></a>
                  <a href="#" className="text-gray-400 hover:text-turquoise transition-colors transform hover:scale-110"><FaWhatsapp size={20} /></a>
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
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          project={selectedProject}
          onOpenContact={openContactFromProject}
        />
        <CalendlyModal
          isOpen={isCalendlyModalOpen}
          onClose={() => setIsCalendlyModalOpen(false)}
        />
      </div>
    </>
  );
}
