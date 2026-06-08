export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  imageUrl?: string;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  items: PackageItem[];
  totalDurationMinutes: number;
}

export interface PackageItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
}

export interface PackageDto {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  imageUrl?: string;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  items: PackageItemDto[];
  totalDurationMinutes: number;
}

export interface PackageItemDto {
  serviceId: string;
  serviceName: string;
  quantity: number;
}
