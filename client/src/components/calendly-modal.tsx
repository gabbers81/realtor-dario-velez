import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">Agendar Consulta</DialogTitle>
        </DialogHeader>
        
        <div className="min-h-[600px] w-full">
          {/* Calendly embed iframe - Replace YOUR_CALENDLY_URL with actual Calendly link */}
          <iframe 
            src="https://calendly.com/YOUR_CALENDLY_URL"
            width="100%" 
            height="600" 
            frameBorder="0"
            title="Agendar Consulta con Dario Velez"
            className="rounded-lg"
          ></iframe>
          
          {/* Fallback content if Calendly is not configured */}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <Calendar className="mx-auto text-caribbean mb-4" size={48} />
            <h4 className="text-lg font-semibold mb-2">Configurar Calendly</h4>
            <p className="text-gray-600 text-sm">
              Para activar el calendario, reemplaza "YOUR_CALENDLY_URL" con tu enlace de Calendly real
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
