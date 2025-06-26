import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactModal } from "@/components/contact-modal";
import { CalendlyModal } from "@/components/calendly-modal";
import { ArrowLeft, Download, Calendar, MapPin, Clock, DollarSign, MessageCircle, Home } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Project } from "@/lib/types";

export default function ProjectDetailPage() {
  const { t } = useTranslation(['common', 'home', 'contact', 'projects']);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-turquoise rounded-full flex items-center justify-center">
                  <Home className="text-white text-lg" size={20} />
                </div>
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
              <iframe
                src={project.pdfUrl}
                className="w-full h-screen"
                title={`${project.title} - Información detallada`}
              />
            </div>
          </div>
        </section>
      )}

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