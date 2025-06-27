import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">{t('contact:calendly.title')}</DialogTitle>
        </DialogHeader>
        
        <div className="min-h-[600px] w-full">
          {/* Calendly embed iframe */}
          <iframe 
            src="https://calendly.com/gabriel-garrido18/30min"
            width="100%" 
            height="600" 
            frameBorder="0"
            title="Agendar Consulta con Dario Velez"
            className="rounded-lg"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
