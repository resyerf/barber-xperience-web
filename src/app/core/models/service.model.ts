export interface ServiceCategoryDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  serviceCount: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}
