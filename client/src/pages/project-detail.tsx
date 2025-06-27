import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactModal } from "@/components/contact-modal";
import { CalendlyModal } from "@/components/calendly-modal";
import { ArrowLeft, Download, Calendar, MapPin, Clock, DollarSign, MessageCircle, Home, FileText } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/language-switcher";
import { SEOHead } from "@/components/seo-head";
import { generatePropertySchema, getLocationData } from "@/lib/property-schema";
import type { Project } from "@/lib/types";
import DarioVelezLogo from "@assets/DarioRealtorLogo_cropped_1750974653123.png";

export default function ProjectDetailPage() {
  const { t, i18n } = useTranslation(['common', 'home', 'contact', 'projects']);
  const [location] = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);

  // Extract slug from location
  const slug = location.split('/proyecto/')[1];

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: [`/api/project/${slug}`],
    enabled: !!slug && slug !== '',
  });

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

  const goBack = () => {
    window.history.back();
  };

  const downloadPDF = () => {
    if (project && project.pdfUrl) {
      const link = document.createElement('a');
      link.href = project.pdfUrl;
      link.download = `${project.slug}.pdf`;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-caribbean mx-auto mb-4"></div>
          <p className="text-gray-600">{t('general.loading')}</p>
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
    <div className="min-h-screen bg-white">
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
              <div className="flex items-center space-x-3">
                <img 
                  src={DarioVelezLogo} 
                  alt="Dario Velez Realtor Logo" 
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="font-bold text-xl text-gray-900">Dario Velez</h1>
                  <p className="text-sm text-gray-600">{t('common:tagline')}</p>
                </div>
              </div>
              
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
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
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
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{getTranslatedProject(project).description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="mr-2 text-caribbean" size={20} />
                  <div>
                    <span className="block text-sm text-gray-500">{t('projects:detail.price')}</span>
                    <span className="font-semibold text-lg">{getTranslatedProject(project).price}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="mr-2 text-turquoise" size={20} />
                  <div>
                    <span className="block text-sm text-gray-500">{t('projects:detail.location')}</span>
                    <span className="font-semibold">{getTranslatedProject(project).location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-700 mb-6">
                <Clock className="mr-2 text-sage" size={20} />
                <div>
                  <span className="block text-sm text-gray-500">{t('projects:detail.completion')}</span>
                  <span className="font-semibold">{getTranslatedProject(project).completion}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">{t('projects:detail.main_features')}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {getTranslatedProject(project).features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="justify-start p-2">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location Information */}
              {locationData && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Ubicación y Accesibilidad</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="mr-2 text-turquoise" size={16} />
                      <span className="text-sm">
                        <strong>Aeropuerto:</strong> {locationData.distanceToAirport}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="mr-2 text-caribbean" size={16} />
                      <span className="text-sm">
                        <strong>Playa:</strong> {locationData.distanceToBeach}
                      </span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Amenidades Cercanas:</h4>
                      <div className="flex flex-wrap gap-1">
                        {locationData.nearbyAmenities.slice(0, 4).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <img 
                src={project.imageUrl} 
                alt={project.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PDF Viewer */}
      {project.pdfUrl && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('projects:detail.detailed_info')}</h2>
              <Button onClick={downloadPDF} variant="outline">
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
          </div>
        </div>
      </footer>

      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsContactModalOpen(true)}
          className="bg-caribbean text-white hover:bg-caribbean/90 shadow-lg rounded-full p-4 h-auto"
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
      />
      <CalendlyModal 
        isOpen={isCalendlyModalOpen} 
        onClose={() => setIsCalendlyModalOpen(false)}
      />
    </div>
  );
}