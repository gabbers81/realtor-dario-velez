import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Check, FileText, Eye } from "lucide-react";
import type { Project } from "@/lib/types";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { modalTransition } from "@/lib/animations";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onOpenContact: () => void;
}

export function ProjectModal({ isOpen, onClose, project, onOpenContact }: ProjectModalProps) {
  if (!project) return null;

  const [showPDF, setShowPDF] = useState(false);
  const isMobile = useIsMobile();

  // Use the existing pdfUrl from project data (matches project-detail.tsx pattern)
  const pdfUrl = project.pdfUrl;

  const handleViewPDF = () => {
    if (!pdfUrl) return;

    if (isMobile) {
      // Mobile: Direct download (matches project-detail.tsx pattern)
      window.open(pdfUrl, '_blank');
    } else {
      // Desktop: Show PDF in modal
      setShowPDF(true);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    
    // Direct download (matches project-detail.tsx pattern)
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const MotionDialogContent = motion(DialogContent);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <MotionDialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            variants={modalTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">{project.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4"> {/* Added mt-4 for spacing */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Descripción</h4>
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="font-medium text-gray-900">Precio:</span>
                  <p className="text-caribbean font-bold">{project.price}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Ubicación:</span>
                  <p className="text-gray-600">{project.location}</p>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-900">Entrega:</span>
                <p className="text-gray-600">{project.completion}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Características Principales</h4>
              <ul className="space-y-2">
                {project.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="text-turquoise mt-1 flex-shrink-0" size={16} />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* PDF Button - Mobile: Download, Desktop: View */}
            {pdfUrl && (
              <Button 
                onClick={isMobile ? downloadPDF : handleViewPDF}
                variant="outline"
                className="flex-1"
              >
                {isMobile ? (
                  <>
                    <Download className="mr-2" size={16} />
                    Descargar PDF
                  </>
                ) : (
                  <>
                    <Eye className="mr-2" size={16} />
                    Ver PDF
                  </>
                )}
              </Button>
            )}
            <Button 
              onClick={onOpenContact}
              className="flex-1 bg-caribbean text-white hover:bg-caribbean/90"
            >
              <Calendar className="mr-2" size={16} />
              Solicitar Información
            </Button>
          </div>
        </div>
          </MotionDialogContent>
      {/* PDF Modal for Desktop - needs AnimatePresence as well */}
      <AnimatePresence>
            {showPDF && pdfUrl && (
              <Dialog open={showPDF} onOpenChange={setShowPDF}>
                <MotionDialogContent
                  className="max-w-4xl max-h-[90vh] p-6" // p-6 is default, so this is fine
                  variants={modalTransition} // Re-use same transition or define a new one
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      {project.title} - Información Detallada
                    </DialogTitle>
                    <Button
                      onClick={() => setShowPDF(false)}
                      variant="ghost"
                      className="absolute right-4 top-4 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </DialogHeader>

                  <div className="relative bg-gray-100 rounded-lg overflow-hidden mt-4"> {/* Added mt-4 */}
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[70vh] border-0"
                      title={`${project.title} - Información detallada`}
                      allow="fullscreen"
                    />

                    {/* Fallback download button */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="text-sm"
                      >
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2" size={16} />
                          Abrir en nueva pestaña
                        </a>
                      </Button>
                    </div>
                  </div>
                </MotionDialogContent>
              </Dialog>
            )}
      </AnimatePresence>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
