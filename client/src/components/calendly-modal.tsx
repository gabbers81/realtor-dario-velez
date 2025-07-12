import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { modalTransition } from "@/lib/animations";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  const { t } = useTranslation();
  const MotionDialogContent = motion(DialogContent);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <MotionDialogContent
            className="max-w-4xl max-h-[90vh]" // Default padding will be applied
            variants={modalTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900">{t('contact:calendly.title')}</DialogTitle>
            </DialogHeader>

            <div className="min-h-[600px] w-full mt-4"> {/* Added mt-4 for spacing */}
              {/* Calendly embed iframe */}
              <iframe
                src="https://calendly.com/velezsoriano87/30min"
                width="100%"
                height="600"
                frameBorder="0"
                title="Agendar Consulta con Dario Velez"
                className="rounded-lg"
              ></iframe>
            </div>
          </MotionDialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
