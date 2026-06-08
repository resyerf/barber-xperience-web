export interface Client {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  preferences?: string;
  notes?: string;
  birthDate?: string;
  receivesPromotions: boolean;
}

export interface ClientDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  preferences?: string;
  notes?: string;
  birthDate?: string;
  receivesPromotions: boolean;
}
