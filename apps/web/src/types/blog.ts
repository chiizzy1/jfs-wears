export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  authorId?: string;
  authorName?: string;
  author?: {
    name: string;
    image?: string;
  };
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  readTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostResponse {
  data: BlogPost[];
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
}
