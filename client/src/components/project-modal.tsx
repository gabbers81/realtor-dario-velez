import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Check, Eye, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/types";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onOpenContact: () => void;
}

export function ProjectModal({ isOpen, onClose, project, onOpenContact }: ProjectModalProps) {
  if (!project) return null;

  const [showPDF, setShowPDF] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const isMobile = useIsMobile();

  // Convert project slug to PDF filename
  const getPDFFilename = (slug: string) => {
    const pdfMap: Record<string, string> = {
      'secret-garden': 'secret-garden.pdf',
      'the-reef': 'the-reef.pdf',
      'palm-beach-residences': 'palm-beach-residences.pdf',
      'solvamar-macao': 'solvamar-macao.pdf',
      'amares-unique-homes': 'amares-unique-homes.pdf',
      'tropical-beach-3-0': 'tropical-beach-3-0.pdf',
      'las-cayas-residences': 'las-cayas-residences.pdf',
      'aura-boulevard': 'aura-boulevard.pdf'
    };
    return pdfMap[slug] || null;
  };

  const pdfFilename = getPDFFilename(project.slug);
  const pdfUrl = pdfFilename ? `/pdfs/${pdfFilename}` : null;

  const handleViewPDF = () => {
    if (!pdfUrl) {
      setPdfError(true);
      return;
    }

    if (isMobile) {
      // On mobile, directly open PDF in new window
      window.open(pdfUrl, '_blank');
    } else {
      // On desktop, show PDF in modal
      setShowPDF(true);
      setPdfLoading(true);
      setPdfError(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) {
      setPdfError(true);
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfFilename || 'brochure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePDFLoad = () => {
    setPdfLoading(false);
  };

  const handlePDFError = () => {
    setPdfLoading(false);
    setPdfError(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
            <Button 
              onClick={downloadPDF}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2" size={16} />
              Descargar PDF
            </Button>
            <Button 
              onClick={onOpenContact}
              className="flex-1 bg-caribbean text-white hover:bg-caribbean/90"
            >
              <Calendar className="mr-2" size={16} />
              Solicitar Información
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
