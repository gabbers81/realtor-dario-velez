import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { CookieSettingsModal } from "@/components/cookie-settings-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CookieSettingsButton() {
  const { t } = useTranslation('cookies');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              size="sm"
              variant="outline"
              className="fixed top-20 left-4 z-40 bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full p-3"
            >
              <Cookie className="h-4 w-4 text-gray-600" />
              <span className="sr-only">{t('settings.title')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-gray-900 text-white">
            <p>{t('settings.tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CookieSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}