import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from "@/components/language-switcher";
import { SEOHead } from "@/components/seo-head";
import { Home, ArrowLeft, Search } from "lucide-react";
import DarioVelezLogo from "@assets/DarioRealtorLogo_cropped_1750974653123.png";
import { PageTransition } from "@/components/page-transition";

export default function Error404Page() {
  const { t } = useTranslation(['common']);

  const goHome = () => {
    window.location.href = '/';
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-caribbean-50 to-blue-50">
        <SEOHead
          title={t('common:error404.title', 'Página no encontrada')}
          description={t('common:error404.description', 'La página que buscas no existe. Explora nuestras propiedades exclusivas en República Dominicana.')}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src={DarioVelezLogo} 
                alt="Dario Velez Realtor" 
                className="h-12 w-auto"
              />
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">Dario Velez</h1>
                <p className="text-sm text-caribbean">
                  {t('common:tagline')}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-caribbean mb-4">404</div>
            <div className="w-24 h-24 mx-auto mb-6 bg-caribbean/10 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-caribbean" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('common:error404.title', 'Página no encontrada')}
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {t('common:error404.message', 'Lo sentimos, la página que buscas no existe. Puede que haya sido movida o eliminada.')}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={goHome}
              className="w-full bg-caribbean text-white hover:bg-caribbean/90"
              size="lg"
            >
              <Home className="mr-2" size={20} />
              {t('common:error404.goHome', 'Ir al Inicio')}
            </Button>
            
            <Button 
              onClick={goBack}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="mr-2" size={20} />
              {t('common:error404.goBack', 'Página Anterior')}
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              {t('common:error404.helpfulLinks', 'Enlaces útiles:')}
            </p>
            <div className="space-y-2">
              <a 
                href="/#projects" 
                className="block text-caribbean hover:text-caribbean/80 text-sm"
              >
                {t('common:nav.projects', 'Proyectos')}
              </a>
              <a 
                href="/#about" 
                className="block text-caribbean hover:text-caribbean/80 text-sm"
              >
                {t('common:nav.about', 'Acerca de')}
              </a>
              <a 
                href="/#contact" 
                className="block text-caribbean hover:text-caribbean/80 text-sm"
              >
                {t('common:nav.contact', 'Contacto')}
              </a>
            </div>
          </div>
        </div>
      </main>
      </div>
    </PageTransition>
  );
}