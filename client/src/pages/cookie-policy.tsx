import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie, Shield, BarChart3, Target, Palette } from "lucide-react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { LanguageSwitcher } from "@/components/language-switcher";
import { COOKIE_CATEGORIES } from "@/lib/cookie-consent";
import DarioVelezLogo from "@assets/DarioRealtorLogo_cropped_1750974653123.png";
import { PageTransition } from "@/components/page-transition";

export default function CookiePolicyPage() {
  const { t, i18n } = useTranslation(['cookies', 'common']);

  const categoryIcons = {
    essential: Shield,
    analytics: BarChart3,
    marketing: Target,
    preferences: Palette,
  };

  const categoryColors = {
    essential: { icon: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    analytics: { icon: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    marketing: { icon: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    preferences: { icon: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <SEOHead
          title={`${t('cookies:policy.linkText')} - Dario Velez Realtor`}
          description="Política de cookies y privacidad para la plataforma inmobiliaria de Dario Velez en República Dominicana"
      />

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <img 
                src={DarioVelezLogo} 
                alt="Dario Velez Realtor" 
                className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common:navigation.back')}
          </Button>
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <Cookie className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('cookies:policy.linkText')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('cookies:policy.lastUpdated')} {new Date().toLocaleDateString(i18n.language)}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>¿Qué son las cookies?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. 
              Nos ayudan a mejorar tu experiencia, recordar tus preferencias y analizar cómo utilizas nuestro sitio.
            </p>
            <p className="text-gray-700">
              Respetamos tu privacidad y te damos control total sobre qué cookies aceptas.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tipos de Cookies que Utilizamos</h2>
          
          {COOKIE_CATEGORIES.map((category) => {
            const Icon = categoryIcons[category.key];
            const colors = categoryColors[category.key];
            
            return (
              <Card key={category.key} className={`${colors.border} ${category.required ? 'bg-gray-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <Icon className={`h-6 w-6 ${colors.icon}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {t(`cookies:categories.${category.key}.title`)}
                      </CardTitle>
                      {category.required && (
                        <Badge variant="secondary" className="mt-1">
                          Requeridas
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {t(`cookies:categories.${category.key}.description`)}
                  </CardDescription>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Ejemplos:</strong> {t(`cookies:categories.${category.key}.examples`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Your Rights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tus Derechos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Puedes aceptar o rechazar cookies no esenciales en cualquier momento</li>
              <li>Puedes cambiar tus preferencias usando el botón de configuración de cookies</li>
              <li>Puedes eliminar cookies desde la configuración de tu navegador</li>
              <li>Rechazar cookies no esenciales no afectará las funciones básicas del sitio</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Si tienes preguntas sobre nuestra política de cookies, puedes contactarnos a través de nuestro 
              formulario de contacto o WhatsApp disponibles en el sitio web.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </PageTransition>
  );
}