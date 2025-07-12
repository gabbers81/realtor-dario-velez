import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactModal } from "@/components/contact-modal";
import { CalendlyModal } from "@/components/calendly-modal";
import { PhotoCarousel } from "@/components/photo-carousel";
import { ArrowLeft, Download, Calendar, MapPin, Clock, DollarSign, MessageCircle, Home, FileText, ExternalLink, Navigation, Phone, Check, Eye } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/language-switcher";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { SEOHead } from "@/components/seo-head";
import { generatePropertySchema, getLocationData } from "@/lib/property-schema";
import { useSwipe } from "@/hooks/use-swipe";
import { trackEvent } from "@/lib/analytics";
import type { Project } from "@/lib/types";
import DarioVelezLogo from "@assets/DarioRealtorLogo_cropped_1750974653123.png";

export default function ProjectDetailPage() {
  const { t, i18n } = useTranslation(['common', 'home', 'contact', 'projects']);
  const [location, setLocation] = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);

  // Navigation function
  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home page if no history
      setLocation('/');
    }
  };

  // Swipe gestures for navigation
  const swipeHandlers = useSwipe({
    onSwipeRight: goBack,
    threshold: 100,
  });

  // Extract slug from location
  const slug = location.split('/proyecto/')[1];

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: [`/api/project/${slug}`],
    enabled: !!slug && slug !== '',
  });

  // Track project page view when project loads - must be before any conditional returns
  useEffect(() => {
    if (project) {
      trackEvent('project_view', 'engagement', project.slug);
    }
  }, [project]);

  // Function to get translated project data
  const getTranslatedProject = (project: Project) => {
    const projectKey = slug?.replace(/-/g, '_'); // Convert slug to translation key format
    
    const description = t(`projects:properties.${projectKey}.description`, { defaultValue: project.description });
    const features = t(`projects:properties.${projectKey}.features`, { returnObjects: true, defaultValue: project.features }) as string[];
    const location = t(`projects:properties.${projectKey}.location`, { defaultValue: project.location });
    const price = t(`projects:properties.${projectKey}.price`, { defaultValue: project.price });
    const completion = t(`projects:properties.${projectKey}.completion`, { defaultValue: project.completion });
    
    return {
      ...project,
      description,
      features,
      location,
      price,
      completion
    };
  };

  const downloadPDF = () => {
    if (project && project.pdfUrl) {
      // Track PDF download
      trackEvent('pdf_download', 'engagement', project.slug);
      
      const link = document.createElement('a');
      link.href = project.pdfUrl;
      link.download = `${project.slug}.pdf`;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center page-transition">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-caribbean mx-auto mb-4"></div>
          <p className="text-gray-600 animate-fade-in">{t('general.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proyecto no encontrado</h1>
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="mr-2" size={16} />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const translatedProject = getTranslatedProject(project);
  const projectImage = project.imageUrl || "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630";
  const locationData = getLocationData(project.slug);

  return (
    <div className="min-h-screen bg-white page-transition" {...swipeHandlers}>
      <SEOHead 
        title={`${translatedProject.title} - ${translatedProject.location}`}
        description={`${translatedProject.description} ${translatedProject.price} - ${t('projects:detail.contact_project')}`}
        image={projectImage}
        url={`/proyecto/${project.slug}`}
        type="article"
      />
      
      {/* Enhanced JSON-LD Structured Data with Location Schema */}
      <script type="application/ld+json">
        {JSON.stringify(generatePropertySchema(project, i18n.language))}
      </script>
      
      {/* Additional Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Dario Velez",
          "url": "https://dariovelez.com.do",
          "image": projectImage,
          "description": translatedProject.description,
          "areaServed": {
            "@type": "Place",
            "name": "República Dominicana"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Propiedades Exclusivas",
            "itemListElement": {
              "@type": "RealEstateListing",
              "name": translatedProject.title,
              "description": translatedProject.description,
              "price": translatedProject.price,
              "image": projectImage,
              "url": `${window.location.origin}/proyecto/${project.slug}`,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": translatedProject.location,
                "addressCountry": "DO"
              },
              "offers": {
                "@type": "Offer",
                "price": translatedProject.price,
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              }
            }
          }
        })}
      </script>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                <img 
                  src={DarioVelezLogo} 
                  alt="Dario Velez Realtor Logo" 
                  className="w-16 h-16 object-contain"
                />
                <div className="text-left">
                  <h1 className="font-bold text-xl text-gray-900 text-left">Dario Velez</h1>
                  <p className="text-sm text-gray-600 text-left">{t('common:tagline')}</p>
                </div>
              </a>
              
              {/* Navigation Links - Desktop */}
              <nav className="hidden lg:flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-caribbean transition-colors font-medium">
                  {t('common:navigation.home')}
                </a>
                <a href="/#projects" className="text-gray-700 hover:text-caribbean transition-colors font-medium">
                  {t('common:navigation.projects')}
                </a>
                <a href="/#testimonials" className="text-gray-700 hover:text-caribbean transition-colors font-medium">
                  {t('common:navigation.testimonials')}
                </a>
                <a href="/#legal" className="text-gray-700 hover:text-caribbean transition-colors font-medium">
                  {t('common:navigation.legal')}
                </a>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <CookieSettingsButton variant="navigation" />
              <Button 
                onClick={goBack}
                variant="ghost"
                className="flex items-center text-gray-700 hover:text-caribbean"
              >
                <ArrowLeft className="mr-2" size={20} />
                {t('common:actions.back')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Project Header */}
      <section className="py-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title and Description */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">{getTranslatedProject(project).description}</p>
          </div>

          {/* Full-Width Carousel */}
          <div className="mb-6">
            <PhotoCarousel 
              images={project.images || [project.imageUrl]} 
              projectTitle={project.title}
              className="rounded-xl overflow-hidden shadow-lg"
            />
          </div>

          {/* Key Info Cards - Below Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center text-gray-700">
                <DollarSign className="mr-3 text-caribbean" size={24} />
                <div>
                  <span className="block text-sm sm:text-xs text-gray-500 font-medium">{t('projects:detail.price')}</span>
                  <span className="font-bold text-xl sm:text-lg text-gray-900">{getTranslatedProject(project).price}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center text-gray-700">
                <MapPin className="mr-3 text-turquoise" size={24} />
                <div>
                  <span className="block text-sm sm:text-xs text-gray-500 font-medium">{t('projects:detail.location')}</span>
                  <span className="font-semibold text-lg sm:text-base text-gray-900">{getTranslatedProject(project).location}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center text-gray-700">
                <Clock className="mr-3 text-sage" size={24} />
                <div>
                  <span className="block text-sm sm:text-xs text-gray-500 font-medium">{t('projects:detail.completion')}</span>
                  <span className="font-semibold text-lg sm:text-base text-gray-900">{getTranslatedProject(project).completion}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {locationData && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <h3 className="font-bold text-xl sm:text-lg mb-4 text-gray-900 text-center">{t('projects:detail.location_accessibility')}</h3>
              
              {/* Distance Section */}
              <div className="mb-4">
                <h4 className="font-semibold text-lg sm:text-base text-gray-800 mb-3 flex items-center">
                  <Navigation className="mr-2 text-caribbean" size={20} />
                  {t('projects:detail.main_distances')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center p-3 bg-gradient-to-r from-turquoise/10 to-turquoise/5 rounded-lg">
                    <div className="w-10 h-10 sm:w-9 sm:h-9 bg-turquoise/20 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="text-turquoise" size={20} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-base sm:text-sm">{t('projects:detail.airport')}</span>
                      <p className="text-sm sm:text-xs text-gray-600">{locationData.distanceToAirport}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gradient-to-r from-caribbean/10 to-caribbean/5 rounded-lg">
                    <div className="w-10 h-10 sm:w-9 sm:h-9 bg-caribbean/20 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="text-caribbean" size={20} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-base sm:text-sm">{t('projects:detail.beach')}</span>
                      <p className="text-sm sm:text-xs text-gray-600">{locationData.distanceToBeach}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities by Category */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg sm:text-base text-gray-800 flex items-center">
                  <Home className="mr-2 text-sage" size={20} />
                  {t('projects:detail.nearby_amenities')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-2">
                  {locationData.nearbyAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 sm:p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-7 h-7 sm:w-6 sm:h-6 bg-sage/20 rounded-full flex items-center justify-center mr-2">
                        <MapPin className="text-sage" size={16} />
                      </div>
                      <span className="text-sm sm:text-xs text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Features Section - Full Width Below */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl sm:text-lg mb-4 text-gray-900 text-center">{t('projects:detail.main_features')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2">
              {getTranslatedProject(project).features.map((feature, index) => (
                <div key={index} className="flex items-center p-3 sm:p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Check className="mr-3 sm:mr-2 text-caribbean flex-shrink-0" size={20} />
                  <span className="text-gray-700 font-medium text-base sm:text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PDF Viewer */}
      {project.pdfUrl && (
        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
              <h2 className="text-xl sm:text-lg font-bold text-gray-900">{t('projects:detail.detailed_info')}</h2>
              <Button 
                onClick={downloadPDF} 
                variant="outline" 
                className="hidden sm:flex touch-manipulation"
              >
                <Download className="mr-2" size={16} />
                {t('projects:detail.download_pdf')}
              </Button>
            </div>
            
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              {/* Mobile: Show download button prominently */}
              <div className="block md:hidden p-6 text-center bg-white">
                <FileText className="mx-auto mb-4 text-caribbean" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('projects:detail.view_brochure')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('projects:detail.mobile_pdf_message', 'Para mejor experiencia, descarga el PDF')}
                </p>
                <Button
                  asChild
                  className="bg-caribbean text-white hover:bg-caribbean/90 w-full"
                >
                  <a href={project.pdfUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2" size={20} />
                    {t('projects:detail.download_pdf')}
                  </a>
                </Button>
              </div>
              
              {/* Desktop: Enhanced PDF viewer with fallback */}
              <div className="hidden md:block relative">
                <iframe
                  src={project.pdfUrl}
                  className="w-full h-[600px] lg:h-[800px] border-0"
                  title={`${project.title} - Información detallada`}
                  allow="fullscreen"
                  onError={() => {
                    console.log('PDF iframe failed to load, showing fallback');
                  }}
                />
                
                {/* Fallback option for when iframe doesn't work */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2" size={16} />
                      {t('projects:detail.open_in_new_tab', 'Abrir en nueva pestaña')}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
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
                  <p className="text-gray-400">{t('common:tagline')}</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                {t('home:footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('common:navigation.contact')}</h4>
              <div className="space-y-2 text-gray-400">
                <p>+1 (829) 444-4431</p>
                <p className="break-all">dariovelez@ofertainmobiliariard.com</p>
                <p>Punta Cana, República Dominicana</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Dario Velez. Todos los derechos reservados.</p>
            <p className="text-xs mt-2 opacity-70">Hecho por Agentic Innovations</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-24 sm:right-6">
        <a
          href={`https://wa.me/18294444431?text=${encodeURIComponent(
            `Hola Dario, estoy interesado en el proyecto ${translatedProject.title} en ${translatedProject.location}. ¿Podrías darme más información?`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 touch-manipulation group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 button-press"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
        </a>
      </div>

      {/* Mobile Quick Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 sm:hidden shadow-lg">
        <div className="flex space-x-2 max-w-screen-sm mx-auto">
          <Button
            onClick={() => setIsContactModalOpen(true)}
            className="flex-1 bg-caribbean text-white hover:bg-caribbean/90 active:bg-caribbean/80 h-12 text-xs touch-manipulation min-w-0 px-3 button-press"
          >
            <MessageCircle className="mr-1 flex-shrink-0" size={14} />
            <span className="truncate">{t('common:buttons.contact_me')}</span>
          </Button>
          <Button
            onClick={() => setIsCalendlyModalOpen(true)}
            className="flex-1 bg-turquoise text-white hover:bg-turquoise/90 active:bg-turquoise/80 h-12 text-xs touch-manipulation min-w-0 px-3 button-press"
          >
            <Calendar className="mr-1 flex-shrink-0" size={14} />
            <span className="truncate">{t('common:buttons.schedule_appointment')}</span>
          </Button>
          {project.pdfUrl && (
            <Button
              onClick={downloadPDF}
              variant="outline"
              className="px-3 h-12 touch-manipulation border-caribbean text-caribbean hover:bg-caribbean hover:text-white flex-shrink-0 button-press"
            >
              <Download size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile content bottom padding to prevent overlap with action bar */}
      <div className="h-20 sm:hidden"></div>

      {/* Desktop CTA Button */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsContactModalOpen(true)}
          className="bg-caribbean text-white hover:bg-caribbean/90 shadow-lg rounded-full p-4 h-auto touch-manipulation button-press"
        >
          <MessageCircle className="mr-2" size={20} />
          {t('projects:detail.contact_project')}
        </Button>
      </div>

      {/* Modals */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)}
        onOpenCalendly={() => {
          setIsContactModalOpen(false);
          setIsCalendlyModalOpen(true);
        }}
        projectSlug={slug}
      />
      <CalendlyModal 
        isOpen={isCalendlyModalOpen} 
        onClose={() => setIsCalendlyModalOpen(false)}
      />
    </div>
  );
}