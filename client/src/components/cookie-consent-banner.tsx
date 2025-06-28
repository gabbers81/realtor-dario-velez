import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Settings, X } from "lucide-react";
import { CookieSettingsModal } from "./cookie-settings-modal";
import { 
  shouldShowConsentBanner, 
  acceptAllCookies, 
  acceptEssentialOnly,
  getCookieConsent 
} from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const { t } = useTranslation('cookies');
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Check if banner should be shown
    setIsVisible(shouldShowConsentBanner());

    // Listen for consent changes
    const handleConsentChange = () => {
      setIsVisible(shouldShowConsentBanner());
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () => window.removeEventListener('cookieConsentChanged', handleConsentChange);
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    acceptEssentialOnly();
    setIsVisible(false);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    setIsVisible(shouldShowConsentBanner());
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <Card className="max-w-4xl mx-auto shadow-lg border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Cookie className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {t('banner.title')}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {t('banner.description')}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleAcceptAll}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {t('banner.acceptAll')}
                  </Button>
                  
                  <Button 
                    onClick={handleOpenSettings}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('banner.managePreferences')}
                  </Button>
                  
                  <Button 
                    onClick={handleEssentialOnly}
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    {t('banner.essentialOnly')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CookieSettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
      />
    </>
  );
}