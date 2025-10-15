export interface Property {
  id: number;
  name: string;
  price: number;
  zone: string;
  comfort?: string;
  street: string;
  surface: number;
  registrationDate?: string;
  ownerCnp?: string;
  rooms: number;
  floor?: number;
  totalFloors?: number;
  position?: string;
  locality: string;
  operationType: string;
  propertyType: string;
  latitude?: number;
  longitude?: number;
  images?: string[] | { url: string; isPrimary: boolean; }[];
  description?: string;
  features?: string[] | string;
  agentId?: number;
  createdAt: string;
}

export interface Agent {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  zone: number;
  email?: string;
  avatar?: string;
}

export interface ClientOffer {
  id: number;
  name: string;
  email: string;
  transactionType: 'vanzare' | 'inchiriere' | 'cumparare';
  price: number;
  locality: string;
  zone: string;
  address: string;
  rooms: number;
  propertyType: string;
  surface: number;
  message: string;
  createdAt: string;
}

export interface SearchFilters {
  propertyType?: string;
  operationType?: string;
  locality?: string;
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minSurface?: number;
  maxSurface?: number;
}