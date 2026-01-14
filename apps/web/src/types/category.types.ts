export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  position: number;
  children?: Category[];
  _count?: {
    products: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}
