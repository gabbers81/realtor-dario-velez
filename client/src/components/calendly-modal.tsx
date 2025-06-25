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
        
        {/* TODO: Replace with actual Calendly embed */}
        <div className="bg-gray-100 rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
          <div>
            <Calendar className="mx-auto text-caribbean mb-4" size={64} />
            <h4 className="text-xl font-semibold mb-2">Integración con Calendly</h4>
            <p className="text-gray-600">Aquí se integrará el widget de Calendly para agendar citas</p>
            <p className="text-sm text-gray-500 mt-4">
              Para implementar: reemplazar este div con el código de embed de Calendly
            </p>
            <div className="mt-6 text-left bg-white p-4 rounded-lg max-w-md mx-auto">
              <h5 className="font-medium mb-2">Pasos de integración:</h5>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Crear cuenta en Calendly</li>
                <li>2. Configurar disponibilidad</li>
                <li>3. Obtener el código de embed</li>
                <li>4. Reemplazar este contenido con el widget</li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
