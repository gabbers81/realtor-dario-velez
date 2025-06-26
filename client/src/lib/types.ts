export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  budget: string;
  downPayment?: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: string;
  location: string;
  completion: string;
  features: string[];
  imageUrl: string;
  pdfUrl?: string;
}
