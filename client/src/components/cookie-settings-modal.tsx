import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Cookie, Shield, BarChart3, Target, Palette } from "lucide-react";
import { 
  getCookieConsent, 
  saveCookieConsent, 
  acceptAllCookies, 
  acceptEssentialOnly,
  type CookiePreferences 
} from "@/lib/cookie-consent";

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
  const { t } = useTranslation('cookies');
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Load current preferences when modal opens
    if (isOpen) {
      const consent = getCookieConsent();
      if (consent) {
        setPreferences(consent.preferences);
      }
    }
  }, [isOpen]);

  const handlePreferenceChange = (category: keyof CookiePreferences, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  const handleSave = () => {
    saveCookieConsent(preferences);
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAllCookies();
    onClose();
  };

  const handleRejectAll = () => {
    acceptEssentialOnly();
    onClose();
  };

  const categoryIcons = {
    essential: Shield,
    analytics: BarChart3,
    marketing: Target,
    preferences: Palette,
  };

  const categories = [
    {
      key: 'essential' as keyof CookiePreferences,
      required: true,
      Icon: categoryIcons.essential,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      required: false,
      Icon: categoryIcons.analytics,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      required: false,
      Icon: categoryIcons.marketing,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      key: 'preferences' as keyof CookiePreferences,
      required: false,
      Icon: categoryIcons.preferences,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cookie className="h-6 w-6 text-blue-600" />
            {t('modal.title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('modal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {categories.map(({ key, required, Icon, color, bgColor, borderColor }) => (
            <Card key={key} className={`${borderColor} ${required ? 'bg-gray-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {t(`categories.${key}.title`)}
                      </CardTitle>
                      {required && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {t('categories.essential.title') === t(`categories.${key}.title`) ? 'Requerido' : 'Required'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={preferences[key]}
                      onCheckedChange={(checked) => handlePreferenceChange(key, checked)}
                      disabled={required}
                      id={`cookie-${key}`}
                    />
                    <Label htmlFor={`cookie-${key}`} className="sr-only">
                      {t(`categories.${key}.title`)}
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-3 text-sm leading-relaxed">
                  {t(`categories.${key}.description`)}
                </CardDescription>
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Ejemplos:</strong> {t(`categories.${key}.examples`)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
          <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {t('modal.save')}
          </Button>
          <Button onClick={handleAcceptAll} variant="outline" className="flex-1">
            {t('modal.acceptAll')}
          </Button>
          <Button onClick={handleRejectAll} variant="ghost" className="flex-1">
            {t('modal.rejectAll')}
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            {t('policy.linkText')} • {t('policy.lastUpdated')} {new Date().toLocaleDateString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}