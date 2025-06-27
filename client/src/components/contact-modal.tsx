import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
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
  projectSlug?: string;
}

export function ContactModal({ isOpen, onClose, onOpenCalendly, projectSlug }: ContactModalProps) {
  const { t } = useTranslation(['common', 'contact']);
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
        title: t('contact:success.title'),
        description: t('contact:success.description'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t('general.error'),
        description: t('contact:validation.required'),
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
      whatInMind: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: t('contact:validation.required_fields'),
        description: t('contact:validation.complete_required'),
        variant: "destructive",
      });
      return;
    }

    // Phone validation for Dominican format
    const phoneRegex = /^\+?1?\s?\(?[89]\d{2}\)?\s?\d{3}[-.\s]?\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: t('contact:validation.invalid_phone'),
        description: t('contact:validation.phone_format'),
        variant: "destructive",
      });
      return;
    }

    const submissionData = { ...formData };
    if (projectSlug) {
      submissionData.projectSlug = projectSlug;
    }
    createContactMutation.mutate(submissionData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-gray-900">{t('contact:form.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
              {t('contact:form.full_name')} *
            </Label>
            <Input
              id="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder={t('contact:form.full_name_placeholder')}
              className="h-12 text-base focus:ring-2 focus:ring-caribbean"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
              {t('contact:form.email')} *
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('contact:form.email_placeholder')}
              className="h-12 text-base focus:ring-2 focus:ring-caribbean"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
              {t('contact:form.phone')} *
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (829) 334-4567"
              className="h-12 text-base focus:ring-2 focus:ring-caribbean"
            />
          </div>

          <div>
            <Label htmlFor="budget" className="text-sm font-medium text-gray-700 mb-2 block">
              {t('contact:form.budget')}
            </Label>
            <Select
              value={formData.budget}
              onValueChange={(value) => setFormData({ ...formData, budget: value })}
            >
              <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-caribbean">
                <SelectValue placeholder={t('contact:form.budget_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80k-120k">US$80k-US$120k</SelectItem>
                <SelectItem value="121k-200k">US$121k-200k</SelectItem>
                <SelectItem value="200k+">US$200k+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="downPayment" className="text-sm font-medium text-gray-700 mb-2 block">
              {t('contact:form.down_payment')}
            </Label>
            <Select
              value={formData.downPayment}
              onValueChange={(value) => setFormData({ ...formData, downPayment: value })}
            >
              <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-caribbean">
                <SelectValue placeholder={t('contact:form.down_payment_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10%">10%</SelectItem>
                <SelectItem value="15%">15%</SelectItem>
                <SelectItem value="20%">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="whatInMind" className="text-sm font-medium text-gray-700 mb-2 block">
              {t('contact:form.what_in_mind')}
            </Label>
            <textarea
              id="whatInMind"
              value={formData.whatInMind || ""}
              onChange={(e) => setFormData({ ...formData, whatInMind: e.target.value })}
              placeholder={t('contact:form.what_in_mind_placeholder')}
              className="w-full min-h-[100px] sm:min-h-[80px] px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-caribbean focus:border-transparent resize-y"
            />
          </div>

          <div className="pt-6 space-y-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-caribbean text-white hover:bg-caribbean/90 active:bg-caribbean/80 transition-colors duration-200"
              disabled={createContactMutation.isPending}
            >
              <Send className="mr-2" size={18} />
              {createContactMutation.isPending ? t('contact:form.sending') : t('contact:form.send_inquiry')}
            </Button>
            
            <div className="text-center text-gray-600 text-sm">{t('common:or')}</div>
            
            <Button 
              type="button" 
              onClick={onOpenCalendly}
              className="w-full h-12 text-base bg-turquoise text-white hover:bg-turquoise/90 active:bg-turquoise/80 transition-colors duration-200"
            >
              <Calendar className="mr-2" size={18} />
              {t('contact:form.schedule_appointment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
