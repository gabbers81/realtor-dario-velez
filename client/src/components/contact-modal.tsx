import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, Calendar } from "lucide-react";
import type { ContactFormData } from "@/lib/types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendly: () => void;
}

export function ContactModal({ isOpen, onClose, onOpenCalendly }: ContactModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    phone: "",
    budget: "",
    downPayment: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest("POST", "/api/contacts", data);
    },
    onSuccess: () => {
      toast({
        title: "¡Consulta enviada!",
        description: "Te contactaremos pronto para agendar tu cita.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu consulta. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error creating contact:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      budget: "",
      downPayment: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos marcados con *",
        variant: "destructive",
      });
      return;
    }

    // Phone validation for Dominican format
    const phoneRegex = /^\+?1?\s?\(?[89]\d{2}\)?\s?\d{3}[-.\s]?\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Teléfono inválido",
        description: "Por favor ingresa un número de teléfono dominicano válido",
        variant: "destructive",
      });
      return;
    }

    createContactMutation.mutate(formData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">Contacto Directo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Nombre Completo *
            </Label>
            <Input
              id="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Tu nombre completo"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Correo Electrónico *
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@email.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Teléfono (formato dominicano) *
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (829) 123-4567"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
              Presupuesto de Inversión
            </Label>
            <Select
              value={formData.budget}
              onValueChange={(value) => setFormData({ ...formData, budget: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona tu rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80k-120k">US$80,000 - US$120,000</SelectItem>
                <SelectItem value="121k-200k">US$121,000 - US$200,000</SelectItem>
                <SelectItem value="200k+">US$200,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="downPayment" className="text-sm font-medium text-gray-700">
              Inicial Disponible (Opcional)
            </Label>
            <Select
              value={formData.downPayment}
              onValueChange={(value) => setFormData({ ...formData, downPayment: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="No especificado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10%">10%</SelectItem>
                <SelectItem value="15%">15%</SelectItem>
                <SelectItem value="20%">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-caribbean text-white hover:bg-caribbean/90"
              disabled={createContactMutation.isPending}
            >
              <Send className="mr-2" size={16} />
              {createContactMutation.isPending ? "Enviando..." : "Enviar Consulta"}
            </Button>
            
            <div className="text-center text-gray-600">o</div>
            
            <Button 
              type="button" 
              onClick={onOpenCalendly}
              className="w-full bg-turquoise text-white hover:bg-turquoise/90"
            >
              <Calendar className="mr-2" size={16} />
              Agendar Cita Directamente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
