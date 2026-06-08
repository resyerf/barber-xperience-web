export interface Barber {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  specialties: string;
  yearsOfExperience: number;
  description?: string;
  photoUrl?: string;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  services: BarberService[];
}

export interface BarberSummary {
  id: string;
  fullName: string;
  specialties: string;
  photoUrl?: string;
  isActive: boolean;
  averageRating: number;
}

export interface BarberService {
  serviceId: string;
  serviceName: string;
  price: number;
  isActive: boolean;
}
